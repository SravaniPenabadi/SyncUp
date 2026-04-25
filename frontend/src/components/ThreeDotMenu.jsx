import { useEffect, useRef, useState } from "react";
import {
  MoreVertical, Users, UserPlus, Archive,
  Star, CheckSquare, CheckCheck,
} from "lucide-react";
import NewGroupModal from "./modals/NewGroupModal";
import AddContactModal from "./modals/AddContactModal";

const MENU_ITEMS = [
  { id: "new-group",        label: "New Group",          icon: Users },
  { id: "add-contact",      label: "Add Contact",         icon: UserPlus },
  { id: "archived",         label: "Archived",            icon: Archive },
  { id: "starred",          label: "Starred Messages",    icon: Star },
  { id: "select-chats",     label: "Select Chats",        icon: CheckSquare },
  { id: "mark-all-read",    label: "Mark all as read",    icon: CheckCheck },
];

const ThreeDotMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "new-group" | "add-contact"
  const menuRef = useRef(null);

  // Close on outside click
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
    }
    // other items can be wired up later
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* 3-dot button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="btn btn-ghost btn-sm btn-circle"
          title="More options"
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-9 z-50 w-52 bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleMenuClick(id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-base-200 transition-colors text-left"
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
    </>
  );
};

export default ThreeDotMenu;