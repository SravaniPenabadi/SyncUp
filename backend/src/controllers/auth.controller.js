import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

const getAppNamespace = () => process.env.APP_NAMESPACE || "syncup-default";

const adoptLegacyNamespaceUser = async (user, appNamespace) => {
  if (!user) return null;
  if (user.appNamespace) return user;

  user.appNamespace = appNamespace;
  if (!Array.isArray(user.contacts)) user.contacts = [];
  if (!Array.isArray(user.deletedContacts)) user.deletedContacts = [];
  await user.save();
  return user;
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const appNamespace = getAppNamespace();

  try {
    if (!fullName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      $or: [{ appNamespace }, { appNamespace: { $exists: false } }, { appNamespace: null }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      appNamespace,
    });

    generateToken(newUser._id, res);
    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const appNamespace = getAppNamespace();

  try {
    let user = await User.findOne({
      email: normalizedEmail,
      $or: [{ appNamespace }, { appNamespace: { $exists: false } }, { appNamespace: null }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user = await adoptLegacyNamespaceUser(user, appNamespace);

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
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
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfileInfo = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (bio !== undefined) updates.bio = bio;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updates.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfileInfo:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    const appNamespace = getAppNamespace();

    const user = await User.findById(userId);
    const updates = {};

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const emailExists = await User.findOne({
          email: normalizedEmail,
          appNamespace,
          _id: { $ne: userId },
        });

        if (emailExists) {
          return res.status(400).json({ message: "Email already in use" });
        }

        updates.email = normalizedEmail;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateAccount:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePrivacy = async (req, res) => {
  try {
    const { lastSeenVisibility, profilePhotoVisibility } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (lastSeenVisibility) updates.lastSeenVisibility = lastSeenVisibility;
    if (profilePhotoVisibility) {
      updates.profilePhotoVisibility = profilePhotoVisibility;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updatePrivacy:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
