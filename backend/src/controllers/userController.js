import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId }
        })
            .select("username email avatar status")
            .sort({ username: 1 });

        return res.status(200).json({
            success: true,
            count: User.length,
            users
        });
    }
    catch (error) {
        console.log("Get all user error: ", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};