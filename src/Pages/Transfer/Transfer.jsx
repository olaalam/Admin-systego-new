// src/pages/transfers.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Transfer = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/transfer"); // افترض أن الـ endpoint هو هذا بناءً على الـ response
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  const transfers = data?.transfers || [];

  // دوال لحساب الإجماليات
  const getTotal = (array = []) => 
    array.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const getRequestedQty = (transfer) => getTotal(transfer.products);
  
  const getApprovedQty = (transfer) => getTotal(transfer.approved_products);
  
  const getRejectedQty = (transfer) => getTotal(transfer.rejected_products);

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
      filterable: true,
      searchable: true,
    },
    {
      header: t("FromWarehouse"),
      render: (_, item) => item.fromWarehouseId?.name || "-",
      filterable: true,
    },
    {
      header: t("ToWarehouse"),
      render: (_, item) => item.toWarehouseId?.name || "-",
      filterable: true,
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
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingtransfers")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={transfers}
        columns={columns}
        title={t("WarehouseTransfers")}
        addButtonText={t("AddTransfer")}
        onAdd={() => navigate("add")}
        // إذا كان هناك صفحة تفاصيل/عرض أو تعديل للتحويلة
        editPath={(item) => `details/${item._id}`} // أو `edit/${item._id}` إذا كان قابل للتعديل
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />
    </div>
  );
};

export default Transfer;