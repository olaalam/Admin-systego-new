import { useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import {
    CheckCircle2, X, Clock, Eye, CreditCard, Info, Package,
    Truck, RotateCcw, AlertTriangle, Calendar, RefreshCw, Filter, Check, Loader2, ChevronDown, ShoppingBag, DollarSign
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Modal Component to show Cart Items (Products)
const FinancialsModal = ({ items, onCancel }) => {
    const { t } = useTranslation();

    if (!items) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <Package className="text-indigo-400" size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">{t("Order Items")}</h3>
                                <p className="text-slate-400 text-xs mt-0.5">{t("Details of purchased products in this order")}</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors group text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                            <div
                                key={item._id || idx}
                                className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center justify-between transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200/60 bg-white p-1 shrink-0">
                                        <img
                                            src={item.product?.image}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{item.product?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            {t("Qty")}: <span className="font-bold text-slate-800">{item.quantity}</span> × {item.price} {t("EGP")}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t("Total")}</p>
                                    <p className="text-base font-black text-indigo-600">{item.price * item.quantity} <span className="text-[10px] text-slate-500 font-normal">{t("EGP")}</span></p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 px-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                <Info className="text-slate-300" size={28} />
                            </div>
                            <h4 className="text-slate-700 font-bold text-sm">{t("No items found")}</h4>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                        {t("Close")}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PaymentEco = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    const { data: responseData, loading, refetch } = useGet("/api/admin/online-orders");
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedItems, setSelectedItems] = useState(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusDialogOrder, setStatusDialogOrder] = useState(null);
    const [statusDialogReason, setStatusDialogReason] = useState("");

    // قائمة الحالات الكاملة من الصورة
    const statusOptions = [
        { id: "all", label: t("All Statuses"), icon: Filter, color: "text-slate-600", bg: "bg-slate-100" },
        { id: "pending", label: t("Pending"), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "confirmed", label: t("Confirmed"), icon: Check, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "processing", label: t("Processing"), icon: Loader2, color: "text-indigo-600", bg: "bg-indigo-50" },
        { id: "out_for_delivery", label: t("Out for Delivery"), icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
        { id: "delivered", label: t("Delivered"), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "returned", label: t("Returned"), icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50" },
        { id: "failed_to_deliver", label: t("Failed to Deliver"), icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
        { id: "canceled", label: t("Canceled"), icon: X, color: "text-red-600", bg: "bg-red-50" },
        { id: "scheduled", label: t("Scheduled"), icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
        { id: "refund", label: t("Refund"), icon: RefreshCw, color: "text-cyan-600", bg: "bg-cyan-50" },
        { id: "rejected", label: t("Rejected"), icon: X, color: "text-red-600", bg: "bg-red-50" },
    ];

    const displayData = useMemo(() => {
        if (!responseData?.orders) return [];
        if (activeTab === "all") return responseData.orders;
        return responseData.orders.filter(order => order.status === activeTab);
    }, [responseData, activeTab]);

    const getStatusCount = (status) => {
        if (!responseData?.orders) return 0;
        if (status === "all") return responseData.orders.length;
        return responseData.orders.filter(order => order.status === status).length;
    };

    const updateOrderStatus = async (id, newStatus, statusDescription = "") => {
        try {
            setUpdating(true);
            const res = await api.patch(`/api/admin/online-orders/${id}/status`, {
                status: newStatus,
                statusDescription,
            });
            if (res.data?.success) {
                toast.success(res.data?.message || t("Status updated successfully"));
                refetch();
            } else {
                toast.error(res.data?.message || t("Failed to update status"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || t("Request failed"));
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusSelect = (item, newStatus) => {
        if (!newStatus || newStatus === item.status) return;
        if (newStatus === "rejected") {
            setStatusDialogOrder(item);
            setStatusDialogReason("");
            setStatusDialogOpen(true);
            return;
        }
        updateOrderStatus(item._id, newStatus);
    };

    const handleRejectSubmit = async () => {
        if (!statusDialogOrder) return;
        await updateOrderStatus(statusDialogOrder._id, "rejected", statusDialogReason.trim());
        setStatusDialogOpen(false);
        setStatusDialogOrder(null);
        setStatusDialogReason("");
    };

    const columns = useMemo(() => [
        {
            key: "_id",
            header: t("Order ID"),
            render: (val) => (
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">
                    #{val?.slice(-6).toUpperCase()}
                </span>
            )
        },
        {
            key: "totalOrderPrice",
            header: t("Amount"),
            render: (val) => (
                <span className="font-black text-slate-900 text-sm">
                    {val} <span className="text-[10px] text-slate-400 font-semibold uppercase">{t("EGP")}</span>
                </span>
            )
        },
        {
            key: "paymentMethod",
            header: t("Payment Method"),
            render: (method) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50/80 text-indigo-600 rounded-lg border border-indigo-100">
                        <CreditCard size={14} />
                    </div>
                    <span className="text-xs text-slate-700 font-semibold truncate max-w-[130px]">
                        {isArabic ? (method?.ar_name || method?.name) : method?.name}
                    </span>
                </div>
            )
        },
        {
            key: "status",
            header: t("Status"),
            render: (status, item) => {
                const styles = {
                    pending: "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10",
                    confirmed: "bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10",
                    processing: "bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10",
                    out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200/60 ring-purple-500/10",
                    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10",
                    returned: "bg-orange-50 text-orange-700 border-orange-200/60 ring-orange-500/10",
                    failed_to_deliver: "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10",
                    canceled: "bg-red-50 text-red-700 border-red-200/60 ring-red-500/10",
                    scheduled: "bg-teal-50 text-teal-700 border-teal-200/60 ring-teal-500/10",
                    refund: "bg-cyan-50 text-cyan-700 border-cyan-200/60 ring-cyan-500/10",
                    rejected: "bg-red-50 text-red-700 border-red-200/60 ring-red-500/10",
                };

                const currentStyle = styles[status] || "bg-slate-50 text-slate-600 border-slate-200";
                const selectOptions = statusOptions.filter((opt) => opt.id !== "all");

                return (
                    <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold capitalize tracking-wide border ring-1 ${currentStyle}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {t(status)}
                        </span>
                        <select
                            value={status || "pending"}
                            onChange={(e) => handleStatusSelect(item, e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 px-3 py-2 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        >
                            {selectOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }
        },
        {
            key: "cartItems",
            header: t("Details"),
            render: (items) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedItems(items); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-sm active:scale-95 group"
                >
                    <Eye size={13} className="group-hover:scale-110 transition-transform text-indigo-300" />
                    {t("View Items")}
                </button>
            )
        },
        {
            key: "createdAt",
            header: t("Date"),
            render: (date) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{date ? new Date(date).toLocaleDateString() : '---'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
            )
        },
    ], [t, isArabic]);

    return (
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & KPI Summary */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t("Online Orders")}</h1>
                        <p className="text-slate-500 text-xs md:text-sm mt-1">{t("Track, filter, and manage your web store orders effectively")}</p>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ShoppingBag size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Total")}</p>
                                <p className="text-base font-black text-slate-900">{getStatusCount("all")}</p>
                            </div>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Pending")}</p>
                                <p className="text-base font-black text-slate-900">{getStatusCount("pending")}</p>
                            </div>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <CheckCircle2 size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Delivered")}</p>
                                <p className="text-base font-black text-slate-900">{getStatusCount("delivered")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Dropdown Filter Section (نفس الشكل الموجود في الصورة بالضبط) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={16} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{t("Filter Status:")}</span>

                        {/* Styled Dropdown matching image */}
                        <div className="relative w-full md:w-64">
                            <select
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label} ({getStatusCount(opt.id)})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Quick Filter Buttons for Fast Access */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                        {statusOptions.slice(0, 5).map((opt) => {
                            const Icon = opt.icon;
                            const isActive = activeTab === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveTab(opt.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${isActive
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon size={13} className={isActive ? "text-indigo-400" : opt.color} />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table Data Container */}
                {loading || updating ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200/60 shadow-sm flex items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-3">
                        <DataTable
                            data={displayData}
                            columns={columns}
                            title={`${t(statusOptions.find(o => o.id === activeTab)?.label || 'Orders')}`}
                            showActions={false}
                            moduleName={AppModules.PAYMENT}
                        />
                    </div>
                )}
            </div>

            {/* Modal */}
            <FinancialsModal
                items={selectedItems}
                onCancel={() => setSelectedItems(null)}
            />

            <Dialog open={statusDialogOpen} onOpenChange={(open) => !open && setStatusDialogOpen(open)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t("Reject Order")}</DialogTitle>
                        <DialogDescription>
                            {t("Please provide a reason for rejecting this order before sending it to the backend.")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{t("Rejection Reason")}</label>
                            <textarea
                                value={statusDialogReason}
                                onChange={(e) => setStatusDialogReason(e.target.value)}
                                className="w-full min-h-[120px] rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                placeholder={t("Enter rejection reason")}
                            />
                        </div>
                        {statusDialogOrder && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                <p className="font-semibold">{t("Order ID")}: <span className="font-medium">#{statusDialogOrder._id?.slice(-6).toUpperCase()}</span></p>
                                <p>{t("Current Status")}: <span className="font-medium">{t(statusDialogOrder.status)}</span></p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <DialogClose asChild>
                            <button
                                type="button"
                                onClick={() => setStatusDialogOpen(false)}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                {t("Cancel")}
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            onClick={handleRejectSubmit}
                            disabled={statusDialogReason.trim().length === 0 || updating}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                        >
                            {t("Reject Order")}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentEco;