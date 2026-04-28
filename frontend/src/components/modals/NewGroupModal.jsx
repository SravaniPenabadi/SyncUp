import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

const NewGroupModal = ({ onClose }) => {
  const { users } = useChatStore();
  const { createGroup, isCreatingGroup } = useGroupStore();

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState("");
  const fileRef = useRef(null);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setGroupImage(reader.result);
  };

  const handleSubmit = () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedMembers.length < 1) return toast.error("Select at least 1 member");
    createGroup({ name: groupName, members: selectedMembers, groupImage }, onClose);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col"
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>
            New Group
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Group Image */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-colors"
              style={{
                background: "#0f172a",
                border: "2px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => fileRef.current.click()}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              {groupImage ? (
                <img src={groupImage} alt="group" className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} style={{ color: "#94a3b8" }} />
              )}
            </div>
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageChange} />
            <p className="text-xs" style={{ color: "#94a3b8" }}>Group icon (optional)</p>
          </div>

          {/* Group Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#e2e8f0" }}>
              Group Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#e2e8f0" }}>
              Select Members
              <span className="ml-2 text-xs" style={{ color: "#94a3b8" }}>
                ({selectedMembers.length} selected)
              </span>
            </label>
            <div
              className="space-y-1 max-h-48 overflow-y-auto rounded-xl p-2"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "#0f172a",
              }}
            >
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#6366f1" }}
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                    {user.fullName}
                  </span>
                </label>
              ))}
              {users.length === 0 && (
                <p className="text-center text-sm py-4" style={{ color: "#94a3b8" }}>
                  No contacts available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: "#94a3b8", background: "rgba(255,255,255,0.04)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            disabled={isCreatingGroup}
            style={{
              background: "#6366f1",
              opacity: isCreatingGroup ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isCreatingGroup) e.currentTarget.style.background = "#5558e6";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            {isCreatingGroup ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;