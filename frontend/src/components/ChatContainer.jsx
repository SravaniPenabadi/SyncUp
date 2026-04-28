import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageBubble from "./MessageBubble";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    markMessagesAsSeen,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!selectedUser?._id) return undefined;

    setIsTyping(false);
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (!selectedUser?._id || !authUser?._id || messages.length === 0) return;

    const hasUnreadIncoming = messages.some(
      (message) =>
        (message.senderId?.toString?.() ?? message.senderId) === selectedUser._id &&
        (message.receiverId?.toString?.() ?? message.receiverId) === authUser._id &&
        !message.seen
    );

    if (hasUnreadIncoming) {
      markMessagesAsSeen(selectedUser._id);
    }
  }, [messages, selectedUser?._id, authUser?._id, markMessagesAsSeen]);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Typing indicator from other user
  useEffect(() => {
    if (!socket || !selectedUser?._id) return undefined;

    const handleTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(true);
    };
    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser?._id]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col" style={{ background: "#0f172a" }}>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#0f172a" }}>
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={(message.senderId?.toString?.() ?? message.senderId) === authUser._id}
            senderPic={
              (message.senderId?.toString?.() ?? message.senderId) === authUser._id
                ? authUser.profilePic
                : selectedUser.profilePic
            }
            onDelete={deleteMessage}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt="typing"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div
              className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm"
              style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="flex gap-1 items-center" style={{ color: "#94a3b8" }}>
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
