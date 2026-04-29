// Emoji to mood mapping
const MOOD_EMOJIS = {
  happy: ["😊", "😄", "😁", "😂", "🤣", "😃", "😀", "🥳", "😎", "🎉", "✨", "💯", "🔥", "👏", "🌟"],
  sad: ["😢", "😭", "😔", "😞", "😟", "🥺", "💔", "😿", "🙁", "☹️", "😣", "😩", "😫"],
  angry: ["😡", "🤬", "😤", "👿", "💢", "😠", "🖕", "😾", "💀", "☠️"],
  romantic: ["🥰", "😍", "💕", "❤️", "💖", "💗", "💓", "💞", "💘", "😘", "💋", "🌹", "💑", "👫"],
  excited: ["🤩", "🥳", "🎊", "🎉", "⚡", "🚀", "💫", "🌈"],
};

// Mood to chat theme mapping
export const MOOD_THEMES = {
  happy: {
    name: "Happy",
    emoji: "😊",
    bg: "bg-gradient-to-b from-yellow-50 to-orange-50",
    bubble: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white",
    header: "bg-gradient-to-r from-yellow-100 to-orange-100",
    border: "border-orange-200",
    label: "Feeling Happy! 🌟",
  },
  sad: {
    name: "Sad",
    emoji: "😢",
    bg: "bg-gradient-to-b from-blue-50 to-slate-100",
    bubble: "bg-gradient-to-r from-blue-400 to-slate-500 text-white",
    header: "bg-gradient-to-r from-blue-100 to-slate-100",
    border: "border-blue-200",
    label: "Feeling Sad 💙",
  },
  angry: {
    name: "Angry",
    emoji: "😡",
    bg: "bg-gradient-to-b from-red-50 to-gray-900",
    bubble: "bg-gradient-to-r from-red-500 to-red-800 text-white",
    header: "bg-gradient-to-r from-red-100 to-red-200",
    border: "border-red-300",
    label: "Feeling Angry 🔥",
  },
  romantic: {
    name: "Romantic",
    emoji: "🥰",
    bg: "bg-gradient-to-b from-pink-50 to-purple-50",
    bubble: "bg-gradient-to-r from-pink-400 to-purple-500 text-white",
    header: "bg-gradient-to-r from-pink-100 to-purple-100",
    border: "border-pink-200",
    label: "Feeling Romantic 💕",
  },
  excited: {
    name: "Excited",
    emoji: "🤩",
    bg: "bg-gradient-to-b from-violet-50 to-cyan-50",
    bubble: "bg-gradient-to-r from-violet-500 to-cyan-500 text-white",
    header: "bg-gradient-to-r from-violet-100 to-cyan-100",
    border: "border-violet-200",
    label: "Feeling Excited ⚡",
  },
  neutral: {
    name: "Neutral",
    emoji: "💬",
    bg: "",
    bubble: "",
    header: "",
    border: "",
    label: "",
  },
};

export const detectMood = (messages, authUserId) => {
  // Only look at last 20 messages from current user
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

  // Return dominant mood
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};