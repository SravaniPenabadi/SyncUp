import { useEffect, useRef, useState } from "react";
import { Bell, UserCheck, UserX, MessageCircle } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  const {
    contactRequests,
    messageNotifications,
    fetchAll,
    acceptRequest,
    rejectRequest,
    getTotalCount,
    clearMessageNotification,
    addContactRequest,
  } = useNotificationStore();

  const { setSelectedUser, getUsers } = useChatStore();
  const { socket } = useAuthStore();

  const totalCount = getTotalCount();

  // Fetch on mount
  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Real-time socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("newContactRequest", (request) => {
      addContactRequest(request);
    });

    socket.on("contactRequestAccepted", () => {
      toast.success("Your contact request was accepted!");
      getUsers();
    });

    return () => {
      socket.off("newContactRequest");
      socket.off("contactRequestAccepted");
    };
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMessageNotifClick = (notification) => {
    setSelectedUser(notification.sender);
    clearMessageNotification(notification.sender._id);
    setOpen(false);
  };

  const handleAccept = async (requestId) => {
    await acceptRequest(requestId);
    getUsers();
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-ghost btn-sm btn-circle relative"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white
            text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 bg-base-100 border border-base-300
          rounded-xl shadow-xl overflow-hidden">

          <div className="p-3 border-b border-base-300 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {totalCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {totalCount} new
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Contact Requests */}
            {contactRequests.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase px-3 pt-3 pb-1">
                  Contact Requests
                </p>
                {contactRequests.map((req) => (
                  <div key={req._id} className="px-3 py-2.5 hover:bg-base-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.sender.profilePic || "/avatar.png"}
                        alt={req.sender.fullName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{req.sender.fullName}</p>
                        <p className="text-xs text-zinc-400">wants to connect</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="btn btn-xs btn-success"
                          title="Accept"
                        >
                          <UserCheck size={13} />
                        </button>
                        <button
                          onClick={() => rejectRequest(req._id)}
                          className="btn btn-xs btn-error"
                          title="Reject"
                        >
                          <UserX size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Notifications */}
            {messageNotifications.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase px-3 pt-3 pb-1">
                  Unread Messages
                </p>
                {messageNotifications.map((notif) => (
                  <button
                    key={notif.sender._id}
                    onClick={() => handleMessageNotifClick(notif)}
                    className="w-full px-3 py-2.5 hover:bg-base-200 transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="relative">
                      <img
                        src={notif.sender.profilePic || "/avatar.png"}
                        alt={notif.sender.fullName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary
                        text-primary-content text-[9px] font-bold rounded-full
                        flex items-center justify-center">
                        {notif.count}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notif.sender.fullName}</p>
                      <p className="text-xs text-zinc-400 truncate">{notif.lastMessage}</p>
                    </div>
                    <MessageCircle size={14} className="text-zinc-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {totalCount === 0 && (
              <div className="py-10 text-center text-zinc-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;