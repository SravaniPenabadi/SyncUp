import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { detectMood, MOOD_THEMES } from "../lib/moodDetector";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    markMessagesAsSeen,
    deleteContact,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [mood, setMood] = useState("neutral");
  const [showMoodBanner, setShowMoodBanner] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    markMessagesAsSeen(selectedUser._id);
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessagesAsSeen]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // ✅ Auto detect mood from messages
    if (messages.length > 0) {
      const detectedMood = detectMood(messages, authUser._id);
      if (detectedMood !== mood) {
        setMood(detectedMood);
        if (detectedMood !== "neutral") {
          setShowMoodBanner(true);
          setTimeout(() => setShowMoodBanner(false), 3000);
        }
      }
    }
  }, [messages]);

  const theme = MOOD_THEMES[mood] || MOOD_THEMES.neutral;

  const lastSeenIndex = messages
    .map((m, i) => (m.senderId === authUser._id && m.seen ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-auto transition-all duration-500 ${theme.bg}`}>
      {/* Chat Header with mood-aware border */}
      <div className={mood !== "neutral" ? theme.header : ""}>
        <ChatHeader mood={mood} theme={theme} />
      </div>

      {/* ✅ Mood banner — shows briefly when mood changes */}
      {showMoodBanner && mood !== "neutral" && (
        <div className={`mx-4 mt-2 px-4 py-2 rounded-full text-center text-sm font-medium
          shadow-sm transition-all duration-300 ${theme.bubble}`}>
          {theme.label}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* ✅ Mood-colored bubble for sent messages */}
            <div className={`chat-bubble flex flex-col
              ${message.senderId === authUser._id && mood !== "neutral"
                ? theme.bubble
                : ""}`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.voice && (
                <audio controls src={message.voice} className="max-w-[200px]" />
              )}
              {message.text && <p>{message.text}</p>}
            </div>

            {/* Seen indicator */}
            {message.senderId === authUser._id && index === lastSeenIndex && (
              <div className="text-[11px] text-primary mt-0.5 text-right pr-1">
                Seen
              </div>
            )}

            {/* Delete message button */}
            {message.senderId === authUser._id && (
              <button
                onClick={() => deleteMessage(message._id)}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;