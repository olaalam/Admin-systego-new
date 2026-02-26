import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Calendar,
    FileText,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    CreditCard,
    Truck,
    Filter,
    ArrowUpRight,
    Eye,
    Percent,
    Receipt
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
    DialogDescription,
} from "@/components/ui/dialog";

const OrdersReports = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    // Default dates (today)
    const today = new Date().toISOString().split('T')[0];
    const [dates, setDates] = useState({
        startDate: today,
        endDate: today
    });

    const { data: reportData, loading, error, refetch } = useGet("/api/admin/orders/report", {
        params: {
            startDate: dates.startDate,
            endDate: dates.endDate
        }
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReport = () => {
        refetch({
            params: {
                startDate: dates.startDate,
                endDate: dates.endDate
            }
        });
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const columns = useMemo(() => [
        {
            key: "reference",
            header: t("Reference"),
            render: (val) => <span className="font-bold text-gray-900">{val}</span>
        },
        {
            key: "cashier_id",
            header: t("Cashier"),
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{val?.username}</span>
                </div>
            )
        },
        {
            key: "warehouse_id",
            header: t("Warehouse"),
            render: (val) => <span className="text-sm text-gray-600">{val?.name}</span>
        },
        {
            key: "grand_total",
            header: t("Grand Total"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-black text-emerald-600">{val?.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 uppercase">EGP</span>
                </div>
            )
        },
        {
            key: "paid_amount",
            header: t("Paid"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-black text-blue-600">{val?.toLocaleString()}</span>
                </div>
            )
        },
        {
            key: "Due",
            header: t("Due"),
            render: (val) => (
                <span className={`font-bold ${val > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                    {val?.toLocaleString()}
                </span>
            )
        },
        {
            key: "date",
            header: t("Date"),
            render: (val) => (
                <span className="text-xs text-gray-500 font-medium">
                    {new Date(val).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            )
        },
        {
            key: "actions",
            header: t("dataTable.actions"),
            render: (_, item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                    <Eye size={16} />
                </Button>
            )
        }
    ], [t, isArabic]);

    const summary = reportData?.summary || {};

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header & Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <FileText className="text-blue-600" size={32} />
                            {t("Orders Reports")}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t("Analyze your sales performance across dates")}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 px-3">
                            <Calendar size={18} className="text-gray-400" />
                            <Input
                                type="date"
                                value={dates.startDate}
                                onChange={(e) => setDates(prev => ({ ...prev, startDate: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-40"
                            />
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-2 px-3">
                            <Calendar size={18} className="text-gray-400" />
                            <Input
                                type="date"
                                value={dates.endDate}
                                onChange={(e) => setDates(prev => ({ ...prev, endDate: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-40"
                            />
                        </div>
                        <Button
                            onClick={fetchReport}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                        >
                            <Filter size={18} className="mr-2" />
                            {t("Filter")}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 tracking-tight">
                    <SummaryCard
                        title={t("Total Sales")}
                        value={summary.totalAmount}
                        icon={<TrendingUp size={24} />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Paid")}
                        value={summary.totalPaid}
                        icon={<CreditCard size={24} />}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Discount")}
                        value={summary.totalDiscount}
                        icon={<Percent size={24} />}
                        color="text-rose-600"
                        bgColor="bg-rose-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Tax")}
                        value={summary.totalTax}
                        icon={<Receipt size={24} />}
                        color="text-teal-600"
                        bgColor="bg-teal-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Shipping")}
                        value={summary.totalShipping}
                        icon={<Truck size={24} />}
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                        suffix="EGP"
                    />
                    <SummaryCard
                        title={t("Total Orders")}
                        value={reportData?.totalOrders}
                        icon={<ShoppingBag size={24} />}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                        isNumber={true}
                    />
                </div>

                {/* Table Section */}
                <div className="overflow-hidden">
                    {loading && !reportData ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <DataTable
                                data={reportData?.orders || []}
                                columns={columns}
                                title={t("Order List")}
                                showActions={false}
                                filterable={true}
                                searchable={true}
                                moduleName={AppModules.ORDERS_REPORT}
                                onRowClick={handleViewDetails}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-7xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <ShoppingBag className="text-blue-600" />
                            {t("Order Details")}: {selectedOrder?.reference}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {selectedOrder && (
                            <div className="grid grid-cols-1 gap-8 py-4">
                                {/* Primary Info */}
                                <div className="space-y-6">
                                    <DetailSection title={t("General Info")}>
                                        <DetailItem label={t("Reference")} value={selectedOrder.reference} isBold />
                                        <DetailItem label={t("Date")} value={new Date(selectedOrder.date).toLocaleString()} />
                                        <DetailItem label={t("Status")} value={selectedOrder.order_pending === 0 ? t("Completed") : t("Pending")} />
                                        <DetailItem label={t("Note")} value={selectedOrder.note || "—"} />
                                    </DetailSection>

                                    <DetailSection title={t("Warehouse")}>
                                        <DetailItem label={t("Warehouse")} value={selectedOrder.warehouse_id?.name} />
                                    </DetailSection>

                                    <DetailSection title={t("Staff & Shift")}>
                                        <DetailItem label={t("Cashier")} value={selectedOrder.cashier_id?.username} />
                                        <DetailItem label={t("Shift Start")} value={selectedOrder.shift_id?.start_time ? new Date(selectedOrder.shift_id.start_time).toLocaleString() : "—"} />
                                        <DetailItem label={t("Shift Status")} value={selectedOrder.shift_id?.status} />
                                    </DetailSection>
                                </div>

                                {/* Financial Info */}
                                <div className="space-y-6">
                                    <DetailSection title={t("Financial Summary")} highlight>
                                        <DetailItem label={t("Total")} value={`${(selectedOrder.total || 0).toLocaleString()} EGP`} />
                                        <DetailItem label={t("Tax Rate")} value={`${selectedOrder.tax_rate}%`} />
                                        <DetailItem label={t("Tax Amount")} value={`${(selectedOrder.tax_amount || 0).toLocaleString()} EGP`} />
                                        <DetailItem label={t("Discount")} value={`${(selectedOrder.discount || 0).toLocaleString()} EGP`} />
                                        <DetailItem label={t("Shipping")} value={`${(selectedOrder.shipping || 0).toLocaleString()} EGP`} />
                                        <div className="pt-4 mt-2 border-t border-gray-100">
                                            <DetailItem label={t("Grand Total")} value={`${(selectedOrder.grand_total || 0).toLocaleString()} EGP`} isBold large />
                                            <DetailItem label={t("Paid Amount")} value={`${(selectedOrder.paid_amount || 0).toLocaleString()} EGP`} color="text-blue-600" />
                                            <DetailItem label={t("Remaining")} value={`${(selectedOrder.remaining_amount || 0).toLocaleString()} EGP`} color="text-rose-500" />
                                        </div>
                                    </DetailSection>

                                    <DetailSection title={t("Payment Accounts")}>
                                        {selectedOrder.account_id?.map((acc, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2">
                                                <span className="text-sm font-semibold">{acc.name}</span>
                                                <span className="text-xs text-gray-500">{t("Balance")}: {acc.balance?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </DetailSection>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DetailSection = ({ title, children, highlight = false }) => (
    <div className={`p-5 rounded-3xl ${highlight ? 'bg-blue-50/50 border border-blue-100' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {title}
        </h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, isBold = false, large = false, color = "text-gray-900" }) => (
    <div className="flex justify-between items-center gap-4">
        <span className="text-xs text-gray-400 font-bold uppercase">{label}</span>
        <span className={`${large ? 'text-lg' : 'text-sm'} ${isBold ? 'font-black' : 'font-medium'} ${color} text-right`}>
            {value}
        </span>
    </div>
);

const SummaryCard = ({ title, value, icon, color, bgColor, suffix = "", isNumber = false }) => {
    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>
                        {icon}
                    </div>
                    <ArrowUpRight size={20} className="text-gray-300" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-2xl font-black text-gray-900">
                            {isNumber ? value || 0 : (value || 0).toLocaleString()}
                        </h3>
                        {suffix && <span className="text-[10px] font-bold text-gray-400 uppercase">{suffix}</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrdersReports;
