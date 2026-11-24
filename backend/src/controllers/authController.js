import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { sendVerificationEmail } from "../services/emailService.js";
import { normalize } from "path";

//Ham tao email verification token
const generateVerificationToken = () => {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    return {
        verificationToken,
        hashedToken,
        tokenExpires
    };
};



//Dang ky tai khoan
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body; //nhan du lieu tu request body

        //normalize email
        const normalizedEmail = email?.trim().toLowerCase();

        //kiem tra xem co du du lieu khong
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide required informations."
            });
        }

        //Kiem tra password
        var regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

        if (!regularExpression.test(password)) {
            return res.status(400).json({
                success: false,
                message: "The password needs to be 6 to 16 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
            });
        }



        //Kiem tra trung lap email
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already existed."
            });
        }

        // NEU THANH CONG THI MA HOA MAT KHAU VA TAO NGUOI DUNG MOI TRONG DATABASE  

        //Ma hoa mat khau (Harsh Password)
        const hashedPassword = await bcrypt.hash(password, 10);

        //tao verification token
        const { verificationToken, hashedToken, tokenExpires } = generateVerificationToken();

        //tao nguoi dung
        const newUser = await User.create({
            username,
            email: normalizedEmail,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: tokenExpires

        });

        //Gui verification Email
        try {
            await sendVerificationEmail(newUser.email, verificationToken);
        }
        catch (emailError) {
            console.error("Send verification email error: ", emailError);

            return res.status(503).json({
                success: false,
                messsage: "Account created, but verification email could not be sent. Please request a new verification email."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please check your email to verify your account."
        });
    }
    catch (error) {
        console.log("Register error", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        //kiem tra token co ton tai
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required."
            });
        }

        //Thuc hien hash token duoc nhan tu frontend
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        //Tim nguoi dung co token valid
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification link."
            });
        }

        //Neu valid token thi cap nhat lai trang thai verification cua email
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in."
        });
    }
    catch (error) {
        console.error("Verify email error", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        })
    }
}

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Tranh tiet lo la account co ton tai hay khong
        if (!user || user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "If the account exists and is not verified, a verification email will be sent."
            });
        }

        const { verificationToken, hashedToken, tokenExpires } = generateVerificationToken();

        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = tokenExpires;

        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully."
        });
    }
    catch (error) {
        console.error("Resend verification email error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send verification email."
        });

    }
}


//ham dang nhap
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //kiem tra xem co du du lieu khong
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email & password"
            });
        }

        //tim user bang email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password!"
            })
        }

        //so sanh password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password!"
            })
        }

        //Kiem tra trang thai verification cua email
        if (user.isEmailVerified !== true) {
            return res.status(403).json({
                success: false,
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email before loggin in."
            });
        }


        //Tao JWT Token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        //tra ve thong tin nguoi dung va xoa di password de bao mat
        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: userData
        });
    }
    catch (error) {
        console.log("Login error: ", error.message)

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

// ham lay thong tin nguoi dung dang dang nhap hien tai
export const getCurrentUser = async (req, res) => {
    try {
        //tim nguoi dung thong qua ID tu authenticated token
        const user = await User.findById(req.userId).select("-password"); //select("-password") la khong lay truong password tu database

        //kiem tra xem nguoi dung co ton tai hay khong
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        //tra ve thong tin user
        return res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        console.log("Get current user error: ", error.message)

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

