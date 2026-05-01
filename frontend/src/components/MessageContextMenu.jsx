import { useEffect, useRef } from "react";
import { Reply, Trash2, Trash, Star, Copy } from "lucide-react";

const MessageContextMenu = ({ x, y, message, isOwnMessage, onClose, onReply, onDeleteForMe, onDeleteForEveryone, onStar, onCopy }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep menu inside viewport
  const menuStyle = {
    position: "fixed",
    top: y + 8,
    left: Math.min(x, window.innerWidth - 220),
    zIndex: 1000,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-52 bg-base-100 border border-base-300 rounded-xl shadow-xl overflow-hidden
        animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Reply */}
      <button
        onClick={() => { onReply(message); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors"
      >
        <Reply size={15} className="text-zinc-400" />
        Reply
      </button>

      {/* Copy */}
      {message.text && (
        <button
          onClick={() => { onCopy(message.text); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors"
        >
          <Copy size={15} className="text-zinc-400" />
          Copy
        </button>
      )}

      {/* Star */}
      <button
        onClick={() => { onStar(message); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors"
      >
        <Star size={15} className="text-zinc-400" />
        Star message
      </button>

      {isOwnMessage && (
        <>
          <div className="border-t border-base-300 my-1" />
          {/* Delete for me */}
          <button
            onClick={() => { onDeleteForMe(message._id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200
              transition-colors text-orange-500"
          >
            <Trash size={15} />
            Delete for me
          </button>
          {/* Delete for everyone */}
          <button
            onClick={() => { onDeleteForEveryone(message._id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50
              transition-colors text-red-500"
          >
            <Trash2 size={15} />
            Delete for everyone
          </button>
        </>
      )}

      {!isOwnMessage && (
        <>
          <div className="border-t border-base-300 my-1" />
          <button
            onClick={() => { onDeleteForMe(message._id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200
              transition-colors text-orange-500"
          >
            <Trash size={15} />
            Delete for me
          </button>
        </>
      )}
    </div>
  );
};

export default MessageContextMenu;