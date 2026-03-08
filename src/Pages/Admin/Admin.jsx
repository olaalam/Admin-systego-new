import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Admin = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/admin");
  const { data: whData } = useGet("/api/admin/warehouse");
  const navigate = useNavigate();
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/admin/delete"
  );
  const { t } = useTranslation();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const admins = data?.users || [];

  const warehouseOptions = (whData?.warehouses || []).map((w) => ({ label: w.name, value: w.name }));
  const roleOptions = [...new Set(admins.map((admin) => admin.role_name))].filter(Boolean).map((r) => ({ label: r, value: r }));

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/admin/${item.id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "username", header: t("Name"), filterable: false },
    { key: "email", header: t("Email"), filterable: false },
    { key: "role_name", header: t("Role"), filterable: false },
    { key: "company_name", header: t("CompanyName"), filterable: false },
    {
      key: "warehouse_name",
      header: t("Warehouse"),
      filterable: false,
    },
  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingadmins")}: {error}
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={admins}
        columns={columns}
        title={t("AdminManagement")}
        onAdd={() => navigate("add")}
        addButtonText={t("Addadmin")}
        addPath="add"
        editPath={(item) => `edit/${item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onEdit={() => { }}
        itemsPerPage={10}
        searchable
        filterable
        moduleName="Admin"
        filters={[
          { key: "role_name", label: t("Role"), options: roleOptions },
          { key: "warehouse_name", label: t("Warehouse"), options: warehouseOptions },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog title={t("DeleteAdmin")}
          message={t("DeleteAdminMessage", { username: deleteTarget.username })}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Admin;
