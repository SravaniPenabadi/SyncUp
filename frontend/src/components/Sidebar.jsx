import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Trash2 } from "lucide-react";
import ThreeDotMenu from "./ThreeDotMenu";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    deleteContact,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

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
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">

      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <div className="hidden lg:block">
            <ThreeDotMenu />
          </div>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="relative group">
            <button
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>

              {/* Name & status */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>

            {/* Delete button — shows on hover */}
            {confirmDeleteId !== user._id ? (
              <button
                onClick={(e) => handleDeleteClick(e, user._id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex
                  items-center justify-center p-1.5 rounded-full hover:bg-red-500/10
                  text-zinc-400 hover:text-red-500 transition-colors"
                title="Delete contact"
              >
                <Trash2 size={15} />
              </button>
            ) : (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleConfirmDelete(e, user._id)}
                  className="text-[11px] px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="text-[11px] px-2 py-1 rounded bg-base-200 hover:bg-base-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;