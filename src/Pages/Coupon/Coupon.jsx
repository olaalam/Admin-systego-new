// src/pages/coupons.jsx (اقترح تغيير اسم الملف إلى coupons.jsx للتوافق)
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

const Coupon = () => {
  // غيّرنا الـ endpoint إلى coupon بناءً على الـ response الجديد
  const { data: responseData, loading, error, refetch } = useGet("/api/admin/coupon");
  const { deleteData, loading: deleting } = useDelete("/api/admin/coupon");

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const navigate = useNavigate();

  // الـ response الجديد فيه nesting: data.data.coupons
  const coupons = responseData?.coupons || [];

  // دالة لتنسيق التاريخ حسب اللغة (عربي/إنجليزي)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* =======================
     Delete Single
  ======================= */
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/coupon/${item._id}`);
      toast.success(t("CouponDeletedSuccessfully"));
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
      await deleteData("/api/admin/coupon", {
        ids: bulkDeleteIds,
      });
      toast.success(t("CouponsDeletedSuccessfully", { count: bulkDeleteIds.length }));
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
      key: "coupon_code",
      header: t("CouponCode"),
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
          {value === "percentage" ? t("Percentage") : t("Flat")}
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
      key: "minimum_amount",
      header: t("MinimumAmount"),
      filterable: false,
      render: (value) => value ?? "-",
    },
    {
      key: "quantity",
      header: t("TotalQuantity"),
      filterable: false,
      render: (value) => value ?? "-",
    },
    {
      key: "available",
      header: t("Available"),
      filterable: false,
      render: (value, item) => (
        <span className={value <= 0 ? "text-red-600 font-medium" : ""}>
          {value ?? "-"}
        </span>
      ),
    },
    {
      key: "expired_date",
      header: t("ExpiryDate"),
      filterable: false,
      render: (value) => formatDate(value),
    },
    // عمود إضافي اختياري لعدد الاستخدامات
    // {
    //   header: t("Used"),
    //   render: (_, item) => (item.quantity ?? 0) - (item.available ?? 0),
    // },
  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("ErrorLoadingCoupons")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={coupons}
        columns={columns}
        title={t("CouponManagement")}
        onAdd={() => navigate("add")}
        onEdit={(item) => navigate(`edit/${item._id}`)} // غيّرنا الـ alert إلى navigation حقيقي
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        addButtonText={t("AddCoupon")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable
        filterable
        moduleName={AppModules.COUPON}
      />

      {/* Delete Single */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteCoupon")}
          message={t("DeleteCouponMessage", { code: deleteTarget.coupon_code })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete */}
      {bulkDeleteIds && (
        <DeleteDialog
          title={t("DeleteMultipleCoupons")}
          message={t("DeleteMultipleCouponsMessage", {
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

export default Coupon;