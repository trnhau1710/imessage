import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api.js";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    //Tranh gui xac thuc 2 lan trong Strict mode
    const hasVerified = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setMessage("Verification token is missing.");
                return;
            }

            if (hasVerified.current) return;
            hasVerified.current = true;

            try {
                const response = await api.post("/auth/verify-email", {
                    token
                });

                setStatus("success");
                setMessage(
                    response.data.message || "Email verified successfully."
                );
            } catch (error) {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                    "Email verification failed. Please try again."
                );
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="verify-email-container">
            <h2>Email Verification</h2>

            {status === "loading" && (
                <p>Verifying your email...</p>
            )}

            {status === "success" && (
                <>
                    <p>{message}</p>
                    <Link to="/login">Go to Login</Link>
                </>
            )}

            {status === "error" && (
                <>
                    <p>{message}</p>
                    <Link to="/login">Back to Login</Link>
                </>
            )}
        </div>
    );
}

export default VerifyEmail;
