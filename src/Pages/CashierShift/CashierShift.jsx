import { useMemo } from "react";
import { Link } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import {
    Clock,
    Calendar,
    User,
    Monitor,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Info,
    CheckCircle2,
    XCircle
} from "lucide-react";

const CashierShift = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const { data: shiftData, loading, error } = useGet("/api/admin/cashiershift");

    const columns = useMemo(() => [
        {
            key: "cashier_id",
            header: t("Cashier"),
            render: (val, item) => (
                <Link to={`/${item._id}`} className="group flex items-center gap-4 cursor-pointer">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                {val?.name || t("Unknown")}
                            </p>
                            <ArrowUpRight size={14} className="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                    </div>
                </Link>
            )
        },
        {
            key: "cashierman_id",
            header: t("Cashier Man"),
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <User size={18} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{val?.username || t("Unknown")}</p>
                        <p className="text-[10px] text-teal-600 font-bold uppercase">{val?.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            header: t("Status"),
            render: (status) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${status === 'open'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {t(status)}
                </span>
            )
        },
        {
            key: "total_sale_amount",
            header: t("Sales"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <ArrowUpRight size={14} className="text-emerald-500" />
                    <span className="font-black text-gray-900">{val?.toLocaleString()} <span className="text-[9px] text-gray-400">EGP</span></span>
                </div>
            )
        },
        {
            key: "total_expenses",
            header: t("Expenses"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <ArrowDownLeft size={14} className="text-rose-500" />
                    <span className="font-black text-gray-900">{val?.toLocaleString()} <span className="text-[9px] text-gray-400">EGP</span></span>
                </div>
            )
        },
        {
            key: "net_cash_in_drawer",
            header: t("Net Cash"),
            render: (val) => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-xl w-fit">
                    <Wallet size={14} className="text-teal-400" />
                    <span className="font-black text-white text-xs">{val?.toLocaleString()} <span className="text-[9px] text-gray-400 uppercase">EGP</span></span>
                </div>
            )
        },
        {
            key: "start_time",
            header: t("Shift Timeline"),
            render: (start, item) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="p-1 bg-emerald-50 text-emerald-600 rounded">In</span>
                        <span className="font-semibold text-gray-700">{new Date(start).toLocaleString(isArabic ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {item.end_time && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="p-1 bg-rose-50 text-rose-600 rounded">Out</span>
                            <span className="font-semibold text-gray-500">{new Date(item.end_time).toLocaleString(isArabic ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                </div>
            )
        },
    ], [t, isArabic]);

    const displayData = useMemo(() => {
        if (!shiftData) return [];
        if (Array.isArray(shiftData)) return shiftData;
        return shiftData.shifts || shiftData.data || [];
    }, [shiftData]);

    const stats = useMemo(() => {
        if (!displayData.length) return null;
        return {
            total: displayData.length,
            open: displayData.filter(s => s.status === 'open').length,
            closed: displayData.filter(s => s.status === 'closed').length,
        };
    }, [displayData]);

    if (error) return (
        <div className="p-6 text-center bg-red-50 rounded-2xl border border-red-100 m-6">
            <XCircle className="mx-auto text-red-500 mb-3" size={48} />
            <h3 className="text-red-900 font-bold mb-1">{t("Error loading shifts")}</h3>
            <p className="text-red-600 text-sm">{error}</p>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="w-full">
                {/* Header Section */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("Cashier Shifts")}</h1>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[160px]">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("Active Shifts")}</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.open}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[160px]">
                                <div className="p-2 bg-gray-50 text-gray-500 rounded-xl">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("Total Shifts")}</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <DataTable
                            data={displayData}
                            columns={columns}
                            title={t("Shift Records")}
                            showActions={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashierShift;
