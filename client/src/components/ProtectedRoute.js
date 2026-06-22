import { Navigate } from "react-router-dom";
import { getCurrentUser, isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ children, adminOnly = false, ownerOnly = false }) {
  const currentUser = getCurrentUser();

  if (!isLoggedIn() || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (ownerOnly && currentUser.role !== "owner") {
    return <Navigate to="/" replace />;
  }

  return children;
}
