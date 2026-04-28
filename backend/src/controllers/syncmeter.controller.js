import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

/**
 * Enhanced SyncMeter scoring algorithm
 * 
 * Computes a 0–100 "sync score" between two users based on 7 dimensions:
 * 
 *  1. Volume (25 pts)       – total message count in last 7 days
 *  2. Response Time (20 pts) – average reply speed
 *  3. Streak (15 pts)       – consecutive days of conversation
 *  4. Balance (15 pts)      – how evenly both users contribute
 *  5. Recency (10 pts)      – how recent the last exchange was
 *  6. Variety (10 pts)      – diversity of message types (text/image/voice)
 *  7. Momentum (5 pts)      – is activity trending up vs previous period?
 */
export const computeSyncScore = async (userAId, userBId) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch messages from the last 14 days for momentum comparison
  const allMessages = await Message.find({
    $or: [
      { senderId: userAId, receiverId: userBId },
      { senderId: userBId, receiverId: userAId },
    ],
    createdAt: { $gte: fourteenDaysAgo },
  }).sort({ createdAt: 1 });

  // Split into current week and previous week
  const currentWeek = allMessages.filter((m) => new Date(m.createdAt) >= sevenDaysAgo);
  const previousWeek = allMessages.filter(
    (m) => new Date(m.createdAt) < sevenDaysAgo && new Date(m.createdAt) >= fourteenDaysAgo
  );

  if (currentWeek.length === 0) return { score: 0, breakdown: null };

  // ── 1. Volume Score (max 25) ────────────────────────────────────
  // Logarithmic scaling: fast ramp for first messages, plateaus at ~50
  const volumeRaw = Math.min(1, Math.log(currentWeek.length + 1) / Math.log(51));
  const volumeScore = volumeRaw * 25;

  // ── 2. Response Time Score (max 20) ─────────────────────────────
  const responseTimes = [];
  for (let i = 1; i < currentWeek.length; i++) {
    const prev = currentWeek[i - 1];
    const curr = currentWeek[i];
    // Only count alternating senders (actual replies)
    if (prev.senderId.toString() !== curr.senderId.toString()) {
      const diffMinutes = (new Date(curr.createdAt) - new Date(prev.createdAt)) / 60000;
      responseTimes.push(Math.min(diffMinutes, 120)); // cap at 2 hours
    }
  }

  let responseScore = 0;
  if (responseTimes.length > 0) {
    const avgResponse = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
    // Exponential decay: instant replies = 20, 5min = ~18, 30min = ~10, 2hr = ~2
    responseScore = 20 * Math.exp(-avgResponse / 30);
  }

  // ── 3. Streak Score (max 15) ────────────────────────────────────
  const activeDays = new Set(
    currentWeek.map((m) => new Date(m.createdAt).toDateString())
  );

  let streak = 0;
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    if (!activeDays.has(day.toDateString())) break;
    streak++;
  }

  // Quadratic scaling: rewards longer streaks more heavily
  const streakScore = Math.pow(streak / 7, 1.5) * 15;

  // ── 4. Balance Score (max 15) ───────────────────────────────────
  // Perfect 50/50 split = max score, 100/0 = zero
  const userAStr = userAId.toString();
  const sentByA = currentWeek.filter((m) => m.senderId.toString() === userAStr).length;
  const sentByB = currentWeek.length - sentByA;
  const total = currentWeek.length;

  let balanceScore = 0;
  if (total > 0) {
    const ratio = Math.min(sentByA, sentByB) / Math.max(sentByA, sentByB);
    // ratio: 0 = one-sided, 1 = perfect balance
    balanceScore = ratio * 15;
  }

  // ── 5. Recency Score (max 10) ──────────────────────────────────
  // How recently was the last message sent?
  const lastMessage = currentWeek[currentWeek.length - 1];
  const hoursSinceLastMsg = (now - new Date(lastMessage.createdAt)) / (1000 * 60 * 60);
  // Exponential decay: just now = 10, 6hr ago = ~8, 24hr = ~4, 3 days = ~0
  const recencyScore = 10 * Math.exp(-hoursSinceLastMsg / 18);

  // ── 6. Variety Score (max 10) ──────────────────────────────────
  // Bonus for using different message types (text, image, voice)
  const hasText = currentWeek.some((m) => m.text && m.text.trim());
  const hasImage = currentWeek.some((m) => m.image);
  const hasVoice = currentWeek.some((m) => m.voice);
  const typesUsed = [hasText, hasImage, hasVoice].filter(Boolean).length;
  // 1 type = 3.3, 2 types = 6.6, 3 types = 10
  const varietyScore = (typesUsed / 3) * 10;

  // ── 7. Momentum Score (max 5) ──────────────────────────────────
  // Is this week more active than last week?
  let momentumScore = 2.5; // neutral baseline
  if (previousWeek.length > 0) {
    const growth = currentWeek.length / previousWeek.length;
    if (growth >= 2) momentumScore = 5;       // doubled activity
    else if (growth >= 1.2) momentumScore = 4; // growing
    else if (growth >= 0.8) momentumScore = 3; // stable
    else if (growth >= 0.5) momentumScore = 1.5; // declining
    else momentumScore = 0;                      // crashed
  } else {
    // No previous week data — new connection bonus
    momentumScore = 4;
  }

  // ── Total ──────────────────────────────────────────────────────
  const rawTotal = volumeScore + responseScore + streakScore +
    balanceScore + recencyScore + varietyScore + momentumScore;
  const score = Math.min(100, Math.max(0, Math.round(rawTotal)));

  const breakdown = {
    volume: Math.round(volumeScore * 10) / 10,
    responseTime: Math.round(responseScore * 10) / 10,
    streak: Math.round(streakScore * 10) / 10,
    balance: Math.round(balanceScore * 10) / 10,
    recency: Math.round(recencyScore * 10) / 10,
    variety: Math.round(varietyScore * 10) / 10,
    momentum: Math.round(momentumScore * 10) / 10,
  };

  return { score, breakdown };
};

export const getSyncScore = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "UserId missing" });
    }

    // ObjectId safety — prevent CastError
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    // Verify target is in caller's contacts
    const me = await User.findById(req.user._id).select("contacts");
    if (!me.contacts.some((c) => c.toString() === userId)) {
      return res.json({ score: 0, label: "Not Connected", breakdown: null });
    }

    const { score, breakdown } = await computeSyncScore(req.user._id, userId);

    let label = "Low Sync";
    if (score >= 70) {
      label = "Highly Synced 🔥";
    } else if (score >= 30) {
      label = "In Sync ⚡";
    } else {
      label = "Low Sync 💤";
    }

    return res.json({ score, label, breakdown });
  } catch (error) {
    console.error("Error in getSyncScore:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
