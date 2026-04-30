import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupImage } = req.body;
    const admin = req.user._id;

    if (!name || !members || members.length < 1) {
      return res.status(400).json({ message: "Group name and at least 1 member required" });
    }

    const allMembers = [...new Set([...members, admin.toString()])];

    let imageUrl = "";
    if (groupImage) {
      const upload = await cloudinary.uploader.upload(groupImage);
      imageUrl = upload.secure_url;
    }

    const group = new Group({ name, members: allMembers, admin, groupImage: imageUrl });
    await group.save();

    const populated = await Group.findById(group._id).populate("members", "-password");
    res.status(201).json(populated);
  } catch (error) {
    console.log("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all groups for logged in user
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .sort({ updatedAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, voice } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    let imageUrl, voiceUrl;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }
    if (voice) {
      const upload = await cloudinary.uploader.upload(voice, { resource_type: "video" });
      voiceUrl = upload.secure_url;
    }

    const message = new GroupMessage({ groupId, senderId, text, image: imageUrl, voice: voiceUrl });
    await message.save();

    // Update lastMessage on group
    await Group.findByIdAndUpdate(groupId, {
      lastMessage: text || (image ? "📷 Image" : "🎤 Voice"),
    });

    const populated = await GroupMessage.findById(message._id)
      .populate("senderId", "fullName profilePic");

    // Emit to all group members
    group.members.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        const socketId = getReceiverSocketId(memberId.toString());
        if (socketId) {
          io.to(socketId).emit("newGroupMessage", { message: populated, groupId });
        }
      }
    });

    res.status(201).json(populated);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add contact
export const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    const loggedInUserId = req.user._id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    if (user._id.toString() === loggedInUserId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    await User.findByIdAndUpdate(loggedInUserId, {
      $pull: { deletedContacts: user._id },
    });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in addContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await GroupMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};