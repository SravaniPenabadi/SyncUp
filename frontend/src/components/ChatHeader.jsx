import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import SyncMeter from "./SyncMeter";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, messages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#1e293b",
      }}
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full object-cover"
            style={{
              boxShadow: isOnline
                ? "0 0 0 2px #1e293b, 0 0 0 4px #22c55e"
                : "none",
            }}
          />
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#22c55e", borderColor: "#1e293b" }}
            />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#e2e8f0" }}>
            {selectedUser.fullName}
          </h3>
          <p className="text-xs" style={{ color: isOnline ? "#22c55e" : "#94a3b8" }}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Center: Sync Meter */}
      <div className="hidden md:flex flex-col items-center gap-1">
        <span
          className="text-[9px] uppercase tracking-widest"
          style={{ color: "#94a3b8" }}
        >
          Sync Meter
        </span>
        <SyncMeter userId={selectedUser._id} refreshToken={messages.length} />
      </div>

      {/* Right: close */}
      <button
        onClick={() => setSelectedUser(null)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "#94a3b8" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ChatHeader;
