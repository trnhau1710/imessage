import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    sendMessage,
    getMessages
} from "../controllers/messageController.js";

const router = express.Router();

//gui tin nhan
router.post("/:conversationId", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);

export default router;