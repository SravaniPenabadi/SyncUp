import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendContactRequest,
  getPendingRequests,
  acceptContactRequest,
  rejectContactRequest,
  getMessageNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/contact-request/send", protectRoute, sendContactRequest);
router.get("/contact-request/pending", protectRoute, getPendingRequests);
router.put("/contact-request/accept/:requestId", protectRoute, acceptContactRequest);
router.put("/contact-request/reject/:requestId", protectRoute, rejectContactRequest);
router.get("/messages/unread", protectRoute, getMessageNotifications);

export default router;