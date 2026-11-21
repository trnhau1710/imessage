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
        <div>
            <h1>Create Account</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </div>

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
                    {submitting ? "Registering..." : "Register"}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
export default Register;