export const MOOD_THEMES = {
  happy: {
    name: "Happy", emoji: "😊",
    bg: "bg-yellow-50/30",
    bubble: "bg-yellow-400 text-black",
    glow: "shadow-yellow-200",
    particles: true,
    particleEmoji: ["🎉", "✨", "⭐", "🌟", "💫"],
    label: "Feeling Happy! 🌟",
  },
  sad: {
    name: "Sad", emoji: "😢",
    bg: "bg-blue-50/30",
    bubble: "bg-blue-400 text-white",
    glow: "shadow-blue-200",
    particles: false,
    label: "Feeling Sad 💙",
  },
  angry: {
    name: "Angry", emoji: "😡",
    bg: "bg-red-50/30",
    bubble: "bg-red-500 text-white",
    glow: "shadow-red-200",
    particles: false,
    label: "Feeling Angry 🔥",
  },
  romantic: {
    name: "Romantic", emoji: "🥰",
    bg: "bg-pink-50/30",
    bubble: "bg-pink-400 text-white",
    glow: "shadow-pink-200",
    particles: true,
    particleEmoji: ["❤️", "💕", "💖", "🌹", "💋"],
    label: "Feeling Romantic 💕",
  },
  excited: {
    name: "Excited", emoji: "🤩",
    bg: "bg-violet-50/30",
    bubble: "bg-violet-500 text-white",
    glow: "shadow-violet-200",
    particles: true,
    particleEmoji: ["⚡", "🚀", "💫", "🌈", "🔥"],
    label: "Feeling Excited ⚡",
  },
  neutral: {
    name: "Neutral", emoji: "💬",
    bg: "", bubble: "", glow: "",
    particles: false, label: "",
  },
};

const MOOD_EMOJIS = {
  happy: ["😊","😄","😁","😂","🤣","😃","😀","🥳","😎","🎉","✨","💯","🔥","👏","🌟"],
  sad: ["😢","😭","😔","😞","😟","🥺","💔","😿","🙁","☹️","😣","😩","😫"],
  angry: ["😡","🤬","😤","👿","💢","😠","😾","💀","☠️"],
  romantic: ["🥰","😍","💕","❤️","💖","💗","💓","💞","💘","😘","💋","🌹","💑","👫"],
  excited: ["🤩","🥳","🎊","🎉","⚡","🚀","💫","🌈"],
};

export const detectMood = (messages, authUserId) => {
  const recentMessages = messages
    .filter((m) => m.senderId === authUserId)
    .slice(-20);

  const counts = { happy: 0, sad: 0, angry: 0, romantic: 0, excited: 0 };

  recentMessages.forEach((msg) => {
    if (!msg.text) return;
    Object.entries(MOOD_EMOJIS).forEach(([mood, emojis]) => {
      emojis.forEach((emoji) => {
        if (msg.text.includes(emoji)) counts[mood]++;
      });
    });
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return "neutral";
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};