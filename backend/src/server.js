import jwt from "jsonwebtoken";
import express from "express" //giúp xây dựng backend server và API
import cors from "cors" //Kiểm soát việc truy cập tài nguyên từ các origin khác
import dotenv from "dotenv" //Đọc thông tin cấu hình từ file .env
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js"
import mongoose from "mongoose";
import Conversation from "./models/Conversation.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express(); //khởi tạo ứng dụng

//Middleware
app.use(cors({
    origin: process.env.CLIENT_URL //chỉ cho những thằng cấu hình trong .env chạy qua
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes)

// HTTP Server
const httpServer = createServer(app);

// Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: No token provided."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.userId = decoded.userId;

        next();
    } catch (error) {
        next(new Error("Authentication error: Invalid token."));
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Tham gia phòng chat
    socket.on("join_conversation", async (conversationId) => {
        try {
            if (!mongoose.isValidObjectId(conversationId)) {
                return;
            }

            // Kiểm tra user có thuộc conversation không
            const conversation = await Conversation.findOne({
                _id: conversationId,
                members: socket.userId
            });

            if (!conversation) {
                console.log("Access denied to conversation:", conversationId);
                return;
            }

            const roomId = `conversation:${conversationId}`;

            socket.join(roomId);

            console.log(
                `User ${socket.userId} joined room ${roomId}`
            );

        } catch (error) {
            console.error("Join conversation error:", error);
        }
    });

    // Rời phòng chat
    socket.on("leave_conversation", (conversationId) => {
        const roomId = `conversation:${conversationId}`;

        socket.leave(roomId);

        console.log(
            `User ${socket.userId} left room ${roomId}`
        );
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
    });
});

// Connect Database and start server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();