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
  const [selectedWarehouses, setSelectedWarehouses] = useState(null);
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
      filterable: false,
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
            : "bg-gray-50 text-gray-700"
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
      key: "applyIn",
      header: t("applyIn"),
      filterable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${value === "POS"
            ? "bg-blue-50 text-blue-700"
            : "bg-gray-50 text-gray-700"
            }`}
        >
          {value === "POS" ? t("POS") : t("E-commerce")}
        </span>
      ),
    },
    // ✅ إضافة عمود: هل يشمل جميع المستودعات؟
    {
      key: "all_warehouses",
      header: t("AllWarehouses"), // تأكدي من إضافة هذه الكلمة لملف الترجمة
      filterable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${value ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
            }`}
        >
          {value ? t("Yes") : t("No")}
        </span>
      ),
    },
    // ✅ عمود المستودعات المحددة
    {
      key: "warehouse_ids",
      header: t("Warehouses"),
      filterable: false,
      render: (_, item) => {
        // 1. إذا كان الخصم يشمل كل المستودعات
        if (item.all_warehouses) {
          return (
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
              {t("AllWarehouses") || "جميع المستودعات"}
            </span>
          );
        }

        // 2. التحقق من وجود القائمة
        const warehousesList = item.warehouse_ids || item.warehouses || [];
        const count = warehousesList.length;

        if (count === 0) {
          return <span className="text-gray-400 text-xs">-</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">
              {count} {t("Selected") || "محدد"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // 👈 تمنع تداخل الأحداث مع الجدول
                setSelectedWarehouses(warehousesList);
              }}
              className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
            >
              {t("View") || "عرض"}
            </button>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("Status"),
      filterable: false,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;

  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingdiscounts")}: {error}
      </div>
    )
  }

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
      {/* Dialog عرض المستودعات */}
      {selectedWarehouses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("SelectedWarehouses") || "المستودعات المحددة"}
              </h3>
              <button
                onClick={() => setSelectedWarehouses(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedWarehouses.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {selectedWarehouses.map((wh, idx) => (
                    <li
                      key={wh._id || idx}
                      className="py-2 px-3 text-sm text-gray-700 bg-gray-50 rounded-lg font-medium flex items-center gap-2 my-1"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {/* يتعامل مع البيانات سواء كانت Object بها name أو مجرد ID */}
                      {typeof wh === "object" ? wh.name || wh.title : wh}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t("NoWarehousesFound") || "لا توجد مستودعات"}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedWarehouses(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors"
              >
                {t("Close") || "إغلاق"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discount;
