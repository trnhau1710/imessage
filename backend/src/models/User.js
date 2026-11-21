import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6
        },
        avatar: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline"
        }
    },
    {
        timestamps: true
    }

);

const User = mongoose.model("User", userSchema);

export default User;