import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold">New Group</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Group Image */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-base-300 hover:border-primary transition-colors"
              onClick={() => fileRef.current.click()}
            >
              {groupImage ? (
                <img src={groupImage} alt="group" className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} className="text-zinc-400" />
              )}
            </div>
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageChange} />
            <p className="text-xs text-zinc-400">Group icon (optional)</p>
          </div>

          {/* Group Name */}
          <div className="form-control gap-1">
            <label className="label-text font-medium">Group Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Member Selection */}
          <div className="form-control gap-2">
            <label className="label-text font-medium">
              Select Members
              <span className="ml-2 text-xs text-zinc-400">({selectedMembers.length} selected)</span>
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2">
              {users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{user.fullName}</span>
                </label>
              ))}
              {users.length === 0 && (
                <p className="text-center text-zinc-400 text-sm py-4">No contacts available</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
            disabled={isCreatingGroup}
          >
            {isCreatingGroup ? <span className="loading loading-spinner loading-sm" /> : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;