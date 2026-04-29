
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import ContactRequest from "../models/contactRequest.model.js";

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const loggedInUserId = req.user._id;
//     const loggedInUser = await User.findById(loggedInUserId);

//     // ✅ fallback to empty array if field doesn't exist yet
//     const deletedContacts = loggedInUser.deletedContacts || [];

//     const filteredUsers = await User.find({
//       _id: {
//         $ne: loggedInUserId,
//         $nin: deletedContacts,
//       },
//     }).select("-password");

//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getUsersForSidebar: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const loggedInUser = await User.findById(loggedInUserId);
    const deletedContacts = loggedInUser.deletedContacts || [];

    // ✅ Only show users who have an accepted contact request
    const acceptedRequests = await ContactRequest.find({
      $or: [
        { sender: loggedInUserId, status: "accepted" },
        { receiver: loggedInUserId, status: "accepted" },
      ],
    });

    // Get the other person's ID from each accepted request
    const contactIds = acceptedRequests.map((req) =>
      req.sender.toString() === loggedInUserId.toString()
        ? req.receiver
        : req.sender
    );

    // Filter out deleted contacts
    const filteredIds = contactIds.filter(
      (id) => !deletedContacts.map((d) => d.toString()).includes(id.toString())
    );

    const contacts = await User.find({
      _id: { $in: filteredIds },
    }).select("-password");

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, voice } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let voiceUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice, {
        resource_type: "video", // Cloudinary uses "video" for audio files
        folder: "voice_messages",
      });
      voiceUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      voice: voiceUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params;
    const myId = req.user._id;

    // Mark all messages from senderId to me as seen
    await Message.updateMany(
      { senderId: senderId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.log("Error in markMessagesAsSeen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getSyncScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Get all messages between both users in last 7 days
    const recentMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: 1 });

    // 1. Messages last 7 days
    const messagesLast7Days = recentMessages.length;

    // 2. Average reply speed (in minutes)
    let totalReplyTime = 0;
    let replyCount = 0;
    for (let i = 1; i < recentMessages.length; i++) {
      const prev = recentMessages[i - 1];
      const curr = recentMessages[i];
      // Only count if different sender (it's a reply)
      if (prev.senderId.toString() !== curr.senderId.toString()) {
        const diff = (new Date(curr.createdAt) - new Date(prev.createdAt)) / 60000;
        if (diff < 60) { // ignore gaps longer than 1 hour
          totalReplyTime += diff;
          replyCount++;
        }
      }
    }
    const avgReplySpeed = replyCount > 0 ? totalReplyTime / replyCount : 99;

    // 3. Active days streak
    const activeDays = new Set(
      recentMessages.map((m) => new Date(m.createdAt).toDateString())
    );
    const activeDaysStreak = activeDays.size;

    // 4. Formula
    const rawScore =
      messagesLast7Days * 2 +
      (avgReplySpeed < 5 ? 20 : avgReplySpeed < 15 ? 10 : 5) +
      activeDaysStreak * 3;

    // 5. Normalize to 0-100
    const maxPossible = 7 * 2 * 10 + 20 + 7 * 3; // rough max
    const syncScore = Math.min(100, Math.round((rawScore / maxPossible) * 100));

    // 6. Label
    let label = "";
    if (syncScore < 30) label = "Low Sync";
    else if (syncScore < 70) label = "In Sync";
    else label = "Besties 💀";

    res.status(200).json({
      syncScore,
      label,
      messagesLast7Days,
      avgReplySpeed: Math.round(avgReplySpeed),
      activeDaysStreak,
    });
  } catch (error) {
    console.log("Error in getSyncScore:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    // Add contactId to deletedContacts list of current user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { deletedContacts: contactId }, // $addToSet prevents duplicates
    });

    // Delete all messages between the two users
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.log("Error in deleteContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};