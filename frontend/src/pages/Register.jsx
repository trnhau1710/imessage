import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault()//ngan chan viec bi reload / giat trang khi thuc hien an nut submit
        setError("");
        setSubmitting(true);

        try {
            await register(username, email, password);
            navigate("/login");
        }
        catch (error) {
            setError(error.response?.data?.message || "Registration failed, please try again.");
        }
        finally {
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
                        A NEW WAY TO CONNECT
                    </p>

                    <h1>
                        Start a
                        <br />
                        conversation.
                        <br />
                        <span>Make it matter.</span>
                    </h1>

                    <p>
                        Create your account and become part of a space
                        where conversations are simple, personal
                        and always within reach.
                    </p>

                </div>

                <div className="auth-intro-footer">
                    IMESSAGE — YOUR SPACE TO CONNECT
                </div>

            </section>

            {/* RIGHT REGISTER FORM */}
            <section className="auth-form-panel">

                <div className="auth-form-container">

                    <img
                        src="/images/imessage-logo.png"
                        alt="IMESSAGE Logo"
                        className="auth-form-logo"
                    />

                    <div className="auth-form-heading">

                        <h2>Create account.</h2>

                        <p>
                            Fill in your details to get started.
                        </p>

                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>Username</label>

                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                required
                            />

                        </div>

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
                                placeholder="Create a password"
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
                            {submitting
                                ? "Creating account..."
                                : "Create account"
                            }
                        </button>

                    </form>

                    <div className="auth-footer">

                        Already have an account?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );

}
export default Register;