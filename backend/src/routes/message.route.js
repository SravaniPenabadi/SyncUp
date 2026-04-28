import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  deleteContact,
  markMessagesAsSeen,
  getSyncScore,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/sync/:userId", protectRoute, getSyncScore);   // ✅ specific routes first
router.delete("/contact/:contactId", protectRoute, deleteContact);
router.delete("/message/:messageId", protectRoute, deleteMessage);
router.put("/seen/:senderId", protectRoute, markMessagesAsSeen);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;