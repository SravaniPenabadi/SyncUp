import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Update profile (name, bio, avatar)
export const updateProfileInfo = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfileInfo:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update account (email, password)
export const updateAccount = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const updates = {};

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      updates.email = email;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateAccount:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update privacy settings
export const updatePrivacy = async (req, res) => {
  try {
    const { lastSeenVisibility, profilePhotoVisibility } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (lastSeenVisibility) updates.lastSeenVisibility = lastSeenVisibility;
    if (profilePhotoVisibility) updates.profilePhotoVisibility = profilePhotoVisibility;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updatePrivacy:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLastSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("lastSeen");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ lastSeen: user.lastSeen });
  } catch (error) {
    console.log("Error in getLastSeen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
