// src/Pages/StockTake/StockTake.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const StockTake = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/stocktake");
  const { deleteData, loading: deleting } = useDelete();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stocktakes = data?.stocktakes || data || [];

  const renderStatus = (status) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100 text-gray-800", label: t("Draft") },
      processing: { bg: "bg-blue-100 text-blue-800", label: t("Processing") },
      completed: { bg: "bg-green-100 text-green-800", label: t("Completed") },
      cancelled: { bg: "bg-red-100 text-red-800", label: t("Cancelled") },
      pending: { bg: "bg-yellow-100 text-yellow-800", label: t("Pending") },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const renderType = (type) => {
    if (type === "full") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {t("Full")}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        {t("Partial")}
      </span>
    );
  };

  const renderMode = (mode) => {
    if (mode === "manual") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
          {t("Manual")}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        {t("Excel")}
      </span>
    );
  };

  const columns = [
    {
      key: "code",
      header: t("Code"),
      filterable: false,
    },
    {
      key: "warehouseId",
      header: t("Warehouse"),
      render: (val) => val?.name || "-",
      filterable: false,
    },
    {
      key: "type",
      header: t("Type"),
      render: (val) => renderType(val),
    },
    {
      key: "mode",
      header: t("Mode"),
      render: (val) => renderMode(val),
    },
    {
      key: "createdBy",
      header: t("Created By"),
      render: (val) => val?.username || "-",
    },
    {
      key: "status",
      header: t("Status"),
      render: (val) => renderStatus(val),
    },
    {
      key: "createdAt",
      header: t("Date"),
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString(
              i18n.language === "ar" ? "ar-EG" : "en-US"
            )
          : "-",
    },
  ];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteData(`/api/admin/stocktake/${deleteTarget._id}`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={stocktakes}
        columns={columns}
        title={t("Stock Take")}
        addButtonText={t("Add Stock Take")}
        onAdd={() => navigate("create")}
        onDelete={(item) => setDeleteTarget(item)}
        onRowClick={(item) => navigate(`details/${item._id}`)}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.STOCKTAKE}
        showActions={true}
        filters={[
          {
            key: "type",
            label: t("Type"),
            options: [
              { label: t("Full"), value: "full" },
              { label: t("Partial"), value: "partial" },
            ],
          },
          {
            key: "mode",
            label: t("Mode"),
            options: [
              { label: t("Manual"), value: "manual" },
              { label: t("Excel"), value: "excel" },
            ],
          },
          {
            key: "status",
            label: t("Status"),
            options: [
              { label: t("Draft"), value: "draft" },
              { label: t("Processing"), value: "processing" },
              { label: t("Completed"), value: "completed" },
              { label: t("Cancelled"), value: "cancelled" },
            ],
          },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Stock Take")}
          message={t("Are you sure you want to delete this stock take? This action cannot be undone.")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default StockTake;
