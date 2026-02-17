import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { AppModules } from "@/config/modules";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";

const TransferWarehouse = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === "ar";

    const [activeTab, setActiveTab] = useState("pending");

    const { data, loading, error } = useGet(`/api/admin/transfer/get/${id}`);

    const pendingTransfers = data?.pending || [];
    const doneTransfers = data?.done || [];

    const columns = [
        {
            key: "reference",
            header: t("Reference"),
            filterable: true,
            searchable: true,
        },
        {
            key: "fromWarehouseId",
            header: t("From Warehouse"),
            render: (_, row) => row.fromWarehouseId?.name || "-",
            filterable: true,
        },
        {
            key: "toWarehouseId",
            header: t("To Warehouse"),
            render: (_, row) => row.toWarehouseId?.name || "-",
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
            render: (value) => {
                let bgColor = "bg-gray-100 text-gray-800";
                if (value === "done" || value === "received") bgColor = "bg-green-100 text-green-800";
                else if (value === "pending") bgColor = "bg-yellow-100 text-yellow-800";

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                        {t(value)}
                    </span>
                );
            },
        },
        {
            header: t("Items"),
            render: (_, row) => row.products?.length || 0,
        },
    ];

    if (loading) return <Loader />;
    if (error) return <div className="p-6 text-center text-red-600 font-bold">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className={`${isRTL ? "rotate-180" : ""}`} size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{t("Warehouse Transfers")}</h1>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6 flex max-w-fit">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "pending"
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    <Clock size={18} />
                    {t("Pending Transfers")}
                    <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${activeTab === "pending" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                        {pendingTransfers.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("done")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "done"
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    <CheckCircle2 size={18} />
                    {t("Done Transfers")}
                    <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${activeTab === "done" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                        {doneTransfers.length}
                    </span>
                </button>
            </div>

            {/* Content Section */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <DataTable
                    data={activeTab === "pending" ? pendingTransfers : doneTransfers}
                    columns={columns}
                    title={activeTab === "pending" ? t("Pending List") : t("Completed List")}
                    itemsPerPage={10}
                    searchable={true}
                    filterable={true}
                    onRowClick={(row) => navigate(`/transfer/details/${row._id}`)}
                    moduleName={AppModules.TRANSFER}
                />
            </div>
        </div>
    );
};

export default TransferWarehouse;
