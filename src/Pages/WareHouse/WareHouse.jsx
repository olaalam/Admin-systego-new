// src/pages/warehouses.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const WareHouse = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate(); // هنا نستخدم navigate
  const { data, loading, error, refetch } = useGet("/api/admin/warehouse");
  const { deleteData, loading: deleting } = useDelete("/api/admin/warehouse/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const warehouses = data?.warehouses || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/warehouse/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: t("Name"),
      filterable: true,
      render: (value, row) => (
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/product-warehouse/${row._id}`)}

        >
          {value}  {/* هذا يعرض الاسم */}
        </span>
      )

    },
    { key: "address", header: t("Address"), filterable: true },
    { key: "phone", header: t("Phone"), filterable: true },
    { key: "email", header: t("Email"), filterable: true },
    { key: "number_of_products", header: t("Products"), filterable: false },
    { key: "stock_Quantity", header: t("Stock Quantity"), filterable: false },
    {
      key: "transfer",
      header: t("Transfer"),
      render: (_, row) => (
        <span
          className="text-primary font-bold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/warehouse/transfer/${row._id}`);
          }}
        >
          {t("View Transfer")}
        </span>
      ),
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={warehouses}
        columns={columns}
        title={t("Warehouse Management")}
        addButtonText={t("Add warehouse")}
        onAdd={() => alert("Add new warehouse clicked!")}
        onEdit={(item) => alert(`Edit warehouse: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.WAREHOUSE}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Warehouse")}
          message={`${t("Are you sure you want to delete warehouse")} "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default WareHouse;
