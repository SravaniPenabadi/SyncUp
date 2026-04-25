import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  deleteContact,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Specific routes FIRST
router.delete("/contact/:contactId", protectRoute, deleteContact);
router.delete("/message/:messageId", protectRoute, deleteMessage);

// ✅ Generic /:id route LAST
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;