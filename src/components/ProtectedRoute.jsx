// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { hasPermission, isSuperAdminUser } from "@/lib/checkPermission";
import { useTenantInfo } from "@/context/TenantContext";
import FeatureLocked from "@/Pages/FeatureLocked";
import PaymentRequired from "@/Pages/PaymentRequired";

export default function ProtectedRoute({
  children,
  module,
  action,
  requiredFeature,
  featureName,
  adminOnly = false, // 👑 جديد: الأدمن فقط
}) {
  const token = localStorage.getItem("token");
  const { features, loading: tenantLoading, locked } = useTenantInfo();

  // 1. Check Authentication (Logged in?)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 1b. Subscription locked/expired -> require payment
  if (!tenantLoading && locked) {
    return <PaymentRequired />;
  }

  // 2. Check Subscription Feature Flag
  if (requiredFeature && !tenantLoading && features) {
    if (!features[requiredFeature]) {
      return <FeatureLocked featureName={featureName || requiredFeature} />;
    }
  }

  // 3. Admin-only gate (superadmin only)
  if (adminOnly && !isSuperAdminUser()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Check Authorization (Permission?)
  // If module and action are passed, we validate them.
  // module ممكن يكون اسم واحد أو مصفوفة أسماء (يكفي صلاحية واحدة منها)
  if (module && action) {
    const modules = Array.isArray(module) ? module : [module];
    const isAllowed = modules.some((m) => hasPermission(m, action));
    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, show the page
  return children;
}
