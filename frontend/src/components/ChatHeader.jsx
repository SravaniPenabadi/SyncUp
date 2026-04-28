import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Last seen unavailable";

  const now = new Date();
  const seen = new Date(lastSeen);
  const diffMs = now - seen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Exact time string
  const timeStr = seen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = seen.toLocaleDateString([], { month: "short", day: "numeric" });

  // Relative string
  let relative = "";
  if (diffMins < 1) relative = "just now";
  else if (diffMins < 60) relative = `${diffMins} min ago`;
  else if (diffHours < 24) relative = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  else if (diffDays === 1) relative = "yesterday";
  else relative = `${diffDays} days ago`;

  // Exact string
  let exact = "";
  if (diffMins < 1) exact = "just now";
  else if (diffHours < 24) exact = `today at ${timeStr}`;
  else if (diffDays === 1) exact = `yesterday at ${timeStr}`;
  else exact = `${dateStr} at ${timeStr}`;

  return `Last seen ${exact} (${relative})`;
};

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [lastSeen, setLastSeen] = useState(null);

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    // Fetch lastSeen when user is offline
    if (!isOnline) {
      axiosInstance.get(`/auth/last-seen/${selectedUser._id}`)
        .then((res) => setLastSeen(res.data.lastSeen))
        .catch(() => setLastSeen(null));
    }
  }, [selectedUser._id, isOnline]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span>{lastSeen ? formatLastSeen(lastSeen) : "Offline"}</span>
              )}
            </p>
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;