import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seen: {
  type: Boolean,
  default: false,
},
    text: { type: String },
    image: { type: String },
    voice: { type: String }, // ✅ Cloudinary URL for voice message
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;