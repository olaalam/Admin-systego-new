import React, { useState, useMemo } from "react";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PermissionAdd = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  // حالة البحث (تُعرّف خارج fields حتى لا يُعاد إنشاءها كل render)
  const [searchTerm, setSearchTerm] = useState("");

  const { data: permissionData, loading: getLoading } = useGet(
    "/api/admin/permission/modules-actions",
  );
  const { postData, loading: postLoading } = usePost("/api/admin/permission");

  const availableModules = permissionData?.modules || [];
  const groups = permissionData?.groups || [];

  const moduleLabel = (m) =>
    isArabic
      ? m.label_ar || m.label || m.name
      : m.label || m.name;

  const ACTION_LABELS = {
    View: { en: "View", ar: "عرض" },
    Add: { en: "Add", ar: "إضافة" },
    Edit: { en: "Edit", ar: "تعديل" },
    Delete: { en: "Delete", ar: "حذف" },
    Status: { en: "Status", ar: "تفعيل / إيقاف" },
  };

  const actionLabel = (name) =>
    ACTION_LABELS[name]
      ? isArabic
        ? ACTION_LABELS[name].ar
        : ACTION_LABELS[name].en
      : name;

  // فلترة الموديولات حسب الاسم التقني أو الاسم المعروض أو اسم أي action بداخله
  const filteredModules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return availableModules;
    return availableModules.filter(
      (m) =>
        (m.label || "").toLowerCase().includes(term) ||
        (m.label_ar || "").toLowerCase().includes(term) ||
        (m.name || "").toLowerCase().includes(term) ||
        (m.actions || []).some((a) =>
          (a.name || "").toLowerCase().includes(term),
        ),
    );
  }, [availableModules, searchTerm]);

  const handleFormSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      status: formData.status ? "active" : "inactive",
      permissions: formData.permissions,
    };
    await postData(payload);
    navigate("/permission");
  };

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
          {/* 🔍 Search by name */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("Search by module name...")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          {/* خيار تحديد الكل */}
          <div className="mb-6 flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
            <input
              type="checkbox"
              id="selectAll"
              className="w-5 h-5 accent-red-600 cursor-pointer"
              onChange={(e) => {
                if (e.target.checked) {
                  const all = availableModules.map((m) => ({
                    module: m.name,
                    actions: m.actions.map((a) => a.name),
                  }));
                  setFormData((prev) => ({ ...prev, permissions: all }));
                } else {
                  setFormData((prev) => ({ ...prev, permissions: [] }));
                }
              }}
            />
            <label
              htmlFor="selectAll"
              className="font-bold text-gray-700 cursor-pointer"
            >
              {t("Select All Permissions")}
            </label>
          </div>

          {/* شبكة الكروت مجمعة حسب القسم */}
          <div className="space-y-7">
            {filteredModules.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                {t("No modules match your search")}
              </div>
            )}

            {(groups.length
              ? groups
              : [{ key: "all", en: "All", ar: "الكل" }]
            ).map((group) => {
              const items = filteredModules.filter(
                (m) => (groups.length ? m.group : "all") === group.key,
              );
              if (!items.length) return null;

              return (
                <div key={group.key}>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-gray-700">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    {isArabic ? group.ar : group.en}
                    <span className="text-xs font-medium text-gray-400">
                      ({items.length})
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((m) => {
                      const currentModule = (formData.permissions || []).find(
                        (p) => p.module === m.name,
                      );
                      const isAllSelected =
                        currentModule?.actions.length === m.actions.length;

                      return (
                        <div
                          key={m.id || m.name}
                          className="border rounded-xl p-4 shadow-sm bg-white"
                        >
                          <div className="flex items-center gap-2 mb-3 border-b pb-2">
                            <input
                              type="checkbox"
                              checked={isAllSelected || false}
                              className="w-4 h-4 accent-red-600"
                              onChange={(e) => {
                                const otherModules = (
                                  formData.permissions || []
                                ).filter((p) => p.module !== m.name);
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    permissions: [
                                      ...otherModules,
                                      {
                                        module: m.name,
                                        actions: m.actions.map((a) => a.name),
                                      },
                                    ],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    permissions: otherModules,
                                  }));
                                }
                              }}
                            />
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-gray-800 truncate">
                                {moduleLabel(m)}
                              </h3>
                              <span className="text-[10px] font-mono text-gray-400">
                                {m.name}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {m.actions.map((act) => (
                              <label
                                key={act.id || act.name}
                                className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-red-600"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    currentModule?.actions.includes(act.name) ||
                                    false
                                  }
                                  className="w-3.5 h-3.5 accent-red-600"
                                  onChange={(e) => {
                                    const otherModules = (
                                      formData.permissions || []
                                    ).filter((p) => p.module !== m.name);
                                    let newActions = currentModule
                                      ? [...currentModule.actions]
                                      : [];

                                    if (e.target.checked) {
                                      newActions.push(act.name);
                                    } else {
                                      newActions = newActions.filter(
                                        (a) => a !== act.name,
                                      );
                                    }

                                    setFormData((prev) => ({
                                      ...prev,
                                      permissions:
                                        newActions.length > 0
                                          ? [
                                              ...otherModules,
                                              {
                                                module: m.name,
                                                actions: newActions,
                                              },
                                            ]
                                          : otherModules,
                                    }));
                                  }}
                                />
                                {actionLabel(act.name)}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
        description={t(
          "Define role name and assign specific permissions for each module.",
        )}
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
