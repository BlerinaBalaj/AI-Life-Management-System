import { Navigate, useLocation } from "react-router-dom";
import { isAdminRole, useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { token, loading, user } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  const admin = isAdminRole(user?.role);
  if (adminOnly && !admin) return <Navigate to="/home" replace />;
  if (userOnly && admin && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/users" replace />;
  }
  return children;
}
