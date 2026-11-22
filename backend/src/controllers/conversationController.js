import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

//Tao hoac lay mot cuoc tro chuyen giua 2 users
export const createOrGetConversation = async (req, res) => {
    try {
        //lay nguoi dung dang dang nhap tu authentication middleware
        const currentUserId = req.userId;

        //Lay thong tin nguoi dung khac tu URL params
        const receiverId = req.params.userId;

        //kiem tra xem nguoi nhan co phai la valid MongoDB ObjectID hay khong
        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({
                success: false,
                messsage: "Invalid user id."
            });
        }

        //mot nguoi dung khong the tao cuoc tro chuyen voi chinh ho
        if (currentUserId.toString() === receiverId) //khong can toString receiverId vi no duoc lay tu param tren duong dan nen luon la String
        {
            return res.status(400).json({
                success: false,
                message: "Cannot create conversation with yourself."
            });
        }

        //kiem tra xem nguoi nhan (nguoi dung khac) co ton tai khong
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(400).json({
                success: false,
                message: "User not found."
            });
        }

        //tim kiem cuoc tro chuyen giua hai nguoi dung
        const existingConversation = await Conversation.findOne({
            members: {
                $all: [currentUserId, receiverId],
                $size: 2
            }
        }).populate("members", "username email avatar status");

        //neu cuoc tro chuyen giua 2 nguoi dung co ton tai, return no
        if (existingConversation) {
            return res.status(200).json({
                success: true,
                message: "Conversation already exists.",
                conversation: existingConversation
            });
        }

        //neu cuoc tro chuyen khong ton tai, tao cuoc tro chuyen moi
        if (!existingConversation) {

            const newConversation = await Conversation.create({
                members: [currentUserId, receiverId]
            });

            // lay thong tin nguoi dung thay vi chi lay userId

            const populatedConversation = await Conversation.findById(
                newConversation._id
            ).populate("members", "username email avatar status");

            return res.status(201).json({
                success: true,
                message: "Conversation created successfully.",
                conversation: populatedConversation
            });
        }
    }
    catch (error) {
        console.error("Create conversation error: ", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

export const getAllConversations = async (req, res) => {
    try {
        //lay nguoi dung dang dang nhap tu authentication middleware
        const currentUserId = req.userId;

        //tim tat ca cuoc tro chuyen cua nguoi dung hien tai
        const conversations = await Conversation.find({
            members: currentUserId
        }).populate("members", "username email avatar status").sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            total: conversations.length,
            conversations
        });
    }
    catch (error) {
        console.log("Get conversation error: ", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};
