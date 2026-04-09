import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertCircle,
    Package,
    Clock,
    CheckCircle2,
    CalendarOff,
    Warehouse
} from "lucide-react";
import useGet from "@/hooks/useGet";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { AppModules } from "@/config/modules";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';

const Expiring = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const { data: response, loading } = useGet("/api/admin/purchase/expiring");

    // استخراج البيانات بناءً على هيكل الـ JSON الجديد
    const reportData = response || {};
    console.log(reportData);
    const products = reportData?.products || [];
    const stats = reportData?.stats || {};

    const productColumns = useMemo(() => [
        {
            key: "product",
            header: t("Product"),
            render: (val, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.product?.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={18} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-none mb-1">
                            {isArabic ? item.product?.ar_name : item.product?.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">ID: {item.product?._id?.slice(-6)}</span>
                    </div>
                </div>
            )
        },
        {
            key: "warehouse",
            header: t("Warehouse"),
            render: (val, item) => (
                <div className="flex items-center gap-1.5 text-gray-600">
                    <Warehouse size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{item.warehouse?.name || t("N/A")}</span>
                </div>
            )
        },
        {
            key: "expiry_date",
            header: t("Expiry Date"),
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-gray-700">
                        {val ? new Date(val).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB') : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            key: "days_remaining", // تم التعديل ليطابق الـ JSON
            header: t("Status"),
            render: (val, item) => {
                const isExpired = val <= 0;
                return (
                    <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${isExpired ? 'bg-rose-100 text-rose-600' :
                            item.status === 'critical' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {isExpired ? t("Expired") : `${val} ${t("Days Left")}`}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "quantity",
            header: t("Qty"),
            render: (val) => (
                <div className="bg-gray-100 w-fit px-3 py-1 rounded-lg font-black text-gray-700">
                    {val}
                </div>
            )
        }
    ], [t, isArabic]);

    const handleExport = (dataToExport) => {
        if (!dataToExport?.length) {
            toast.error(t("No data found"));
            return;
        }

        const worksheetData = dataToExport.map((item) => ({
            [t("Product Name")]: isArabic ? item.product?.ar_name : item.product?.name,
            [t("Warehouse")]: item.warehouse?.name,
            [t("Expiry Date")]: new Date(item.expiry_date).toLocaleDateString(),
            [t("Days Remaining")]: item.days_remaining,
            [t("Quantity")]: item.quantity,
            [t("Status")]: item.status,
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expiring_Report");
        XLSX.writeFile(wb, `Expiring_Stock_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-2xl">
                                <CalendarOff className="text-rose-600" size={28} />
                            </div>
                            {t("Expiry Management")}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {t("Monitor and manage stock batches approaching expiration")}
                        </p>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatsCard title={t("Total Batches")} value={stats.total} icon={<Package />} color="blue" />
                    <StatsCard title={t("Expired")} value={stats.expired} icon={<AlertCircle />} color="rose" />
                    <StatsCard title={t("Today")} value={stats.expires_today} icon={<Clock />} color="orange" />
                    <StatsCard title={t("Critical")} value={stats.critical} icon={<AlertCircle />} color="amber" />
                    <StatsCard title={t("Warning")} value={stats.warning} icon={<CheckCircle2 />} color="emerald" />
                </div>

                {/* Table Section */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm">
                        <DataTable
                            data={products}
                            columns={productColumns}
                            title={t("Stock Expiry List")}
                            showActions={false}
                            searchable={true}
                            moduleName={AppModules.PURCHASES}
                            onExport={handleExport}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };

    return (
        <Card className="border-none shadow-none bg-white rounded-3xl overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl border ${colors[color]} transition-all group-hover:scale-110`}>
                    {React.cloneElement(icon, { size: 22 })}
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-none mt-1">
                        {(value || 0).toLocaleString()}
                    </h3>
                </div>
            </CardContent>
        </Card>
    );
};

export default Expiring;