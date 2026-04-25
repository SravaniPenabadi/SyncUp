
// // import { useEffect, useState } from "react";
// // import { useChatStore } from "../store/useChatStore";
// // import { useAuthStore } from "../store/useAuthStore";
// // import SidebarSkeleton from "./skeletons/SidebarSkeleton";

// // const Sidebar = () => {
// //   const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
// //   const { onlineUsers } = useAuthStore();
// //   const [showOnlineOnly, setShowOnlineOnly] = useState(false);
// //   const [search, setSearch] = useState("");

// //   useEffect(() => { getUsers(); }, [getUsers]);

// //   const filteredUsers = users
// //     .filter((u) => showOnlineOnly ? onlineUsers.includes(u._id) : true)
// //     .filter((u) => u.fullName.toLowerCase().includes(search.toLowerCase()));

// //   const onlineList = filteredUsers.filter((u) => onlineUsers.includes(u._id));
// //   const offlineList = filteredUsers.filter((u) => !onlineUsers.includes(u._id));

// //   if (isUsersLoading) return <SidebarSkeleton />;

// //   const ContactItem = ({ user }) => (
// //     <button
// //       onClick={() => setSelectedUser(user)}
// //       className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
// //         ${selectedUser?._id === user._id ? "bg-base-200" : "hover:bg-base-200"}`}
// //     >
// //       <div className="relative flex-shrink-0">
// //         <img
// //           src={user.profilePic || "/avatar.png"}
// //           alt={user.fullName}
// //           className="w-10 h-10 rounded-full object-cover border border-base-300"
// //         />
// //         {onlineUsers.includes(user._id) && (
// //           <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-base-100" />
// //         )}
// //       </div>
// //       <div className="flex-1 min-w-0 text-left hidden lg:block">
// //         <p className="text-sm font-medium truncate">{user.fullName}</p>
// //         <p className={`text-xs mt-0.5 ${onlineUsers.includes(user._id) ? "text-green-500" : "text-zinc-400"}`}>
// //           {onlineUsers.includes(user._id) ? "Online" : "Offline"}
// //         </p>
// //       </div>
// //     </button>
// //   );

// //   return (
// //     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col">
// //       {/* Header */}
// //       <div className="p-4 border-b border-base-300 space-y-3">
// //         <p className="hidden lg:block text-xs font-medium text-zinc-400 uppercase tracking-widest">
// //           Messages
// //         </p>

// //         {/* Search */}
// //         <div className="hidden lg:flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2 border border-base-300">
// //           <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
// //             <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l2.5 2.5"/>
// //           </svg>
// //           <input
// //             type="text"
// //             placeholder="Search contacts…"
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             className="bg-transparent text-sm outline-none w-full placeholder-zinc-400"
// //           />
// //         </div>

// //         {/* Online toggle */}
// //         <div className="hidden lg:flex items-center gap-2">
// //           <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
// //           <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400">
// //             <input
// //               type="checkbox"
// //               checked={showOnlineOnly}
// //               onChange={(e) => setShowOnlineOnly(e.target.checked)}
// //               className="checkbox checkbox-xs"
// //             />
// //             Show online only
// //           </label>
// //           <span className="ml-auto text-xs text-zinc-500 bg-base-200 border border-base-300 rounded-full px-2 py-0.5">
// //             {onlineUsers.length} online
// //           </span>
// //         </div>
// //       </div>

// //       {/* Contacts */}
// //       <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
// //         {onlineList.length > 0 && (
// //           <>
// //             <p className="hidden lg:block text-xs font-medium text-zinc-400 uppercase tracking-widest px-2 py-1.5">
// //               Online
// //             </p>
// //             {onlineList.map((u) => <ContactItem key={u._id} user={u} />)}
// //           </>
// //         )}

// //         {offlineList.length > 0 && (
// //           <>
// //             <p className="hidden lg:block text-xs font-medium text-zinc-400 uppercase tracking-widest px-2 py-1.5 mt-2">
// //               Others
// //             </p>
// //             {offlineList.map((u) => <ContactItem key={u._id} user={u} />)}
// //           </>
// //         )}

// //         {filteredUsers.length === 0 && (
// //           <p className="text-center text-zinc-500 text-sm py-8">No contacts found</p>
// //         )}
// //       </div>
// //     </aside>
// //   );
// // };

// // export default Sidebar;
// import { useEffect, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import SidebarSkeleton from "./skeletons/SidebarSkeleton";
// import { Users } from "lucide-react";

// const Sidebar = () => {
//   const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

//   const { onlineUsers } = useAuthStore();
//   const [showOnlineOnly, setShowOnlineOnly] = useState(false);

//   useEffect(() => {
//     getUsers();
//   }, [getUsers]);

//   const filteredUsers = showOnlineOnly
//     ? users.filter((user) => onlineUsers.includes(user._id))
//     : users;

//   if (isUsersLoading) return <SidebarSkeleton />;

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2">
//           <Users className="size-6" />
//           <span className="font-medium hidden lg:block">Contacts</span>
//         </div>
//         {/* TODO: Online filter toggle */}
//         <div className="mt-3 hidden lg:flex items-center gap-2">
//           <label className="cursor-pointer flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={showOnlineOnly}
//               onChange={(e) => setShowOnlineOnly(e.target.checked)}
//               className="checkbox checkbox-sm"
//             />
//             <span className="text-sm">Show online only</span>
//           </label>
//           <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
//         </div>
//       </div>

//       <div className="overflow-y-auto w-full py-3">
//         {filteredUsers.map((user) => (
//           <button
//             key={user._id}
//             onClick={() => setSelectedUser(user)}
//             className={`
//               w-full p-3 flex items-center gap-3
//               hover:bg-base-300 transition-colors
//               ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
//             `}
//           >
//             <div className="relative mx-auto lg:mx-0">
//               <img
//                 src={user.profilePic || "/avatar.png"}
//                 alt={user.name}
//                 className="size-12 object-cover rounded-full"
//               />
//               {onlineUsers.includes(user._id) && (
//                 <span
//                   className="absolute bottom-0 right-0 size-3 bg-green-500 
//                   rounded-full ring-2 ring-zinc-900"
//                 />
//               )}
//             </div>

//             {/* User info - only visible on larger screens */}
//             <div className="hidden lg:block text-left min-w-0">
//               <div className="font-medium truncate">{user.fullName}</div>
//               <div className="text-sm text-zinc-400">
//                 {onlineUsers.includes(user._id) ? "Online" : "Offline"}
//               </div>
//             </div>
//           </button>
//         ))}

//         {filteredUsers.length === 0 && (
//           <div className="text-center text-zinc-500 py-4">No online users</div>
//         )}
//       </div>
//     </aside>
//   );
// };
// export default Sidebar;

// import { useEffect, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import SidebarSkeleton from "./skeletons/SidebarSkeleton";
// import { Users, Trash2 } from "lucide-react";

// const Sidebar = () => {
//   const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, deleteContact } = useChatStore();
//   const { onlineUsers } = useAuthStore();
//   const [showOnlineOnly, setShowOnlineOnly] = useState(false);
//   const [confirmDeleteId, setConfirmDeleteId] = useState(null);

//   useEffect(() => {
//     getUsers();
//   }, [getUsers]);

//   const filteredUsers = showOnlineOnly
//     ? users.filter((user) => onlineUsers.includes(user._id))
//     : users;

//   const handleDeleteClick = (e, userId) => {
//     e.stopPropagation(); // prevent selecting the contact
//     setConfirmDeleteId(userId);
//   };

//   const handleConfirmDelete = async (e, userId) => {
//     e.stopPropagation();
//     await deleteContact(userId);
//     setConfirmDeleteId(null);
//   };

//   const handleCancelDelete = (e) => {
//     e.stopPropagation();
//     setConfirmDeleteId(null);
//   };

//   if (isUsersLoading) return <SidebarSkeleton />;

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2">
//           <Users className="size-6" />
//           <span className="font-medium hidden lg:block">Contacts</span>
//         </div>
//         <div className="mt-3 hidden lg:flex items-center gap-2">
//           <label className="cursor-pointer flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={showOnlineOnly}
//               onChange={(e) => setShowOnlineOnly(e.target.checked)}
//               className="checkbox checkbox-sm"
//             />
//             <span className="text-sm">Show online only</span>
//           </label>
//           <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
//         </div>
//       </div>

//       <div className="overflow-y-auto w-full py-3">
//         {filteredUsers.map((user) => (
//           <div key={user._id} className="relative group">
//             <button
//               onClick={() => setSelectedUser(user)}
//               className={`
//                 w-full p-3 flex items-center gap-3
//                 hover:bg-base-300 transition-colors
//                 ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
//               `}
//             >
//               <div className="relative mx-auto lg:mx-0">
//                 <img
//                   src={user.profilePic || "/avatar.png"}
//                   alt={user.fullName}
//                   className="size-12 object-cover rounded-full"
//                 />
//                 {onlineUsers.includes(user._id) && (
//                   <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
//                 )}
//               </div>

//               <div className="hidden lg:block text-left min-w-0 flex-1">
//                 <div className="font-medium truncate">{user.fullName}</div>
//                 <div className="text-sm text-zinc-400">
//                   {onlineUsers.includes(user._id) ? "Online" : "Offline"}
//                 </div>
//               </div>
//             </button>

//             {/* Delete button — shows on hover */}
//             {confirmDeleteId !== user._id ? (
//               <button
//                 onClick={(e) => handleDeleteClick(e, user._id)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex
//                   items-center justify-center p-1.5 rounded-full hover:bg-red-500/10
//                   text-zinc-400 hover:text-red-500 transition-colors"
//                 title="Delete contact"
//               >
//                 <Trash2 size={15} />
//               </button>
//             ) : (
//               /* Confirm / Cancel */
//               <div
//                 className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <button
//                   onClick={(e) => handleConfirmDelete(e, user._id)}
//                   className="text-[11px] px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
//                 >
//                   Delete
//                 </button>
//                 <button
//                   onClick={handleCancelDelete}
//                   className="text-[11px] px-2 py-1 rounded bg-base-200 hover:bg-base-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}

//         {filteredUsers.length === 0 && (
//           <div className="text-center text-zinc-500 py-4">No contacts found</div>
//         )}
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Trash2 } from "lucide-react";
import ThreeDotMenu from "./ThreeDotMenu";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, deleteContact } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { getUsers(); }, [getUsers]);

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
          {/* 3-dot menu — only visible on large screens */}
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
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
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
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;