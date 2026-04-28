// frontend/src/components/Sidebar.jsx  (UPGRADED)
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Trash2 } from "lucide-react";
import ThreeDotMenu from "./ThreeDotMenu";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, deleteContact } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { getUsers(); }, [getUsers]);

  const filteredUsers = users
    .filter((u) => (showOnlineOnly ? onlineUsers.includes(u._id) : true))
    .filter((u) => u.fullName.toLowerCase().includes(search.toLowerCase()));

  const onlineCount = users.filter((u) => onlineUsers.includes(u._id)).length;

  const handleDeleteClick = (e, userId) => {
    e.stopPropagation();
    setConfirmDeleteId(userId);
  };
  const handleConfirmDelete = async (e, userId) => {
    e.stopPropagation();
    await deleteContact(userId);
    setConfirmDeleteId(null);
  };
  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className="h-full w-16 lg:w-72 flex flex-col transition-all duration-200"
      style={{ background: "#1e293b", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="p-4 space-y-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: "#6366f1" }} />
            <span className="hidden lg:block text-sm font-semibold" style={{ color: "#e2e8f0" }}>
              Messages
            </span>
          </div>
          <div className="hidden lg:block">
            <ThreeDotMenu />
          </div>
        </div>

        {/* Search */}
        <div
          className="hidden lg:flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "#0f172a" }}
        >
          <Search size={14} style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full placeholder-slate-500"
            style={{ color: "#e2e8f0" }}
          />
        </div>

        {/* Online toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: "#94a3b8" }}>
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs"
              style={{ accentColor: "#6366f1" }}
            />
            Online only
          </label>
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e40" }}
          >
            {onlineCount} online
          </span>
        </div>
      </div>

      {/* ── Contact List ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <div key={user._id} className="relative group">
              <button
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.15)" : "transparent",
                  border: isSelected ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: "#22c55e", borderColor: "#1e293b" }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: "#e2e8f0" }}>
                    {user.fullName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: isOnline ? "#22c55e" : "#94a3b8" }}>
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </button>

              {/* Delete */}
              {confirmDeleteId !== user._id ? (
                <button
                  onClick={(e) => handleDeleteClick(e, user._id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex
                    items-center justify-center p-1.5 rounded-lg transition-colors"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Trash2 size={13} />
                </button>
              ) : (
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleConfirmDelete(e, user._id)}
                    className="text-[10px] px-2 py-1 rounded-lg text-white transition-colors"
                    style={{ background: "#ef4444" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: "#475569" }}>
            No contacts found
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
