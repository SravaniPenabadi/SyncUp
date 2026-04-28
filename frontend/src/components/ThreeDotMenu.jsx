import { useEffect, useRef, useState } from "react";
import {
  MoreVertical, Users, UserPlus, Archive,
  Star, CheckSquare, CheckCheck,
} from "lucide-react";
import NewGroupModal from "./modals/NewGroupModal";
import AddContactModal from "./modals/AddContactModal";

const MENU_ITEMS = [
  { id: "new-group",        label: "New Group",          icon: Users },
  { id: "add-contact",      label: "Add Contact",        icon: UserPlus },
  { id: "archived",         label: "Archived",           icon: Archive },
  { id: "starred",          label: "Starred Messages",   icon: Star },
  { id: "select-chats",     label: "Select Chats",       icon: CheckSquare },
  { id: "mark-all-read",    label: "Mark all as read",   icon: CheckCheck },
];

const ThreeDotMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
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
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* 3-dot button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
          title="More options"
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-9 z-50 w-52 rounded-xl overflow-hidden"
            style={{
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              animation: "menuFadeIn 0.15s ease-out",
            }}
          >
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleMenuClick(id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: "#e2e8f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon size={16} style={{ color: "#94a3b8" }} />
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