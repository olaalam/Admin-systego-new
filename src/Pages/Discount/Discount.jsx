// src/pages/discounts.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Discount = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/discount");
  const { deleteData, loading: deleting } = useDelete("/api/admin/discount");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  // ✅ متوافق مع الريسبونس
  const discounts = data?.discounts || [];

  /* =======================
     Delete Single
  ======================= */
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/discount/${item._id}`);
      toast.success(t("Discountdeletedsuccessfully"));
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
      await deleteData("/api/admin/discount", {
        ids: bulkDeleteIds,
      });
      toast.success(
        t("DeletedDiscount", { count: bulkDeleteIds.length })
      );
      refetch();
    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  /* =======================
     Status Toggle
  ======================= */
  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/discount/${item._id}`, {
        status: !item.status,
      });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch();
    } catch {
      toast.error(t("Failedtoupdatestatus"));
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusSwitch = (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input

        type="checkbox"
        checked={!!value}
        onChange={() => handleStatusToggle(item)}
        disabled={updatingId === item._id}
        className="sr-only peer"
      />
      <div
        className={`
      w-11 h-6 bg-gray-300 rounded-full peer 
      peer-checked:bg-primary 
      after:content-[''] after:absolute after:top-[2px] after:bg-white  after:rounded-full after:h-5 after:w-5 after:transition-all 
      ${isRTL
            ? "peer-checked:after:-translate-x-full"
            : "peer-checked:after:translate-x-full"}
      after:start-[2px]
    `} />
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">{t("Updating")}</span>
      )}
    </label>
  );

  /* =======================
     Columns
  ======================= */
  const columns = [
    {
      key: "name",
      header: t("DiscountName"),
      filterable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 text-sm">{value}</span>
      ),
    },

    {
      key: "type",
      header: t("Type"),
      filterable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${value === "percentage"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
            }`}
        >
          {value === "percentage" ? t("Percentage") : t("Fixed")}
        </span>
      ),
    },
    {
      key: "amount",
      header: t("Amount"),
      filterable: false,
      render: (value, item) =>
        item.type === "percentage" ? `${value * 100}%` : value,
    },
    {
      key: "status",
      header: t("Status"),
      filterable: false,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingdiscounts")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={discounts}
        columns={columns}
        title={t("DiscountManagement")}
        onAdd={() => navigate("add")}
        onEdit={(item) => alert("edits")}
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        addButtonText={t("AddDiscount")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable
        filterable
        moduleName={AppModules.DISCOUNT}
      />

      {/* Delete Single */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteDiscount")}
          message={t("DeleteDiscountMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete */}
      {bulkDeleteIds && (
        <DeleteDialog
          title={t("DeleteMultipleDiscounts")}
          message={t("DeleteMultipleDiscountsMessage", {
            count: bulkDeleteIds.length,
          })}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Discount;
