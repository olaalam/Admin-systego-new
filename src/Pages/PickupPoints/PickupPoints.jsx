import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { hasPermission } from "@/lib/checkPermission";

const PickupPoints = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canEdit = hasPermission(AppModules.PICKUP_POINT, "edit");
  const { data, loading, refetch } = useGet("/api/admin/pickup-point");
  const { deleteData, loading: deleting } = useDelete("/api/admin/pickup-point");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pickupPoints = data?.pickupPoints || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/pickup-point/${item._id}`);
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
          className={
            canEdit
              ? "text-blue-600 cursor-pointer hover:underline"
              : "text-gray-800"
          }
          onClick={canEdit ? () => navigate(`edit/${row._id}`) : undefined}
        >
          {value}
        </span>
      ),
    },
    {
      key: "ar_name",
      header: t("Arabic Name"),
      filterable: true,
      render: (value) => value || "-",
    },
    { key: "phone", header: t("Phone"), filterable: true },
    { key: "address", header: t("Address (English)"), filterable: true },
    {
      key: "branch_id",
      header: t("Branch"),
      filterable: false,
      render: (value) =>
        value?.name ? (
          <span className="text-gray-700">{value.name}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "location",
      header: t("Location"),
      filterable: false,
      render: (_, row) =>
        row.lat !== undefined && row.lng !== undefined && row.lat !== null ? (
          <a
            href={`https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lng}#map=16/${row.lat}/${row.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-bold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t("View on Map")}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "is_active",
      header: t("Active"),
      filterable: false,
      render: (value) =>
        value === false ? (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
            {t("Inactive")}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            {t("Active")}
          </span>
        ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={pickupPoints}
        columns={columns}
        title={t("Pickup Points")}
        onEdit={(item) => navigate(`edit/${item._id}`)}
        onAdd={() => navigate("/pickup-point/add")}
        onDelete={(item) => setDeleteTarget(item)}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.PICKUP_POINT}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Pickup Point")}
          message={`${t("Are you sure you want to delete this pickup point")} "${
            deleteTarget.name
          }"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default PickupPoints;
