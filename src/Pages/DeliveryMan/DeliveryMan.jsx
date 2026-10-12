import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DeliveryMan = () => {
  const { data, loading, refetch } = useGet("/api/admin/delivery-man");
  const navigate = useNavigate();
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/delivery-man/delete",
  );
  const { t } = useTranslation();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const deliveryMen = data?.deliveryMen || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/delivery-man/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: t("Name"), filterable: false },
    { key: "email", header: t("Email"), filterable: false },
    { key: "phone_number", header: t("phone"), filterable: false },
    { key: "status", header: t("Status"), filterable: false },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={deliveryMen}
        columns={columns}
        title={t("DeliveryMan Management")}
        onAdd={() => navigate("add")}
        addButtonText={t("AddDeliveryMan")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onEdit={() => {}}
        itemsPerPage={10}
        searchable
        filterable
        moduleName="DeliveryMan"
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
          title={t("DeleteDeliveryMan")}
          message={t("DeleteDeliveryManMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default DeliveryMan;
