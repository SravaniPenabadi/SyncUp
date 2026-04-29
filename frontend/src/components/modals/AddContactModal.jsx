// import { useState } from "react";
// import { X } from "lucide-react";
// import { useGroupStore } from "../../store/useGroupStore";
// import { useChatStore } from "../../store/useChatStore";

// const AddContactModal = ({ onClose }) => {
//   const { addContact, isAddingContact } = useGroupStore();
//   const { getUsers } = useChatStore();
//   const [email, setEmail] = useState("");

//   const handleSubmit = () => {
//     if (!email.trim()) return;
//     addContact(email, () => {
//       getUsers(); // refresh sidebar contacts
//       onClose();
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-sm mx-4">

//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-base-300">
//           <h2 className="text-lg font-semibold">Add Contact</h2>
//           <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
//             <X size={18} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4 space-y-4">
//           <p className="text-sm text-zinc-400">
//             Enter the email address of the person you want to add.
//           </p>
//           <div className="form-control gap-1">
//             <label className="label-text font-medium">Email Address</label>
//             <input
//               type="email"
//               className="input input-bordered w-full"
//               placeholder="example@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-4 border-t border-base-300 flex gap-2">
//           <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
//           <button
//             onClick={handleSubmit}
//             className="btn btn-primary flex-1"
//             disabled={isAddingContact || !email.trim()}
//           >
//             {isAddingContact ? <span className="loading loading-spinner loading-sm" /> : "Add Contact"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddContactModal;

import { useState } from "react";
import { X } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";

const AddContactModal = ({ onClose }) => {
  const { sendContactRequest } = useNotificationStore();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setIsSending(true);
    await sendContactRequest(email, onClose);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold">Add Contact</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-zinc-400">
            Enter their email — they'll receive a contact request to accept.
          </p>
          <div className="form-control gap-1">
            <label className="label-text font-medium">Email Address</label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
            disabled={isSending || !email.trim()}
          >
            {isSending
              ? <span className="loading loading-spinner loading-sm" />
              : "Send Request"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;