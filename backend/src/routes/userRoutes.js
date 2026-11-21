import express from "express";
import { getAllUsers } from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

//Lay danh sach nguoi dung (tru tai khoan dang dang nhap)
router.get("/users", protect, getAllUsers);

export default router;