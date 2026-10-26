// src/lib/checkPermission.js

const getStoredUser = () => {
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
