
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
            navigate("/");
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;
