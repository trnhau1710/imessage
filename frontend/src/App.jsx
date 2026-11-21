
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Register />
          }
        />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>


        {/* Default Routes */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/chat" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
