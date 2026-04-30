import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Users2, X, Image, Send } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    setSelectedGroup,
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    deleteGroupMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup._id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const Header = () => (
    <div className="p-2.5 border-b border-base-300 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {selectedGroup.groupImage ? (
            <img
              src={selectedGroup.groupImage}
              alt={selectedGroup.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users2 className="size-5 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{selectedGroup.name}</h3>
          <p className="text-xs text-base-content/70">
            {selectedGroup.members.length} members
          </p>
        </div>
      </div>
      <button onClick={() => setSelectedGroup(null)}>
        <X />
      </button>
    </div>
  );

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <Header />
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <Header />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.length === 0 && (
          <div className="text-center text-zinc-400 py-8">
            <Users2 className="mx-auto mb-2 opacity-30 size-8" />
            <p className="text-sm">No messages yet. Say hi! 👋</p>
          </div>
        )}

        {groupMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId._id === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId.profilePic || "/avatar.png"}
                  alt={message.senderId.fullName}
                />
              </div>
            </div>

            <div className="chat-header mb-1 flex items-center gap-2">
              {message.senderId._id !== authUser._id && (
                <span className="text-xs font-medium text-primary">
                  {message.senderId.fullName}
                </span>
              )}
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
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

            {/* ✅ Delete button for own messages */}
            {message.senderId._id === authUser._id && (
              <button
                onClick={() => deleteGroupMessage(message._id)}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <GroupMessageInput />
    </div>
  );
};

const GroupMessageInput = () => {
  const { sendGroupMessage } = useChatStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    await sendGroupMessage({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 w-full border-t border-base-300">
      {imagePreview && (
        <div className="mb-3">
          <div className="relative inline-block">
            <img src={imagePreview} className="w-20 h-20 object-cover rounded-lg" />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Message group..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          type="button"
          className="btn btn-circle text-zinc-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default GroupChatContainer;