import React, { useEffect, useState } from "react";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const PermissionEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: roleData, loading: getLoading, error } = useGet(`/api/admin/permission/${id}/permissions`);
  const { putData, loading: putLoading } = usePut(`/api/admin/permission/${id}`);

  const [initialFormData, setInitialFormData] = useState(null);

  useEffect(() => {
    // تأكدي من الوصول للـ data الصحيحة بناءً على هيكل الـ JSON المرفق في الصورة (roleData.data)
    if (roleData && !initialFormData) {
      const { role, permissions } = roleData;

      const formattedPermissions = permissions.map(p => ({
        module: p.module,
        actions: p.actions.filter(a => a.enabled).map(a => a.action)
      }));

      setInitialFormData({
        name: role.name,
        status: role.status === "active",
        permissions: formattedPermissions
      });
    }
  }, [roleData, initialFormData]);

  const handleFormSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      status: formData.status ? "active" : "inactive",
      permissions: formData.permissions,
    };
    await putData(payload);
    navigate("/permission");
  };

  const fields = [
    {
      key: "name",
      label: t("Role Name"),
      type: "text",
      required: true,
    },
    {
      key: "status",
      label: t("Active Status"),
      type: "switch",
    },
    {
      key: "permissions",
      label: t("Permissions"),
      type: "custom",
      render: (formData, setFormData) => {
        const availablePermissions = roleData?.permissions || [];
        const currentPermissions = formData.permissions || [];

        // وظيفة تحديد الكل (لكل الموديولات)
        const handleSelectAllGlobal = (checked) => {
          if (checked) {
            const all = availablePermissions.map(m => ({
              module: m.module,
              actions: m.actions.map(a => a.action)
            }));
            setFormData({ ...formData, permissions: all });
          } else {
            setFormData({ ...formData, permissions: [] });
          }
        };

        return (
          <div className="space-y-6 mt-4">
            {/* زر Select All الكبير */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <input
                type="checkbox"
                id="globalSelectAll"
                className="w-5 h-5 accent-red-600 cursor-pointer"
                checked={currentPermissions.length === availablePermissions.length && availablePermissions.length > 0}
                onChange={(e) => handleSelectAllGlobal(e.target.checked)}
              />
              <label htmlFor="globalSelectAll" className="font-bold text-gray-700 cursor-pointer">
                {t("Select All Permissions")}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePermissions.map((m) => {
                const moduleInState = currentPermissions.find(p => p.module === m.module);
                const isModuleFull = moduleInState?.actions.length === m.actions.length;

                return (
                  <div key={m.id || m.module || m.name} className="border rounded-xl p-4 shadow-sm bg-white border-gray-100 hover:border-red-100 transition-colors">
                    {/* Header الخاص بكل Card مع Select All للموديول */}
                    <div className="flex items-center gap-2 mb-3 border-b pb-2 border-gray-50">
                      <input
                        type="checkbox"
                        checked={isModuleFull || false}
                        className="w-4 h-4 accent-red-600 cursor-pointer"
                        onChange={(e) => {
                          const otherModules = currentPermissions.filter(p => p.module !== m.module);
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...otherModules, { module: m.module, actions: m.actions.map(a => a.action) }]
                            });
                          } else {
                            setFormData({ ...formData, permissions: otherModules });
                          }
                        }}
                      />
                      <h3 className="font-bold text-sm text-gray-800 uppercase">{m.module.replace('_', ' ')}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {m.actions.map((act, actIdx) => (
                        <label key={act.id || act.action || act.name || actIdx} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-red-600">
                          <input
                            type="checkbox"
                            checked={moduleInState?.actions.includes(act.action) || false}
                            className="w-4 h-4 accent-red-600"
                            onChange={(e) => {
                              const otherModules = currentPermissions.filter(p => p.module !== m.module);
                              let newActions = moduleInState ? [...moduleInState.actions] : [];

                              if (e.target.checked) {
                                newActions.push(act.action);
                              } else {
                                newActions = newActions.filter(a => a !== act.action);
                              }

                              setFormData({
                                ...formData,
                                permissions: newActions.length > 0
                                  ? [...otherModules, { module: m.module, actions: newActions }]
                                  : otherModules
                              });
                            }}
                          />
                          {act.action}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      },
    },
  ];

  if (getLoading || !initialFormData) return <Loader />;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <AddPage
        title={t("Edit Role")}
        description={t("Update permissions and role settings.")}
        fields={fields}
        initialData={initialFormData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate(-1)}
        loading={putLoading}
        submitButtonText={t("Update Role")}
      />
    </div>
  );
};

export default PermissionEdit;