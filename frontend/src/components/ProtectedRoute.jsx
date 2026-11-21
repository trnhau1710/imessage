import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    //Cho doi kiem tra trang thai dang nhap
    if (loading) {
        return <p>Checking authentication...</p>;
    }

    //Neu chua dang nhap, chuyen ve login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //Neu dang nhap roi thi cho phep hien thi trang con
    return <Outlet />;
}

export default ProtectedRoute;

