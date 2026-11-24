import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyEmail, resendVerificationEmail } from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

//POST/api/auth/register
router.post("/register", registerUser);

//Dang nhap
router.post("/login", loginUser);

//Verify email
router.post("/verify-email", verifyEmail);

//gui lai email xac nhan
router.post("/resend-verification", resendVerificationEmail);

//Lay nguoi dung dang dang nhap
router.get("/me", protect, getCurrentUser);

export default router;