import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    lastSeenVisibility: {
      type: String,
      enum: ["everyone", "contacts", "nobody"],
      default: "everyone",
    },
    lastSeen: {
  type: Date,
  default: null,
},
    profilePhotoVisibility: {
      type: String,
      enum: ["everyone", "contacts", "nobody"],
      default: "everyone",
    },
    deletedContacts: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: [],
}],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;