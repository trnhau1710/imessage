import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;
        const { content } = req.body;

        console.log("Request Body:", req.body);
        console.log("Content:", req.body?.content);

        //kiem tra conversationID
        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                messsage: "Invalid conversation id."
            });
        }

        //kiem tra message content
        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content is required."
            });
        }

        //Kiem tra xem nguoi dung hien tai co thuoc cuoc tro chuyen nay khong
        const conversation = await Conversation.findOne({
            _id: conversationId,
            members: currentUserId
        });

        if (!conversation) {
            return res.status(400).json({
                success: false,
                message: "Conversation not found or access denied."
            });
        }

        //tao tin nhan moi
        const newMessage = await Message.create({
            conversation: conversationId,
            sender: currentUserId,
            content: content.trim()
        });

        //Update thoi diem tro chuyen gan nhat
        conversation.updatedAt = new Date();
        await conversation.save();

        //tra ve tin nhan voi thong tin nguoi gui
        const populatedMessage = await Message.findById(newMessage._id).populate("sender", "username avatar");

        // Phát tin nhắn mới đến tất cả thành viên trong phòng chat
        const io = req.app.get("io");

        io.to(`conversation:${conversationId}`).emit(
            "new_message",
            populatedMessage
        );

        return res.status(200).json({
            success: true,
            message: "Message sent successfully.",
            data: populatedMessage
        });
    }
    catch (error) {
        console.error("Send message error: ", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

//lay tin nhan trong 1 cuoc tro chuyen
export const getMessages = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const conversationId = req.params.conversationId;

        //kiem tra conversationID
        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                messsage: "Invalid conversation id."
            });
        }

        //Kiem tra xem nguoi dung hien tai co thuoc cuoc tro chuyen nay khong
        const conversation = await Conversation.findOne({
            _id: conversationId,
            members: currentUserId
        });

        if (!conversation) {
            return res.status(400).json({
                success: false,
                message: "Conversation not found or access denied."
            });
        }

        //lay tat ca tin nhan theo thu tu thoi gian
        const messages = await Message.find({
            conversation: conversationId
        }).populate("sender", "username avatar").sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            total: messages.length,
            messages
        });
    }
    catch (error) {
        console.log("Get Messages Error: ", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }

};

