import dotenv from "dotenv";
dotenv.config();

import { sendVerificationEmail } from "./services/emailService.js";

const testEmail = async () => {
    try {
        await sendVerificationEmail(
            "hauvtct@gmail.com",
            "test-verification-token"
        );

        console.log("Test email sent successfully!");

    } catch (error) {
        console.error("Test email failed:", error.message);
    }
};

testEmail();