import { X, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showSync, setShowSync] = useState(false); // ✅ collapsed by default

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    if (!isOnline) {
      axiosInstance
        .get(`/auth/last-seen/${selectedUser._id}`)
        .then((res) => setLastSeen(res.data.lastSeen))
        .catch(() => setLastSeen(null));
    }
    getSyncScore(selectedUser._id);
    setShowSync(false); // reset when switching chats
  }, [selectedUser._id, isOnline]);

  return (
    <div className="border-b border-base-300">
      {/* Main header row */}
      <div className="p-2.5 flex items-center justify-between">
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

        <div className="flex items-center gap-2">
          {/* ✅ Toggle button */}
          <button
            onClick={() => setShowSync((prev) => !prev)}
            className="btn btn-ghost btn-sm gap-1 text-xs"
            title="Toggle Sync Meter"
          >
            <span className="hidden sm:inline">Sync</span>
            {showSync ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>

      {/* ✅ Collapsible sync panel */}
      {showSync && (
        <div className="px-4 pb-3 flex items-center gap-6 bg-base-200/50 animate-in slide-in-from-top-2 duration-200">
          <SyncMeter score={syncScore} label={syncLabel} size="md" />

          {syncDetails && (
            <div className="flex gap-4 text-xs text-zinc-400">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base">💬</span>
                <span className="font-medium text-base-content">{syncDetails.messagesLast7Days}</span>
                <span>msgs/week</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base">⚡</span>
                <span className="font-medium text-base-content">{syncDetails.avgReplySpeed}m</span>
                <span>avg reply</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base">🔥</span>
                <span className="font-medium text-base-content">{syncDetails.activeDaysStreak}</span>
                <span>day streak</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base">📊</span>
                <span className="font-medium text-base-content">{syncScore}/100</span>
                <span>score</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;