import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupImage } = req.body;
    const admin = req.user._id;

    if (!name || !members || members.length < 1) {
      return res.status(400).json({ message: "Group name and at least 1 member required" });
    }

    // Include admin in members if not already
    const allMembers = [...new Set([...members, admin.toString()])];

    let imageUrl = "";
    if (groupImage) {
      const upload = await cloudinary.uploader.upload(groupImage);
      imageUrl = upload.secure_url;
    }

    const group = new Group({
      name,
      members: allMembers,
      admin,
      groupImage: imageUrl,
    });

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
    const groups = await Group.find({ members: userId }).populate("members", "-password");
    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add contact (just fetch user by email)
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

    // Remove from deletedContacts if previously deleted
    await User.findByIdAndUpdate(loggedInUserId, {
      $pull: { deletedContacts: user._id },
    });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in addContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};