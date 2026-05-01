import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages, getUsersForSidebar, sendMessage,
  deleteMessage, deleteContact, markMessagesAsSeen,
  getSyncScore, deleteMessageForEveryone, starMessage, getStarredMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/sync/:userId", protectRoute, getSyncScore);
router.get("/starred", protectRoute, getStarredMessages);
router.delete("/contact/:contactId", protectRoute, deleteContact);
router.delete("/message/:messageId", protectRoute, deleteMessage);
router.delete("/everyone/:messageId", protectRoute, deleteMessageForEveryone);
router.put("/seen/:senderId", protectRoute, markMessagesAsSeen);
router.put("/star/:messageId", protectRoute, starMessage);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;