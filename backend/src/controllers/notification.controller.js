import ContactRequest from "../models/contactRequest.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send contact request
export const sendContactRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.user._id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const receiver = await User.findOne({ email }).select("-password");
    if (!receiver) return res.status(404).json({ message: "No user found with that email" });

    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    // Check if request already exists
    const existing = await ContactRequest.findOne({
      sender: senderId,
      receiver: receiver._id,
      status: "pending",
    });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    // Check if already contacts
    const alreadyContact = await ContactRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id, status: "accepted" },
        { sender: receiver._id, receiver: senderId, status: "accepted" },
      ],
    });
    if (alreadyContact) return res.status(400).json({ message: "Already in your contacts" });

    const request = new ContactRequest({
      sender: senderId,
      receiver: receiver._id,
    });
    await request.save();

    const populated = await ContactRequest.findById(request._id)
      .populate("sender", "-password")
      .populate("receiver", "-password");

    // Send real-time notification via socket
    const receiverSocketId = getReceiverSocketId(receiver._id.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newContactRequest", populated);
    }

    res.status(201).json({ message: "Contact request sent!", request: populated });
  } catch (error) {
    console.log("Error in sendContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all pending requests for logged in user
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await ContactRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "-password");

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getPendingRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept contact request
export const acceptContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ContactRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();

    // Remove from deletedContacts for both users
    await User.findByIdAndUpdate(userId, {
      $pull: { deletedContacts: request.sender },
    });
    await User.findByIdAndUpdate(request.sender, {
      $pull: { deletedContacts: userId },
    });

    // Notify sender via socket
    const senderSocketId = getReceiverSocketId(request.sender.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("contactRequestAccepted", {
        acceptedBy: userId,
      });
    }

    res.status(200).json({ message: "Contact request accepted" });
  } catch (error) {
    console.log("Error in acceptContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject contact request
export const rejectContactRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ContactRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Contact request rejected" });
  } catch (error) {
    console.log("Error in rejectContactRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread message notifications
export const getMessageNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unseen messages grouped by sender
    const { Message } = await import("../models/message.model.js");
    const unseen = await Message.find({
      receiverId: userId,
      seen: false,
    })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Group by sender
    const grouped = {};
    unseen.forEach((msg) => {
      const sid = msg.senderId._id.toString();
      if (!grouped[sid]) {
        grouped[sid] = {
          sender: msg.senderId,
          count: 0,
          lastMessage: msg.text || "📷 Image",
          lastTime: msg.createdAt,
        };
      }
      grouped[sid].count++;
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error in getMessageNotifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};