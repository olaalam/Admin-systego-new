import { Navigate } from "react-router-dom";
import { hasPermission } from "@/lib/checkPermission";
import { useTenantInfo } from "@/context/TenantContext";
import FeatureLocked from "@/Pages/FeatureLocked";

export default function ProtectedRoute({
  children,
  module,
  action,
  requiredFeature,
  featureName,
}) {
  const token = localStorage.getItem("token");
  const { features, loading: tenantLoading } = useTenantInfo();

  // 1. Check Authentication (Logged in?)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Subscription Feature Flag
  if (requiredFeature && !tenantLoading && features) {
    if (!features[requiredFeature]) {
      return <FeatureLocked featureName={featureName || requiredFeature} />;
    }
  }

  // 3. Check Authorization (Permission?)
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

