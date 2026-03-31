// src/pages/Reserve.jsx
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import usePost from "@/hooks/usePost";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { Clock, CheckCircle, XCircle } from "lucide-react"; // أيقونات للـ Tabs

const Reserve = () => {
    const { data, loading, error, refetch } = useGet("/api/admin/booking");
    const { deleteData, loading: deleting } = useDelete("/api/admin/booking/delete");
    const { postData, loading: importing } = usePost("/api/admin/booking/import");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // State for Tabs
    const [activeTab, setActiveTab] = useState("pending");

    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    // استخراج البيانات بناءً على هيكل الـ Response الجديد
    const responseData = data?.data || data || {};
    const pendingBookings = responseData.pendingBookings || [];
    const payBookings = responseData.payBookings || [];
    const failerBookings = responseData.failerBookings || [];

    // تحديد البيانات المعروضة بناءً على التبويب النشط
    const currentData = useMemo(() => {
        switch (activeTab) {
            case "pay": return payBookings;
            case "failer": return failerBookings;
            case "pending":
            default: return pendingBookings;
        }
    }, [activeTab, pendingBookings, payBookings, failerBookings]);

    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/booking/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleBulkDelete = async (selectedIds) => {
        if (!selectedIds?.length) return;
        setBulkDeleteIds(selectedIds);
    };

    const confirmBulkDelete = async () => {
        if (!bulkDeleteIds?.length) return;
        setBulkDeleting(true);

        try {
            await deleteData("/api/admin/booking", { ids: bulkDeleteIds });
            refetch();
            toast.success(
                t("reserve_deleted_successfully", {
                    count: bulkDeleteIds.length
                })
            );
        } catch (err) {
            console.error("Bulk delete error:", err);
        } finally {
            setBulkDeleting(false);
            setBulkDeleteIds(null);
        }
    };

    const handleExport = (dataToExport) => {
        if (!dataToExport?.length) {
            toast.error(t("Nodatafound"));
            return;
        }

        const worksheetData = dataToExport.map((booking) => ({
            "Booking ID": booking._id,
            "Customer ID": booking.CustmerId,
            "Product ID": booking.ProductId,
            "Days": booking.number_of_days,
            "Deposit": booking.deposit,
            "Status": booking.status,
            "Date": new Date(booking.createdAt).toLocaleDateString(),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");

        XLSX.writeFile(wb, `bookings_${activeTab}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const renderStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> },
            pay: { color: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> },
            failer: { color: "bg-red-100 text-red-800", icon: <XCircle size={14} /> },
        };

        const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", icon: null };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon}
                {t(`status_${status}`, status)}
            </span>
        );
    };

    const columns = [
        {
            key: "_id",
            header: t("Booking ID"),
            filterable: false,
            render: (val) => <span className="font-mono text-xs text-gray-500">{val?.slice(-6).toUpperCase()}</span>
        },
        {
            key: "number_of_days",
            header: t("Days"),
            filterable: true,
            render: (val) => <span className="font-medium">{val} {t("days")}</span>
        },
        {
            key: "deposit",
            header: t("Deposit"),
            filterable: false,
            render: (val) => <span className="font-semibold text-gray-700">${val}</span>
        },
        {
            key: "status",
            header: t("Status"),
            filterable: false, // لا نحتاج فلتر هنا لأننا نستخدم الـ Tabs
            render: (val) => renderStatusBadge(val),
        },
        {
            key: "createdAt",
            header: t("Date"),
            filterable: false,
            render: (val) => <span className="text-sm text-gray-600">{new Date(val).toLocaleDateString()}</span>
        },
    ];

    if (loading) return <Loader />;
    {
        error && !error.includes("404") && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {t("Errorloadingcategories")}: {error}
            </div>
        )
    }


    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* نظام التبويبات (Tabs) */}
            <div className="mb-6 flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === "pending" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                >
                    <Clock size={16} />
                    {t("Pending Bookings")} ({pendingBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("pay")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === "pay" ? "bg-green-100 text-green-800 shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                >
                    <CheckCircle size={16} />
                    {t("Paid Bookings")} ({payBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("failer")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === "failer" ? "bg-red-100 text-red-800 shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                >
                    <XCircle size={16} />
                    {t("Failed Bookings")} ({failerBookings.length})
                </button>
            </div>

            <DataTable
                data={currentData}
                columns={columns}
                title={t("Reserve Management")}
                // onAdd={() => alert("Add new reserve clicked!")}
                // onDelete={(item) => setDeleteTarget(item)}
                onBulkDelete={handleBulkDelete}
                onExport={handleExport}
                loading={loading || importing}
                addButtonText={t("Add Reserve")}
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                itemsPerPage={10}
                searchable={true}
                filterable={true}
                moduleName={AppModules.RESERVE} // تأكد من وجوده في AppModules
            />

            {/* Delete Dialog */}
            {deleteTarget && (
                <DeleteDialog
                    title={t("delete_reserve")}
                    message={t("confirm_delete_reserve", { id: deleteTarget._id?.slice(-6).toUpperCase() })}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}

            {/* Bulk Delete Dialog */}
            {bulkDeleteIds && (
                <DeleteDialog
                    title={t("delete_multiple_reserves")}
                    message={t("confirm_delete_multiple_reserves", { count: bulkDeleteIds.length })}
                    onConfirm={confirmBulkDelete}
                    onCancel={() => setBulkDeleteIds(null)}
                    loading={bulkDeleting}
                />
            )}
        </div>
    );
};

export default Reserve;