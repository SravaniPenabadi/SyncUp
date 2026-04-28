// frontend/src/components/MessageBubble.jsx  (NEW — extracted from ChatContainer)
import { Trash2 } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

/**
 * Renders a single chat message bubble.
 *
 * Props:
 *   message      – message object from DB
 *   isOwn        – bool: sent by current user?
 *   senderPic    – avatar URL for the sender
 *   onDelete     – callback(messageId) — only shown when isOwn
 */
const MessageBubble = ({ message, isOwn, senderPic, onDelete }) => {
  return (
    <div
      className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      style={{ animation: "bubbleIn 0.2s ease-out" }}
    >
      {/* Avatar */}
      <img
        src={senderPic || "/avatar.png"}
        alt="avatar"
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
      />

      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Timestamp */}
        <span className="text-[10px] px-1" style={{ color: "#475569" }}>
          {formatMessageTime(message.createdAt)}
        </span>

        {/* Bubble */}
        <div
          className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          style={
            isOwn
              ? {
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "#fff",
                  borderBottomRightRadius: "4px",
                  boxShadow: "0 2px 12px rgba(99,102,241,0.25)",
                }
              : {
                  background: "#1e293b",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderBottomLeftRadius: "4px",
                }
          }
        >
          {message.image && (
            <img
              src={message.image}
              alt="attachment"
              className="max-w-[200px] rounded-xl mb-2 block"
            />
          )}
          {message.voice && (
            <audio controls src={message.voice} className="max-w-[200px]" />
          )}
          {message.text && <p>{message.text}</p>}
        </div>

        {/* Delete — only own messages, shows on hover */}
        {isOwn && (
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: message.seen ? "#22c55e" : "#64748b" }}>
              {message.seen ? "Seen" : "Sent"}
            </span>
            <button
              onClick={() => onDelete(message._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px]"
              style={{ color: "#ef444480" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ef444480")}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
