import { Navigate } from "react-router-dom";
import { hasPermission } from "@/lib/checkPermission";

export default function ProtectedRoute({ children, module, action }) {
  const token = localStorage.getItem("token");

  // 1. Check Authentication (Logged in?)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Authorization (Permission?)
  // If module and action are passed, we validate them
  if (module && action) {
    const isAllowed = hasPermission(module, action);
    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, show the page
  return children;
}
