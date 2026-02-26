import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Calendar,
    TrendingUp,
    Filter,
    ArrowUpRight,
    Wallet,
    ArrowRightLeft,
    PieChart,
    CreditCard,
    DollarSign,
    ShoppingBag,
    Receipt,
    Truck,
    Tag,
    AlertCircle,
    Clock,
    MinusCircle
} from "lucide-react";
import useGet from "@/hooks/useGet";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AppModules } from "@/config/modules";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const FinancialReports = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    // Default dates (one month ago to today)
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        startDate: monthAgo,
        endDate: today
    });

    const { data: reportData, loading, refetch } = useGet("/api/admin/finicial-report", {
        params: {
            startDate: filters.startDate,
            endDate: filters.endDate
        }
    });

    const [selectedAccountExpenses, setSelectedAccountExpenses] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReport = () => {
        refetch({
            params: {
                start_date: filters.startDate,
                end_date: filters.endDate
            }
        });
    };



    const handleViewExpenses = (accountExpenses) => {
        setSelectedAccountExpenses(accountExpenses);
        setIsModalOpen(true);
    };

    const accountColumns = useMemo(() => [
        {
            key: "account_name",
            header: t("Account Name"),
            render: (val) => <span className="font-semibold text-gray-800">{val}</span>
        },
        {
            key: "current_balance",
            header: t("Current Balance"),
            render: (val) => (
                <span className={`font-bold ${val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {val?.toLocaleString()} EGP
                </span>
            )
        },
        {
            key: "total_received",
            header: t("Total Received"),
            render: (val) => <span className="text-emerald-500 font-medium">+{val?.toLocaleString()}</span>
        },
        {
            key: "total_spent",
            header: t("Total Spent"),
            render: (val) => <span className="text-rose-500 font-medium">-{val?.toLocaleString()}</span>
        },
        {
            key: "net_total",
            header: t("Net Total"),
            render: (val) => (
                <span className={`font-black ${val >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {val?.toLocaleString()} EGP
                </span>
            )
        },
        {
            key: "transactions_count",
            header: t("Transactions"),
            render: (val) => <span className="text-gray-500 font-bold">{val}</span>
        },
        {
            key: "expenses_count",
            header: t("Expenses"),
            render: (val, item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewExpenses(item)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 font-bold"
                >
                    <Receipt size={14} />
                    {val}
                </Button>
            )
        }
    ], [t]);

    const summary = reportData?.summary || {};
    const dueSummary = reportData?.due_summary || {};
    const pendingSummary = reportData?.pending_summary || {};

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header & Filters */}
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <PieChart className="text-blue-600" size={32} />
                            {t("Financial Reports")}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t("Comprehensive overview of your business financial health")}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                            <Calendar size={16} className="text-gray-400" />
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                            <Calendar size={16} className="text-gray-400" />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
                            />
                        </div>

                        <Button
                            onClick={fetchReport}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-9 ml-auto"
                        >
                            <Filter size={16} className="mr-2" />
                            {t("Filter")}
                        </Button>
                    </div>
                </div>

                {/* Primary Financial Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black font-title text-gray-800 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        {t("Overview")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            title={t("Total Orders")}
                            value={summary.total_orders}
                            icon={<ShoppingBag size={24} />}
                            color="text-indigo-600"
                            bgColor="bg-indigo-50"
                            isNumber={true}
                        />
                        <SummaryCard
                            title={t("Revenue")}
                            value={summary.total_revenue}
                            icon={<TrendingUp size={24} />}
                            color="text-emerald-600"
                            bgColor="bg-emerald-50"
                            suffix="EGP"
                        />
                        <SummaryCard
                            title={t("Expenses")}
                            value={summary.total_expenses}
                            icon={<MinusCircle size={24} />}
                            color="text-rose-600"
                            bgColor="bg-rose-50"
                            suffix="EGP"
                        />
                        <SummaryCard
                            title={t("Net Profit")}
                            value={summary.net_profit}
                            icon={<DollarSign size={24} />}
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                            suffix="EGP"
                            highlight
                        />
                    </div>
                </div>

                {/* Secondary Summary (Tax, Discount, Shipping) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        title={t("Total Tax")}
                        value={summary.total_tax}
                        icon={<Receipt size={24} />}
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Discount")}
                        value={summary.total_discount}
                        icon={<Tag size={24} />}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Shipping")}
                        value={summary.total_shipping}
                        icon={<Truck size={24} />}
                        color="text-cyan-600"
                        bgColor="bg-cyan-50"
                        suffix="EGP"
                    />
                </div>

                {/* Due & Pending Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-black font-title text-gray-800 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
                            {t("Due Summary")}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SummaryCard
                                title={t("Total Due Orders")}
                                value={dueSummary.total_due_orders}
                                icon={<AlertCircle size={20} />}
                                color="text-rose-600"
                                bgColor="bg-rose-50"
                                isNumber={true}
                            />
                            <SummaryCard
                                title={t("Total Due Amount")}
                                value={dueSummary.total_due_amount}
                                icon={<CreditCard size={20} />}
                                color="text-rose-700"
                                bgColor="bg-rose-100/50"
                                suffix="EGP"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-black font-title text-gray-800 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            {t("Pending Summary")}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SummaryCard
                                title={t("Total Pending Orders")}
                                value={pendingSummary.total_pending_orders}
                                icon={<Clock size={20} />}
                                color="text-amber-600"
                                bgColor="bg-amber-50"
                                isNumber={true}
                            />
                            <SummaryCard
                                title={t("Total Pending Value")}
                                value={pendingSummary.total_pending_value}
                                icon={<Wallet size={20} />}
                                color="text-amber-700"
                                bgColor="bg-amber-100/50"
                                suffix="EGP"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Accounts Table */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black font-title text-gray-800 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                        {t("Accounts Performance")}
                    </h3>
                    <div className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {loading && !reportData ? (
                            <div className="h-[300px] flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : (
                            <DataTable
                                data={reportData?.financial_accounts || []}
                                columns={accountColumns}
                                title={t("Financial Accounts")}
                                showActions={false}
                                searchable={true}
                                moduleName={AppModules.FINANCIAL_REPORT}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Expenses Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <Receipt className="text-rose-600" />
                            {t("Expenses Breakdown")}: {selectedAccountExpenses?.account_name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {selectedAccountExpenses?.detailed_expenses?.length > 0 ? (
                            <div className="space-y-4">
                                {selectedAccountExpenses.detailed_expenses.map((expense, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-white shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-gray-900 text-base">{expense.name}</h5>
                                                <p className="text-xs text-gray-400 font-bold">{new Date(expense.date).toLocaleString()}</p>
                                                {expense.note && (
                                                    <p className="text-xs text-gray-500 mt-1 italic italic">"{expense.note}"</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex items-center gap-2">
                                            <span className="text-lg font-black text-rose-600 uppercase">
                                                -{expense.amount?.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">EGP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                    <PieChart size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">{t("No expenses found for this account.")}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const SummaryCard = ({ title, value, icon, color, bgColor, suffix = "", isNumber = false, highlight = false }) => {
    return (
        <Card className={`border-none shadow-sm ${highlight ? 'bg-blue-600' : 'bg-white'} rounded-3xl overflow-hidden hover:shadow-md transition-shadow relative overflow-hidden group`}>
            {highlight && (
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                    <DollarSign size={80} className="text-white" />
                </div>
            )}
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/20 text-white' : `${bgColor} ${color}`} transition-all group-hover:scale-110`}>
                        {icon}
                    </div>
                    {!highlight && <ArrowUpRight size={20} className="text-gray-300" />}
                </div>
                <div>
                    <p className={`text-[10px] ${highlight ? 'text-blue-100' : 'text-gray-400'} font-bold uppercase tracking-wider mb-1`}>{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className={`text-2xl font-black ${highlight ? 'text-white' : 'text-gray-900'}`}>
                            {isNumber ? (value || 0).toLocaleString() : (value || 0).toLocaleString()}
                        </h3>
                        {suffix && <span className={`text-[10px] font-bold ${highlight ? 'text-blue-200' : 'text-gray-400'} uppercase whitespace-nowrap`}>{suffix}</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FinancialReports;
