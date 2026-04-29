import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Trash2, Users2 } from "lucide-react";
import ThreeDotMenu from "./ThreeDotMenu";

const Sidebar = () => {
  const {
    getUsers, users, selectedUser, setSelectedUser,
    isUsersLoading, deleteContact,
    getGroups, groups, selectedGroup, setSelectedGroup,
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("chats");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { getUsers(); }, [getUsers]);
  useEffect(() => { getGroups(); }, [getGroups]);

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

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">

      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <span className="font-medium hidden lg:block">Messages</span>
          </div>
          <div className="hidden lg:block">
            <ThreeDotMenu />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 hidden lg:flex rounded-lg bg-base-200 p-1 gap-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors
              ${activeTab === "chats" ? "bg-base-100 shadow-sm" : "hover:bg-base-300"}`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors
              ${activeTab === "groups" ? "bg-base-100 shadow-sm" : "hover:bg-base-300"}`}
          >
            Groups
          </button>
        </div>

        {/* Online filter — only for chats tab */}
        {activeTab === "chats" && (
          <div className="mt-2 hidden lg:flex items-center gap-2">
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
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto w-full py-3">

        {/* ── CHATS TAB ── */}
        {activeTab === "chats" && (
          <>
            {isUsersLoading ? (
              <SidebarSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-zinc-500 py-8 px-4">
                <Users className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No contacts yet</p>
                <p className="text-xs mt-1 text-zinc-400">
                  Use the menu to add contacts
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="relative group">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                      ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                  >
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
                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className="font-medium truncate">{user.fullName}</div>
                      <div className="text-sm text-zinc-400">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                  </button>

                  {/* Delete button */}
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
              ))
            )}
          </>
        )}

        {/* ── GROUPS TAB ── */}
        {activeTab === "groups" && (
          <>
            {isGroupsLoading ? (
              <SidebarSkeleton />
            ) : groups.length === 0 ? (
              <div className="text-center text-zinc-500 py-8 px-4">
                <Users2 className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No groups yet</p>
                <p className="text-xs mt-1 text-zinc-400">
                  Use the menu to create a group
                </p>
            </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                    ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    {group.groupImage ? (
                      <img
                        src={group.groupImage}
                        alt={group.name}
                        className="size-12 object-cover rounded-full"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users2 className="size-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-xs text-zinc-400 truncate">
                      {group.lastMessage || `${group.members.length} members`}
                    </div>
                  </div>
                </button>
              ))
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;