
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/chat");
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">

            {/* LEFT INTRODUCTION */}
            <section className="auth-intro">

                <div className="auth-intro-header">
                    <div className="auth-logo-text">
                        IMESSAGE<span>.</span>
                    </div>
                </div>

                <div className="auth-intro-content">

                    <p className="eyebrow">
                        CONNECT / COMMUNICATE / SHARE
                    </p>

                    <h1>
                        Conversations
                        <br />
                        that bring us
                        <br />
                        <span>closer.</span>
                    </h1>

                    <p>
                        A place to stay connected with the people
                        who matter. Share your thoughts, exchange
                        messages and keep every conversation going.
                    </p>

                </div>

                <div className="auth-intro-footer">
                    IMESSAGE — YOUR SPACE TO CONNECT
                </div>

            </section>

            {/* RIGHT LOGIN FORM */}
            <section className="auth-form-panel">

                <div className="auth-form-container">

                    <img
                        src="/images/imessage-logo.png"
                        alt="IMESSAGE Logo"
                        className="auth-form-logo"
                    />

                    <div className="auth-form-heading">
                        <h2>Welcome back.</h2>

                        <p>
                            Enter your details to access your account.
                        </p>
                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>Email address</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />

                        </div>

                        {error && (
                            <p className="auth-error">
                                {error}
                            </p>
                        )}

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        Don't have an account?{" "}

                        <Link to="/register">
                            Create an account
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;
