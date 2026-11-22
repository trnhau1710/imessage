import express from "express";

import { protect } from "../middleware/authMiddleware.js"

import { createOrGetConversation, getAllConversations } from "../controllers/conversationController.js";

const router = express.Router();

//tao hoac lay mot cuoc tro chuyen
router.post("/:userId", protect, createOrGetConversation);

//lay tat ca cuoc tro chuyen cua nguoi dung hien tai
router.get("/", protect, getAllConversations);

export default router;