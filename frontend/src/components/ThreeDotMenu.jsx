import { useEffect, useRef, useState } from "react";
import {
  MoreVertical, Users, UserPlus, Archive,
  Star, CheckSquare, CheckCheck, X,
} from "lucide-react";
import NewGroupModal from "./modals/NewGroupModal";
import AddContactModal from "./modals/AddContactModal";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const MENU_ITEMS = [
  { id: "new-group",      label: "New Group",         icon: Users },
  { id: "add-contact",    label: "Add Contact",        icon: UserPlus },
  { id: "archived",       label: "Archived",           icon: Archive },
  { id: "starred",        label: "Starred Messages",   icon: Star },
  { id: "select-chats",   label: "Select Chats",       icon: CheckSquare },
  { id: "mark-all-read",  label: "Mark all as read",   icon: CheckCheck },
];

const ThreeDotMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showStarred, setShowStarred] = useState(false);
  const menuRef = useRef(null);
  const { starredMessages, getStarredMessages, users, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (id) => {
    setOpen(false);
    if (id === "new-group" || id === "add-contact") {
      setActiveModal(id);
    } else if (id === "starred") {
      getStarredMessages();
      setShowStarred(true);
    } else if (id === "mark-all-read") {
      // Mark all messages as seen
      users.forEach((user) => {
        useChatStore.getState().markMessagesAsSeen?.(user._id);
      });
      toast.success("All marked as read");
    } else if (id === "archived") {
      toast("Archived feature coming soon!", { icon: "📦" });
    } else if (id === "select-chats") {
      toast("Select Chats feature coming soon!", { icon: "☑️" });
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="btn btn-ghost btn-sm btn-circle"
          title="More options"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-50 w-52 bg-base-100 border
            border-base-300 rounded-xl shadow-lg overflow-hidden">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleMenuClick(id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  hover:bg-base-200 transition-colors text-left"
              >
                <Icon size={16} className="text-zinc-400" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal === "new-group" && (
        <NewGroupModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "add-contact" && (
        <AddContactModal onClose={() => setActiveModal(null)} />
      )}

      {/* Starred Messages Modal */}
      {showStarred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star size={18} className="text-yellow-400" />
                Starred Messages
              </h2>
              <button
                onClick={() => setShowStarred(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {starredMessages.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">
                  <Star className="mx-auto mb-2 opacity-30 size-8" />
                  <p className="text-sm">No starred messages yet</p>
                  <p className="text-xs mt-1">Right-click a message to star it</p>
                </div>
              ) : (
                starredMessages.map((msg) => (
                  <div key={msg._id} className="bg-base-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={msg.senderId?.profilePic || "/avatar.png"}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs font-medium">
                        {msg.senderId?.fullName}
                      </span>
                      <span className="text-xs text-zinc-400 ml-auto">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                    {msg.image && (
                      <img src={msg.image} className="w-24 h-24 object-cover rounded-lg mt-1" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThreeDotMenu;