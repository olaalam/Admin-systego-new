import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserCheck, UserX, Mail, Phone, Globe } from "lucide-react";

const EcommerceUsers = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/ecommerce-user");
  const navigate = useNavigate();
  const { deleteData, loading: deleting } = useDelete("/api/admin/ecommerce-user");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [deleteTarget, setDeleteTarget] = useState(null);

  const users = data?.data?.users || data?.users || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/ecommerce-user/${item._id || item.id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "image",
      header: t("Image"),
      filterable: false,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          {value ? (
            <img
              src={value}
              alt={item.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-primary/20 shadow-xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {item.name ? item.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-900 block">{item.name}</span>
            <span className="text-xs text-gray-400 block">{item.role || t("Store Manager")}</span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: t("Email"),
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          <span>{value || "—"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: t("Phone"),
      filterable: false,
      render: (value) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-sm" dir="ltr">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span>{value || "—"}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: t("Role"),
      filterable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {value || t("Store Manager")}
        </span>
      ),
    },
    {
      key: "status",
      header: t("Status"),
      filterable: true,
      render: (value) => {
        const isActive = value === "active";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isActive ? (
              <>
                <UserCheck className="w-3 h-3" />
                <span>{t("Active")}</span>
              </>
            ) : (
              <>
                <UserX className="w-3 h-3" />
                <span>{t("Inactive")}</span>
              </>
            )}
          </span>
        );
      },
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={users}
        columns={columns}
        title={t("Ecommerce User Management")}
        onAdd={() => navigate("add")}
        addButtonText={t("Add Ecommerce User")}
        addPath="add"
        editPath={(item) => `edit/${item._id || item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onEdit={() => {}}
        itemsPerPage={10}
        searchable
        filterable
        moduleName="Ecommerce"
        filters={[
          {
            key: "status",
            label: t("Status"),
            options: [
              { label: t("Active"), value: "active" },
              { label: t("Inactive"), value: "inactive" },
            ],
          },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Ecommerce User")}
          message={t("Delete Ecommerce User Message", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default EcommerceUsers;
