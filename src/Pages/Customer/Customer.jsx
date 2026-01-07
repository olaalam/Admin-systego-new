import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";

const Customer = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/customer");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/customer/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // 👇 الريسبونس: data.customers
  const customers = data?.customers || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/customer/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: t("name"),
      filterable: true,
    },
    {
      key: "email",
      header: t("email"),
      filterable: true,
    },
    {
      key: "phone_number",
      header: t("phone"),
      filterable: true,
    },
    {
      key: "address",
      header: t("address"),
      filterable: true,
    },
    {
      key: "is_Due",
      header: t("has_due"),
      filterable: true,
      render: (value) =>
        value ? (
          <span className="text-red-600 font-semibold">{t("yes")}</span>
        ) : (
          <span className="text-green-600 font-semibold">{t("no")}</span>
        ),
    },
    {
      key: "amount_Due",
      header: t("amount_due"),
      filterable: false,
      render: (value) => value || 0,
    },
    {
      key: "total_points_earned",
      header: t("points"),
      filterable: false,
      render: (value) => value || 0,
    },

  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">
        {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable

        data={customers}
        columns={columns}
        title={t("customer_management")}
        addButtonText={t("add_customer")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onAdd={() => alert("Add new supplier clicked!")}
        onEdit={(item) => alert(`Edit supplier: ${item.username}`)}
        itemsPerPage={10}
        searchable
        filterable
      />

      {deleteTarget && (
        <DeleteDialog
       title={t("delete_customer_title")}
message={t("confirm_delete_customer", { name: deleteTarget.name })}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Customer;
