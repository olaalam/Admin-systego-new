import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
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
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import usePut from "@/hooks/usePut";
import useBranchPosOptions from "@/hooks/useBranchPosOptions";
import BranchPosFilter from "@/components/BranchPosFilter";


const CashierShift = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const { putData } = usePut();

    // ÙÙ„ØªØ± Ø§Ù„ÙØ±ÙˆØ¹ (Warehouse) + Ù†Ù‚Ø§Ø· Ø§Ù„Ø¨ÙŠØ¹ (POS = Cashier)
    const [filters, setFilters] = useState({
        warehouse_id: "",
        cashier_id: "",
    });
    const { warehouses, cashiers } = useBranchPosOptions();

    const apiUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.warehouse_id) params.append("warehouse_id", filters.warehouse_id);
        if (filters.cashier_id) params.append("cashier_id", filters.cashier_id);
        const qs = params.toString();
        return qs ? `/api/admin/cashiershift?${qs}` : "/api/admin/cashiershift";
    }, [filters]);

    const { data: shiftData, loading, error, refetch } = useGet(apiUrl);

    const columns = useMemo(() => [
        {
            key: "cashier_id",
            header: t("Cashier"),
            render: (val) => (
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {val?.name || t("Unknown")}
                        </p>
                    </div>
                </div>

            )
        },
        {
            key: "cashierman_id",
            header: t("Cashier Man"),
            render: (val, item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <User size={18} className="text-gray-600" />
                    </div>
                    <Link to={`/cashier-shift/cashier/${item.cashierman_id?._id || item._id}`} className="group flex items-center gap-4 cursor-pointer">

                        <div>
                            <p className="font-semibold text-gray-800">{val?.username || t("Unknown")}</p>
                            <p className="text-[10px] text-red-600 font-bold uppercase">{val?.email}</p>
                            <ArrowUpRight size={14} className="text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />

                        </div>
                    </Link>
                </div>
            )
        },
        {
            key: "status",
            header: t("Status"),
            render: (status, item) => {
                const isOpen = status === 'open';

                // Ø¯Ø§Ù„Ø© Ù…Ø®ØµØµØ© Ù„Ù„Ø¥ØºÙ„Ø§Ù‚ ÙÙ‚Ø·
                const handleCloseShift = async () => {
                    // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù…ØºÙ„Ù‚Ø© Ø¨Ø§Ù„ÙØ¹Ù„ Ù„Ø§ Ù†ÙØ¹Ù„ Ø´ÙŠØ¦Ø§Ù‹
                    if (!isOpen) return;

                    try {
                        // Ù†Ø±Ø³Ù„ Ø¯Ø§Ø¦Ù…Ø§Ù‹ status: 'closed' Ù„Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø­Ø¯Ø¯
                        await putData({ status: 'closed' }, `/api/admin/cashiershift/close/${item._id}`);

                        toast.success(t("shift_closed_successfully"));

                        // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„ÙŠØ¹ÙƒØ³ Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨Ø±ÙˆØ¬ÙƒØª
                        refetch();
                    } catch (err) {
                        toast.error(t("failed_to_close_shift"));
                    }
                };

                return (
                    <div className="flex items-center gap-3">
                        {/* ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø²Ø± Ù„ÙŠÙƒÙˆÙ† Ù‚Ø§Ø¨Ù„Ø§Ù‹ Ù„Ù„Ø¶ØºØ· ÙÙ‚Ø· Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„ÙˆØ±Ø¯ÙŠØ© Ù…ÙØªÙˆØ­Ø© */}
                        <button
                            onClick={handleCloseShift}
                            disabled={!isOpen} // ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø²Ø± Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„ÙˆØ±Ø¯ÙŠØ© Ù…ØºÙ„Ù‚Ø©
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isOpen ? 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer' : 'bg-gray-200 cursor-not-allowed'
                                }`}
                            title={isOpen ? t("Click to close shift") : t("Shift is already closed")}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isOpen
                                    ? (isArabic ? '-translate-x-6' : 'translate-x-6')
                                    : (isArabic ? '-translate-x-1' : 'translate-x-1')
                                    }`}
                            />
                        </button>

                        {/* Ø¹Ø±Ø¶ Ø§Ù„Ù†Øµ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„ Ù„Ù„Ø­Ø§Ù„Ø© */}
                        <span className={`text-[10px] font-black uppercase ${isOpen ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {t(status)}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "total_sale_amount",
            header: t("Sales"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <ArrowUpRight size={14} className="text-emerald-500" />
                    <span className="font-black text-gray-900">{val?.toLocaleString()} <span className="text-[9px] text-gray-400">{t("EGP")}</span></span>
                </div>
            )
        },
        {
            key: "total_expenses",
            header: t("Expenses"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <ArrowDownLeft size={14} className="text-rose-500" />
                    <span className="font-black text-gray-900">{val?.toLocaleString()} <span className="text-[9px] text-gray-400">{t("EGP")}</span></span>
                </div>
            )
        },
        {
            key: "returns_count",
            header: t("Returns"),
            render: (_, item) => (
                <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-900">{item.returns_count ?? 0}</div>
                    <div className="text-[10px] text-slate-500">{t("orders")}</div>
                </div>
            )
        },
        {
            key: "total_returns",
            header: t("Return Amount"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <ArrowDownLeft size={14} className="text-blue-500" />
                    <span className="font-black text-gray-900">{val?.toLocaleString() ?? 0} <span className="text-[9px] text-gray-400">{t("EGP")}</span></span>
                </div>
            )
        },
        {
            key: "net_cash_in_drawer",
            header: t("Net Cash"),
            render: (val) => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-xl w-fit">
                    <Wallet size={14} className="text-red-400" />
                    <span className="font-black text-white text-xs">{val?.toLocaleString()} <span className="text-[9px] text-gray-400 uppercase">{t("EGP")}</span></span>
                </div>
            )
        },
        {
            key: "start_time",
            header: t("Shift Timeline"),
            render: (start, item) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="p-1 bg-emerald-50 text-emerald-600 rounded">{t("In")}</span>
                        <span className="font-semibold text-gray-700">{new Date(start).toLocaleString(isArabic ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {item.end_time && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="p-1 bg-rose-50 text-rose-600 rounded">{t("Out")}</span>
                            <span className="font-semibold text-gray-500">{new Date(item.end_time).toLocaleString(isArabic ? 'ar-EG' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                </div>
            )
        },
    ], [t, isArabic, putData]);

    const handleExport = (dataToExport) => {
        // 1. Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø¨ÙŠØ§Ù†Ø§Øª
        if (!dataToExport?.length) {
            toast.error(t("Nodatafound"));
            return;
        }

        // 2. ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ø´ÙƒÙ„ Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ù€ Excel (Mapping)
        const worksheetData = dataToExport.map((shift) => ({
            [t("Cashier")]: shift.cashier_id?.name || t("Unknown"),
            [t("Cashier Man")]: shift.cashierman_id?.username || t("Unknown"),
            [t("Email")]: shift.cashierman_id?.email || "",
            [t("Status")]: t(shift.status),
            [t("Sales")]: shift.total_sale_amount || 0,
            [t("Expenses")]: shift.total_expenses || 0,
            [t("Net Cash")]: shift.net_cash_in_drawer || 0,
            [t("Start Time")]: shift.start_time
                ? new Date(shift.start_time).toLocaleString(isArabic ? 'ar-EG' : 'en-US')
                : "",
            [t("End Time")]: shift.end_time
                ? new Date(shift.end_time).toLocaleString(isArabic ? 'ar-EG' : 'en-US')
                : "",
        }));

        // 3. Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù€ Workbook ÙˆØ§Ù„Ù€ Worksheet
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Shifts");

        // 4. ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù„Ù Ø¨Ø§Ø³Ù… Ù…Ø¹Ø¨Ø±
        XLSX.writeFile(wb, `cashier_shifts_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

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

    {
        error && !error.includes("404") && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {t("Errorloadingcashiershifts")}: {error}
            </div>
        )
    }

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

                {/* Filters: Branch + POS */}
                <div className="mb-6 flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <BranchPosFilter
                        value={filters}
                        onChange={(patch) => setFilters(prev => ({ ...prev, ...patch }))}
                        warehouses={warehouses}
                        cashiers={cashiers}
                        selectClassName="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[160px]"
                    />
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
                            moduleName={AppModules.CASHIER_SHIFT_REPORT}
                            filterable={true}
                            searchable={true}
                            onExport={handleExport}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashierShift;
