import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { detectMood, MOOD_THEMES } from "../lib/moodDetector";
import ParticleEffect from "./ParticleEffect";
import MessageContextMenu from "./MessageContextMenu";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages, getMessages, isMessagesLoading, selectedUser,
    subscribeToMessages, unsubscribeFromMessages,
    deleteMessageForMe, deleteMessageForEveryone,
    markMessagesAsSeen, setReplyTo, starMessage,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [mood, setMood] = useState("neutral");
  const [otherMood, setOtherMood] = useState("neutral");
  const [showMoodBanner, setShowMoodBanner] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  // { x, y, message }

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    markMessagesAsSeen(selectedUser._id);
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessagesAsSeen]);

  // Socket: listen for mood + deleted for everyone
  useEffect(() => {
    if (!socket) return;

    socket.on("moodUpdate", ({ senderId, mood: incomingMood }) => {
      if (senderId === selectedUser._id) setOtherMood(incomingMood);
    });

    socket.on("messageDeletedForEveryone", ({ messageId }) => {
      useChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, text: null, image: null, voice: null, deletedForEveryone: true }
            : m
        ),
      }));
    });

    return () => {
      socket.off("moodUpdate");
      socket.off("messageDeletedForEveryone");
    };
  }, [socket, selectedUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (messages.length > 0) {
      const detectedMood = detectMood(messages, authUser._id);
      if (detectedMood !== mood) {
        setMood(detectedMood);
        if (detectedMood !== "neutral") {
          setShowMoodBanner(true);
          setTimeout(() => setShowMoodBanner(false), 3000);
          socket?.emit("moodUpdate", {
            receiverId: selectedUser._id,
            mood: detectedMood,
          });
        }
      }
    }
  }, [messages]);

  const activeMood = otherMood !== "neutral" ? otherMood : mood;
  const theme = MOOD_THEMES[activeMood] || MOOD_THEMES.neutral;

  const lastSeenIndex = messages
    .map((m, i) => (m.senderId === authUser._id && m.seen ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader mood={mood} theme={theme} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader mood={mood} theme={theme} />

      {/* Mood banner */}
      {showMoodBanner && mood !== "neutral" && (
        <div className={`mx-4 mt-2 px-4 py-1.5 rounded-full text-center text-sm
          font-medium shadow-sm z-10 ${theme.bubble}`}>
          {theme.label}
        </div>
      )}

      {/* Messages area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 relative
        transition-colors duration-700
        ${activeMood !== "neutral" ? theme.bg : ""}`}>

        {/* ✅ Particle effect for happy/romantic/excited */}
        {theme.particles && activeMood !== "neutral" && (
          <ParticleEffect emojis={theme.particleEmoji} />
        )}

        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            onContextMenu={(e) => handleContextMenu(e, message)}
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

            {/* Reply preview */}
            {message.replyTo && (
              <div className="text-xs bg-base-200 rounded-lg px-3 py-1.5 mb-1
                border-l-4 border-primary opacity-70 max-w-[200px] truncate">
                ↩ Replying to a message
              </div>
            )}

            <div className={`chat-bubble flex flex-col relative z-10
              ${message.senderId === authUser._id && activeMood !== "neutral"
                ? `${theme.bubble} ${theme.glow} shadow-lg` : ""}
              ${message.deletedForEveryone ? "opacity-50 italic" : ""}`}>
              {message.deletedForEveryone ? (
                <p className="text-xs">🚫 This message was deleted</p>
              ) : (
                <>
                  {message.image && (
                    <img src={message.image} alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2" />
                  )}
                  {message.voice && (
                    <audio controls src={message.voice} className="max-w-[200px]" />
                  )}
                  {message.text && <p>{message.text}</p>}
                </>
              )}
            </div>

            {message.senderId === authUser._id && index === lastSeenIndex && (
              <div className="text-[11px] text-primary mt-0.5 text-right pr-1">
                Seen
              </div>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Reply bar */}
      <ReplyBar />

      <MessageInput />

      {/* Context menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isOwnMessage={contextMenu.message.senderId === authUser._id}
          onClose={() => setContextMenu(null)}
          onReply={(msg) => setReplyTo(msg)}
          onDeleteForMe={(id) => deleteMessageForMe(id)}
          onDeleteForEveryone={(id) => deleteMessageForEveryone(id)}
          onStar={(msg) => starMessage(msg._id)}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
};

// Reply bar shows when replying
const ReplyBar = () => {
  const { replyTo, clearReplyTo } = useChatStore();
  if (!replyTo) return null;

  return (
    <div className="px-4 py-2 bg-base-200 border-t border-base-300 flex items-center
      justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-1 h-8 bg-primary rounded-full flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-primary">Replying</p>
          <p className="text-xs text-zinc-400 truncate">
            {replyTo.text || (replyTo.image ? "📷 Photo" : "🎤 Voice")}
          </p>
        </div>
      </div>
      <button onClick={clearReplyTo} className="btn btn-ghost btn-xs btn-circle">
        ✕
      </button>
    </div>
  );
};

export default ChatContainer;