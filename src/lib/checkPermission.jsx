// src/lib/checkPermission.js

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * هل المستخدم الحالي Super Admin؟
 */
export const isSuperAdminUser = () => {
  const user = getStoredUser();
  return (
    user?.role === "superadmin" ||
    user?.role_name?.toLowerCase() === "super admin"
  );
};

/**
 * فحص صلاحية معينة (module + action)
 * - Super Admin: بيرجع true دايمًا
 * - غير كده: بيدور في user.permissions
 */
export const hasPermission = (moduleName, actionName) => {
  // 🔁 يدعم مصفوفة موديولات: يكفي أن يتحقق أحدها
  if (Array.isArray(moduleName)) {
    return moduleName.some((name) => hasPermission(name, actionName));
  }

  const user = getStoredUser();
  if (!user) return false;

  // 👑 Super Admin عنده كل الصلاحيات
  if (
    user.role === "superadmin" ||
    user.role_name?.toLowerCase() === "super admin"
  ) {
    return true;
  }

  const userPermissions = user?.permissions || [];

  const module = userPermissions.find(
    (p) => (p.module || p.name)?.toLowerCase() === moduleName?.toLowerCase(),
  );
  if (!module) return false;

  return module.actions?.some(
    (a) => (a.action || a.name)?.toLowerCase() === actionName?.toLowerCase(),
  );
};

/**
 * فحص صلاحية على أكثر من module — يكفي أن يتحقق أحدها.
 * مفيدة للموديولات اللي كانت مربوطة بأكثر من مكان (مثل التقسيط).
 */
export const hasAnyPermission = (moduleNames, actionName) => {
  const modules = Array.isArray(moduleNames) ? moduleNames : [moduleNames];
  return modules.some((name) => hasPermission(name, actionName));
};
