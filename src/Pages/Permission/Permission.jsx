import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";

const Permission = () => {
  const { t } = useTranslation();
  // جلب البيانات من المسار الخاص بالصلاحيات
  const { data, loading, error, refetch } = useGet("/api/admin/permission");
  const { deleteData, loading: deleting } = useDelete("/api/admin/permission/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null); // للتحكم في عرض مودال الصلاحيات

  const roles = data?.roles || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/permission/${item.id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: t("Name"), filterable: true },
    {
      key: "permissions",
      header: t("Permissions"),
      render: (_, row) => (
        <button
          onClick={() => setViewTarget(row)}
          className="text-red-600 underline hover:text-red-800"
        >
          {t("View")}
        </button>
      ),
    },

  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={roles}
        columns={columns}
        title={t("Roles Table")}
        addButtonText={t("Add New Role")}
        onAdd={() => alert("Navigate to add role page")}
        onEdit={(item) => alert(`Edit role: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        editPath={(item) => `edit/${item.id}`}
        addPath="add"

        itemsPerPage={10}
        searchable={true}
      />

      {/* مودال عرض الصلاحيات المحسن */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header: يحتوي على العنوان وزر الإغلاق */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {t("Permissions")}: <span className="text-red-600">{viewTarget.name}</span>
              </h2>
              <button
                onClick={() => setViewTarget(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body: عرض الصلاحيات بشكل منظم */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid gap-6">
                {viewTarget.permissions?.map((moduleItem, idx) => (
                  <div key={idx} className="border-b border-gray-50 pb-4 last:border-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 capitalize flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {moduleItem.module}:
                    </h3>
                    <div className="flex flex-wrap gap-2 px-4">
                      {moduleItem.actions.map((act) => (
                        <span
                          key={act.id}
                          className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-medium border border-slate-200"
                        >
                          {act.action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: زر إغلاق سفلي إضافي */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewTarget(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all text-sm font-medium shadow-md"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Role")}
          message={`${t("Are you sure you want to delete")} "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Permission;