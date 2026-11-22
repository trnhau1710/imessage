
import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api.js";
import {
    connectSocket,
    disconnectSocket
} from "../services/socket.js";

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication when opening the application
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                setUser(response.data.user);

                // Connect Socket.IO after authentication
                connectSocket(token);
            } catch (error) {
                localStorage.removeItem("token");
                disconnectSocket();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        return () => {
            disconnectSocket();
        };
    }, []);

    // Login
    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        setUser(user);

        // Connect Socket.IO after login
        connectSocket(token);

        return response.data;
    };

    // Register
    const register = async (username, email, password) => {
        const response = await api.post("/auth/register", {
            username,
            email,
            password
        });

        return response.data;
    };

    // Logout
    const logout = () => {
        disconnectSocket();

        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    return useContext(AuthContext);
};
