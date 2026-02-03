import React, { useState } from "react";
import AddPage from "@/components/AddPage"; // المكون الذي أرفقته
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PermissionAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // جلب البيانات الأساسية لبناء قائمة الصلاحيات
  const { data: permissionData, loading: getLoading } = useGet("/api/admin/permission");
  const { postData, loading: postLoading } = usePost("/api/admin/permission");

  // استخراج الموديولز المتاحة من الـ API
  const availableModules = permissionData?.roles[0]?.permissions || [];

  const handleFormSubmit = async (formData) => {
    // تجهيز البيانات بالشكل الذي يتوقعه الـ API
    const payload = {
      name: formData.name,
      status: formData.status ? "active" : "inactive",
      permissions: formData.permissions, // هذه ستأتي من الـ custom render
    };
    
    await postData(payload);
    navigate("/permission");
  };

  // تعريف الحقول لمرسلها لـ AddPage
  const fields = [
    {
      key: "name",
      label: t("Role Name"),
      type: "text",
      required: true,
      placeholder: t("Enter Role Name"),
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
      required: true,
      render: (formData, setFormData) => (
        <div className="mt-4">
          {/* خيار تحديد الكل */}
          <div className="mb-6 flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
            <input 
              type="checkbox" 
              id="selectAll" 
              className="w-5 h-5 accent-red-600 cursor-pointer"
              onChange={(e) => {
                if (e.target.checked) {
                  const all = availableModules.map(m => ({
                    module: m.module,
                    actions: m.actions.map(a => a.action)
                  }));
                  setFormData(prev => ({ ...prev, permissions: all }));
                } else {
                  setFormData(prev => ({ ...prev, permissions: [] }));
                }
              }}
            />
            <label htmlFor="selectAll" className="font-bold text-gray-700 cursor-pointer">
              {t("Select All Permissions")}
            </label>
          </div>

          {/* شبكة الكروت (التي طلبتيها) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModules.map((m) => {
              const currentModule = (formData.permissions || []).find(p => p.module === m.module);
              const isAllSelected = currentModule?.actions.length === m.actions.length;

              return (
                <div key={m.module} className="border rounded-xl p-4 shadow-sm bg-white">
                  <div className="flex items-center gap-2 mb-3 border-b pb-2">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      className="w-4 h-4 accent-red-600"
                      onChange={(e) => {
                        const otherModules = (formData.permissions || []).filter(p => p.module !== m.module);
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            permissions: [...otherModules, { module: m.module, actions: m.actions.map(a => a.action) }]
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, permissions: otherModules }));
                        }
                      }}
                    />
                    <h3 className="font-bold text-sm uppercase text-gray-800">{m.module.replace('_', ' ')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {m.actions.map((act) => (
                      <label key={act.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-red-600">
                        <input
                          type="checkbox"
                          checked={currentModule?.actions.includes(act.action) || false}
                          className="w-3.5 h-3.5 accent-red-600"
                          onChange={(e) => {
                            const otherModules = (formData.permissions || []).filter(p => p.module !== m.module);
                            let newActions = currentModule ? [...currentModule.actions] : [];
                            
                            if (e.target.checked) {
                              newActions.push(act.action);
                            } else {
                              newActions = newActions.filter(a => a !== act.action);
                            }

                            setFormData(prev => ({
                              ...prev,
                              permissions: newActions.length > 0 
                                ? [...otherModules, { module: m.module, actions: newActions }]
                                : otherModules
                            }));
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
      ),
    },
  ];

  if (getLoading) return <Loader />;

  return (
    <div className="p-6">
      <AddPage
        title={t("Add New Role")}
        description={t("Define role name and assign specific permissions for each module.")}
        fields={fields}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate(-1)}
        loading={postLoading}
        submitButtonText={t("Create Role")}
      />
    </div>
  );
};

export default PermissionAdd;