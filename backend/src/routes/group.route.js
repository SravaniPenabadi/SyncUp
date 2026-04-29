import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  addContact,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.post("/add-contact", protectRoute, addContact);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send", protectRoute, sendGroupMessage);

export default router;