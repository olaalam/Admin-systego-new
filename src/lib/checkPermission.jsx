export const hasPermission = (moduleName, actionName) => {
    const user = JSON.parse(localStorage.getItem("user")); // Get user from storage
    if (user?.role === "superadmin") return true;

    const userPermissions = user?.permissions || [];


    const module = userPermissions.find(
        (p) => (p.module || p.name)?.toLowerCase() === moduleName?.toLowerCase()
    );
    if (!module) return false;

    return module.actions.some(
        (a) => (a.action || a.name)?.toLowerCase() === actionName?.toLowerCase()
    );
};
