import { useState } from "react";
import { X } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";

const AddContactModal = ({ onClose }) => {
  const { addContact, isAddingContact } = useGroupStore();
  const { getUsers } = useChatStore();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) return;
    addContact(email, () => {
      getUsers(); // refresh sidebar contacts
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="rounded-xl shadow-2xl w-full max-w-sm mx-4"
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
            Add Contact
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

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Enter the email address of the person you want to add.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "#e2e8f0" }}>
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
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
            disabled={isAddingContact || !email.trim()}
            style={{
              background: "#6366f1",
              opacity: isAddingContact || !email.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isAddingContact && email.trim()) e.currentTarget.style.background = "#5558e6";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f1")}
          >
            {isAddingContact ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding…
              </span>
            ) : (
              "Add Contact"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;