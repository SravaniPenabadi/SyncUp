
// import express from "express";

// import {checkAuth,signup,login,logout,updateProfile} from "../controllers/auth.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js";

// const router = express.Router();

// router.post("/signup",signup);
// router.post("/login",login);
// router.post("/logout",logout);

// router.put("/update-profile", protectRoute, updateProfile);
// router.get("/check", protectRoute, checkAuth);

// export default router;
import express from "express";
import {
  checkAuth,
  signup,
  login,
  logout,
  updateProfile,
  updateProfileInfo,
  updateAccount,
  updatePrivacy,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-profile-info", protectRoute, updateProfileInfo);
router.put("/update-account", protectRoute, updateAccount);
router.put("/update-privacy", protectRoute, updatePrivacy);

router.get("/check", protectRoute, checkAuth);

export default router;