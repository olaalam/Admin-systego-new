// src/pages/transfers.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import usePut from "@/hooks/usePut";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import DeleteDialog from "@/components/DeleteForm";
import { hasPermission } from "@/lib/checkPermission";

const Transfer = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/transfer");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const transfers = data?.transfers || [];
  const { putData, loading: putting } = usePut();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentUser?.role === "superadmin";
  const userWarehouseId = isSuperAdmin ? "" : currentUser?.warehouse_id || "";
  const canDeletePermission = hasPermission(AppModules.TRANSFER, "delete");

  // التحويل المستلَم مينفعش يتمسح (المخزون اتحرك)،
  // وغير السوبر أدمن لازم يكون طرف في التحويل.
  const canDelete = (transfer) => {
    if (!canDeletePermission) return false;
    if (transfer.status === "received") return false;

    if (!userWarehouseId) return true;

    const fromId = String(
      transfer.fromWarehouseId?._id || transfer.fromWarehouseId || "",
    );
    const toId = String(
      transfer.toWarehouseId?._id || transfer.toWarehouseId || "",
    );

    return fromId === String(userWarehouseId) || toId === String(userWarehouseId);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/api/admin/transfer/${deleteTarget._id}`);

      if (res.data?.success === false) {
        throw new Error(res.data?.error?.message || "Delete failed");
      }

      toast.success(t("Transfer deleted successfully"));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.message ||
          t("Failed to delete transfer"),
      );
    } finally {
      setDeleting(false);
    }
  };

  // اليوزر غير المرتبط بمخزن (Super Admin / All Warehouses) يستلم أي تحويل،
  // والمربوط بمخزن يستلم بس التحويلات الداخلة لمخزنه.
  const canReceive = (transfer) =>
    !userWarehouseId ||
    String(transfer.toWarehouseId?._id || transfer.toWarehouseId) ===
      String(userWarehouseId);

  // دوال لحساب الإجماليات
  const getTotal = (array = []) =>
    array.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const getRequestedQty = (transfer) => getTotal(transfer.products);

  const getApprovedQty = (transfer) => getTotal(transfer.approved_products);

  const getRejectedQty = (transfer) => getTotal(transfer.rejected_products);

  const handleAction = async (transfer, status) => {
    try {
      const products = (transfer.products || []).map((p) => ({
        productId: p.productId?._id || p.productId,
        productPriceId: p.productPriceId?._id || p.productPriceId || null,
        quantity: p.quantity,
      }));

      const payload = {
        warehouseId: transfer.toWarehouseId?._id || transfer.toWarehouseId,
        status,
        approved_products: status === "received" ? products : [],
        rejected_products: status === "rejected" ? products : [],
      };

      await putData(payload, `/api/admin/transfer/${transfer._id}`);

      toast.success(
        status === "received" ? t("Transfer received") : t("Transfer rejected"),
      );
      refetch();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t("Failed to update transfer status"),
      );
      console.error("Action error:", err);
    }
  };

  // عرض حالة التحويلة بشارة ملونة
  const renderStatus = (status) => {
    let bgColor = "bg-gray-100 text-gray-800";
    let text = status;

    if (status === "done" || status === "received") {
      bgColor = "bg-green-100 text-green-800";
      text = t("Completed"); // أو تفريق بين done/received إذا لزم
    } else if (status === "pending" || status === "partially_received") {
      bgColor = "bg-yellow-100 text-yellow-800";
      text = t("Pending");
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {t(text)}
      </span>
    );
  };

  // عرض ملخص الكميات (requested / approved / rejected)
  const renderQuantities = (transfer) => {
    let requested = getRequestedQty(transfer);
    let approved = getApprovedQty(transfer);
    let rejected = getRejectedQty(transfer);

    // إذا كانت المصفوفتين فارغتين وكانت الحالة مكتملة → نفترض أن الكل تم قبوله
    if (approved + rejected === 0 && ["done", "received"].includes(transfer.status)) {
      approved = requested;
      rejected = 0;
    }

    return (
      <div className={`text-sm space-y-1 ${isRTL ? "text-right" : "text-left"}`}>
        <div>
          <span className="text-gray-600">{t("Requested")}:</span>{" "}
          <strong>{requested}</strong>
        </div>
        <div>
          <span className="text-gray-600">{t("Approved")}:</span>{" "}
          <strong className="text-green-700">{approved}</strong>
        </div>
        <div>
          <span className="text-gray-600">{t("Rejected")}:</span>{" "}
          <strong className="text-red-700">{rejected}</strong>
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: "reference",
      header: t("Reference"),
      filterable: false,
      searchable: true,
    },
    {
      key: "fromWarehouseId",
      header: t("FromWarehouse"),
      render: (_, item) => item.fromWarehouseId?.name || "-",
      filterable: false,
    },
    {
      key: "toWarehouseId",
      header: t("ToWarehouse"),
      render: (_, item) => item.toWarehouseId?.name || "-",
      filterable: false,
    },
    {
      key: "date",
      header: t("Date"),
      render: (value) => new Date(value).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US"),
    },
    {
      key: "status",
      header: t("Status"),
      render: (value) => renderStatus(value),
    },
    {
      header: t("ItemsCount"),
      render: (_, item) => item.products?.length || 0,
    },
    {
      header: t("Quantities"),
      render: (_, item) => renderQuantities(item),
    },
    {
      header: t("Approve/Reject"),
      filterable: false,
      render: (_, item) =>
        item.status === "pending" && canReceive(item) ? (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAction(item, "received")}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-bold text-xs"
              title={t("Receive")}
              disabled={putting}
            >
              <CheckCircle size={14} />
              {t("Receive")}
            </button>
            <button
              onClick={() => handleAction(item, "rejected")}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-bold text-xs"
              title={t("Reject")}
              disabled={putting}
            >
              <XCircle size={14} />
              {t("Reject")}
            </button>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingtransfers")}: {error}
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={transfers}
        columns={columns}
        title={t("WarehouseTransfers")}
        addButtonText={t("AddTransfer")}
        onAdd={() => navigate("add")}
        onRowClick={(item) => navigate(`details/${item._id}`)}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.TRANSFER}
        extraActions={(item) =>
          canDelete(item) ? (
            <button
              onClick={() => setDeleteTarget(item)}
              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
              title={t("Delete")}
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <span className="text-gray-300">—</span>
          )
        }
        filters={[
          {
            key: "status",
            label: t("Status"),
            options: [
              { label: t("Pending"), value: "pending" },
              { label: t("Received"), value: "received" },
              { label: t("Rejected"), value: "rejected" },
              { label: t("Done"), value: "done" },
            ],
          },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Transfer")}
          message={t(
            "Are you sure you want to delete this transfer? This action cannot be undone.",
          )}
          confirmText={t("Delete")}
          cancelText={t("Cancel")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Transfer;