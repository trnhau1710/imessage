import { Resend } from "resend";

export const sendVerificationEmail = async (email, token) => {

    const resend = new Resend(process.env.RESEND_API_KEY);

    const verificationUrl =
        `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your IMESSAGE account",
        html: `
            <h2>Welcome to IMESSAGE!</h2>
            <p>Please verify your email address.</p>
            <a href="${verificationUrl}">Verify Email</a>
        `
    });

    if (error) {
        console.error("Resend email error:", error);
        throw new Error(error.message);
    }

    return data;
};