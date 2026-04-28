import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const getAppNamespace = () => process.env.APP_NAMESPACE || "syncup-default";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const appNamespace = req.user.appNamespace || getAppNamespace();
    const deletedContacts = req.user.deletedContacts || [];

    // Only return users that are in this user's contacts list (whitelist)
    const me = await User.findById(loggedInUserId).select("contacts");
    const contactIds = me?.contacts || [];

    if (contactIds.length === 0) {
      return res.status(200).json([]);
    }

    const filteredUsers = await User.find({
      _id: { $in: contactIds, $nin: deletedContacts },
      appNamespace,
    }).select("-password");

    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const appNamespace = req.user.appNamespace || getAppNamespace();

    // Verify the target user exists in the same namespace
    const contact = await User.findOne({
      _id: userToChatId,
      appNamespace,
    }).select("_id");

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Verify the target user is in caller's contacts
    const me = await User.findById(myId).select("contacts");
    if (!me.contacts.some((c) => c.toString() === userToChatId)) {
      return res.status(403).json({ error: "Not in your contacts" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, voice } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const appNamespace = req.user.appNamespace || getAppNamespace();

    // Verify receiver exists in same namespace
    const receiver = await User.findOne({
      _id: receiverId,
      appNamespace,
    }).select("_id");

    if (!receiver) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Verify receiver is in sender's contacts
    const me = await User.findById(senderId).select("contacts");
    if (!me.contacts.some((c) => c.toString() === receiverId)) {
      return res.status(403).json({ error: "Not in your contacts" });
    }

    let imageUrl;
    let voiceUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (voice) {
      const uploadResponse = await cloudinary.uploader.upload(voice, {
        resource_type: "video",
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
      seen: false,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;
    const appNamespace = req.user.appNamespace || getAppNamespace();

    const sender = await User.findOne({
      _id: senderId,
      appNamespace,
    }).select("_id");

    if (!sender) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await Message.updateMany(
      {
        senderId,
        receiverId,
        seen: false,
      },
      {
        $set: {
          seen: true,
          seenAt: new Date(),
        },
      }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        senderId,
        receiverId: receiverId.toString(),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsSeen:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.findByIdAndDelete(messageId);
    return res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    const appNamespace = req.user.appNamespace || getAppNamespace();

    const contact = await User.findOne({
      _id: contactId,
      appNamespace,
    }).select("_id");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Remove from contacts whitelist (instead of blacklist approach)
    await User.findByIdAndUpdate(userId, {
      $pull: { contacts: contactId },
      $addToSet: { deletedContacts: contactId },
    });

    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    });

    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.log("Error in deleteContact:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
