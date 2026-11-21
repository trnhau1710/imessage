import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Chat() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div>
            <h1>Mini Messenger</h1>

            <p>Welcome, {user?.username}!</p>
            <p>Email: {user?.email}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Chat;