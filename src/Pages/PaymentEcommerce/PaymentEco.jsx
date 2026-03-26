import { useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import {
    CheckCircle2, X, Clock, Eye, Wallet, CreditCard, Info, Package
} from "lucide-react";

// Modal Component updated to show Cart Items (Products)
const FinancialsModal = ({ items, onCancel }) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    if (!items) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                <Package className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{t("Order Items")}</h3>
                                <p className="text-gray-400 text-sm mt-0.5">{t("Details of purchased products")}</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                        >
                            <X className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div
                                    key={item._id || idx}
                                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white">
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.product?.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {t("Quantity")}: <span className="text-gray-900">{item.quantity}</span> × {item.price} {t("EGP")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t("Total")}</p>
                                        <p className="text-base font-black text-gray-900">{item.price * item.quantity} <span className="text-[10px] font-normal text-gray-500">{t("EGP")}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                <Info className="text-gray-300" size={32} />
                            </div>
                            <h4 className="text-gray-900 font-bold mb-1">{t("No items found")}</h4>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold text-sm shadow-lg active:scale-95"
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

    // API returns { success: true, data: { orders: [...] } }
    const { data: responseData, loading, error, refetch } = useGet("/api/admin/online-orders");
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedItems, setSelectedItems] = useState(null);

    const tabs = [
        { id: "pending", label: t("Pending"), icon: <Clock size={16} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        { id: "approved", label: t("Approved"), icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { id: "failed", label: t("Failed"), icon: <X size={16} />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    ];

    // Filter orders based on the active tab status
    const displayData = useMemo(() => {
        if (!responseData?.orders) return [];

        return responseData.orders.filter(order => {
            if (activeTab === "completed") {
                return order.status === "completed" || order.status === "approved";
            }
            return order.status === activeTab;
        });
    }, [responseData, activeTab]);
    // Helper to get count for each status
    const getStatusCount = (status) => {
        return responseData?.orders?.filter(order => order.status === status).length || 0;
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdating(true);
            const res = await api.put(`/api/admin/online-orders/${id}`, { status: newStatus });
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

    const columns = useMemo(() => [
        {
            key: "_id", // Changed from sale_id to match API
            header: t("Order ID"),
            render: (val) => <span className="font-mono text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">#{val.slice(-6).toUpperCase()}</span>
        },
        {
            key: "totalOrderPrice", // Changed from amount to match API
            header: t("Amount"),
            render: (val) => <span className="font-bold text-gray-900">{val} <span className="text-[10px] text-gray-400 uppercase">{t("EGP")}</span></span>
        },
        {
            key: "paymentMethod", // Handles the nested object in API
            header: t("Payment Method"),
            render: (method) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                        <CreditCard size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium truncate max-w-[120px]">
                        {isArabic ? (method?.ar_name || method?.name) : method?.name}
                    </span>
                </div>
            )
        },
        {
            key: "status",
            header: t("Status"),
            render: (status, item) => {
                // ماب للألوان الأساسية، وأي حاجة تانية هتاخد لون رمادي افتراضي
                const statusStyles = {
                    pending: "bg-amber-50 text-amber-600 border-amber-100",
                    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    failed: "bg-rose-50 text-rose-600 border-rose-100",
                };

                const currentStyle = statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-100";
                const dotColor = currentStyle.split(' ')[1].replace('text', 'bg');

                return (
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${currentStyle}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            {/* t(status) عشان لو حبيت تترجم الكلمة اللي جاية من الباك في ملفات الـ JSON */}
                            {t(status)}
                        </span>

                        {/* التحكم بيظهر فقط لو الحالة محتاجة أكشن (مثلاً pending) */}
                        {status === 'pending' && (
                            <div className="flex items-center gap-1 shadow-sm border border-gray-100 rounded-lg p-0.5 bg-white">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(item._id, "approved"); }}
                                    className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors"
                                >
                                    <CheckCircle2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: "cartItems", // Changed from financials to cartItems
            header: t("Details"),
            render: (items) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedItems(items); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[11px] font-bold hover:bg-black transition-all shadow-md active:scale-95 group"
                >
                    <Eye size={12} className="group-hover:scale-110 transition-transform" />
                    {t("View Items")}
                </button>
            )
        },
        {
            key: "createdAt",
            header: t("Date"),
            render: (date) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{date ? new Date(date).toLocaleDateString() : '---'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
            )
        },
    ], [t, i18n.language, responseData]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="w-full">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("Online Orders")}</h1>
                        <p className="text-gray-500 mt-1">{t("Manage your web store transactions and status")}</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white p-1.5 rounded-2xl shadow-xl shadow-gray-200/50 flex gap-1 border border-gray-100">
                        {tabs.map((tab) => {
                            const count = getStatusCount(tab.id);
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-400/20 translate-y-[-2px]"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className={activeTab === tab.id ? "text-white" : tab.color}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading || updating ? (
                    <Loader />
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <DataTable
                            data={displayData}
                            columns={columns}
                            title={`${t(activeTab.charAt(0).toUpperCase() + activeTab.slice(1))} ${t("Orders")}`}
                            showActions={false}
                            moduleName={AppModules.PAYMENT}
                        />
                    </div>
                )}
            </div>

            {/* Items Details Modal */}
            <FinancialsModal
                items={selectedItems}
                onCancel={() => setSelectedItems(null)}
            />
        </div>
    );
};

export default PaymentEco;