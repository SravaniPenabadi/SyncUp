import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import SyncMeter from "./SyncMeter";

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Last seen unavailable";
  const now = new Date();
  const seen = new Date(lastSeen);
  const diffMs = now - seen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const timeStr = seen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = seen.toLocaleDateString([], { month: "short", day: "numeric" });
  let relative = "";
  if (diffMins < 1) relative = "just now";
  else if (diffMins < 60) relative = `${diffMins} min ago`;
  else if (diffHours < 24) relative = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  else if (diffDays === 1) relative = "yesterday";
  else relative = `${diffDays} days ago`;
  let exact = "";
  if (diffMins < 1) exact = "just now";
  else if (diffHours < 24) exact = `today at ${timeStr}`;
  else if (diffDays === 1) exact = `yesterday at ${timeStr}`;
  else exact = `${dateStr} at ${timeStr}`;
  return `Last seen ${exact} (${relative})`;
};

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, getSyncScore, syncScore, syncLabel, syncDetails } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [lastSeen, setLastSeen] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    // Fetch lastSeen when offline
    if (!isOnline) {
      axiosInstance
        .get(`/auth/last-seen/${selectedUser._id}`)
        .then((res) => setLastSeen(res.data.lastSeen))
        .catch(() => setLastSeen(null));
    }
    // Fetch sync score on load
    getSyncScore(selectedUser._id);
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

        {/* Sync Meter — right side */}
        <div className="flex items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            <SyncMeter score={syncScore} label={syncLabel} details={syncDetails} size="md" />

            {/* Details popup on click */}
            {showDetails && syncDetails && (
              <div className="absolute right-0 top-16 z-50 bg-base-100 border border-base-300 rounded-xl shadow-lg p-3 w-44 text-xs space-y-1.5">
                <p className="font-semibold text-sm mb-2">Sync Details</p>
                <div className="flex justify-between">
                  <span className="text-zinc-400">💬 Messages</span>
                  <span className="font-medium">{syncDetails.messagesLast7Days}/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">⚡ Avg Reply</span>
                  <span className="font-medium">{syncDetails.avgReplySpeed} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">🔥 Streak</span>
                  <span className="font-medium">{syncDetails.activeDaysStreak} days</span>
                </div>
                <div className="flex justify-between border-t border-base-300 pt-1.5 mt-1">
                  <span className="text-zinc-400">Score</span>
                  <span className="font-bold">{syncScore}/100</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;