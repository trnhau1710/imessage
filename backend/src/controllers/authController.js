import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken"

//Dang ky tai khoan
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body; //nhan du lieu tu request body

        //kiem tra xem co du du lieu khong
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide required informations."
            });
        }

        //Kiem tra password
        var minNumberofChars = 6;
        var maxNumberofChars = 16;
        var regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

        if (password.length < minNumberofChars || password.length > maxNumberofChars || !regularExpression.test(password)) {
            return res.status(400).json({
                success: false,
                message: "The password needs to be 6 to 16 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
            });
        }

        // //Kiem tra trung lap username
        // const existingUserName = await User.findOne({
        //     username: username.trim().toLowerCase()
        // });

        // if (existingUserName) {
        //     return res.status(409).json({
        //         success: false,
        //         message: "Username already existed."
        //     });
        // }

        //Kiem tra trung lap email
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already existed."
            });
        }

        // NEU THANH CONG THI MA HOA MAT KHAU VA TAO NGUOI DUNG MOI TRONG DATABASE  

        //Ma hoa mat khau (Harsh Password)
        const harshedPassword = await bcrypt.hash(password, 10);

        //tao nguoi dung
        const newUser = await User.create({
            username,
            email,
            password: harshedPassword
        });

        //loc bo truong password truoc khi tra du lieu ve cho client
        const userData = newUser.toObject();
        delete userData.password;

        //tra thang data da xoa password
        return res.status(201).json({
            success: true,
            message: "Registration successfully.",
            user: userData
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

