// src/pages/points.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const RedeemPoint = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/redeem-points");
  const { deleteData, loading: deleting } = useDelete("/api/admin/redeem-points");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ✅ important
  const points = data?.points || [];

  /* =======================
     Delete Single
  ======================= */
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/redeem-points/${item._id}`);
      toast.success(t("Point deleted successfully"));
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  /* =======================
     Bulk Delete
  ======================= */
  const handleBulkDelete = (selectedIds) => {
    if (!selectedIds?.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;

    setBulkDeleting(true);
    try {
      await deleteData("/api/admin/redeem-points", {
        ids: bulkDeleteIds,
      });
      toast.success(t("pointss.deleted", { count: bulkDeleteIds.length }));

      refetch();
    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  /* =======================
     Columns
  ======================= */
  const columns = [
    {
      key: "amount",
      header: t("Amount"),
      filterable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 text-sm">{value}</span>
      ),
    },
    {
      key: "points",
      header: t("Points"),
      filterable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
          {value}
        </span>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingpoints")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={points}
        columns={columns}
        title={t("RedeemPointsManagement")}
        addButtonText={t("AddRedeemPoint")}
        onAdd={() => navigate("add")}
        onEdit={() => { }}
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable
        filterable
        moduleName={AppModules.REDEEM_POINTS}
      />

      {/* Delete Single */}
      {deleteTarget && (
        <DeleteDialog
          title={t("redeemPoint.deleteTitle")}
          message={t("redeemPoint.deleteMessage")}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete */}
      {bulkDeleteIds && (
        <DeleteDialog
          title={t("DeleteMultipleRedeemPoints")}
          message={t("redeemPointa.deleteMultiple", { count: bulkDeleteIds.length })}

          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default RedeemPoint;
