import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import Loader from "@/components/Loader";

const Geidea = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [refreshKey, setRefreshKey] = useState(0);

    // جلب البيانات
    const { data, loading } = useGet(`/api/admin/geidea?refresh=${refreshKey}`);

    // تعديل مسار قراءة الـ config ليتناسب مع الريسبونس الجديد
    const rawConfig = data?.data?.geidea || data?.geidea;
    const geideaData = rawConfig
        ? (Array.isArray(rawConfig) ? rawConfig : [rawConfig])
        : [];

    // دالة الحذف
    // const handleDelete = async (id) => {
    //     if (window.confirm(t("Are you sure you want to delete this configuration?"))) {
    //         try {
    //             await api.delete(`/api/admin/geidea/${id}`);
    //             toast.success(t("Deleted successfully"));
    //             setRefreshKey((prev) => prev + 1); // تحديث البيانات بعد الحذف
    //         } catch (error) {
    //             toast.error(error?.response?.data?.message || t("Error deleting item"));
    //         }
    //     }
    // };

    if (loading && geideaData.length === 0) return <Loader />;

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t("Geidea Settings")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t("Manage your payment gateway configurations")}</p>
                </div>
                <button
                    onClick={() => navigate("/geidea/add")}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    {t("Add Config")}
                </button>
            </div>

            {/* Cards Grid Section */}
            {geideaData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
                    <CreditCard size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">{t("No Configurations Found")}</h3>
                    <p className="text-gray-500 mt-2">{t("Click the Add Config button to create your first geidea setup.")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {geideaData.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
                        >
                            {/* Card Header (Icon, Name, Status Badges) */}
                            <div className="p-5 border-b border-gray-50 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {item.payment_method_id?.icon ? (
                                            <img
                                                src={item.payment_method_id.icon}
                                                alt={item.payment_method_id?.name || "Payment"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <CreditCard className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            {item.payment_method_id?.name || t("geidea")}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {/* تعديل قراءة الـ type ليكون من داخل payment_method_id */}
                                            {item.payment_method_id?.type?.toUpperCase() || "LIVE"}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-col gap-2 items-end">
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${item.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {item.isActive ? t("Active") : t("Inactive")}
                                    </span>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${item.sandboxMode
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-blue-100 text-blue-800"
                                            }`}
                                    >
                                        {item.sandboxMode ? t("Sandbox") : t("Live")}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body (Details) */}
                            <div className="p-5 flex-1 bg-gray-50/50">
                                <div className="space-y-3 text-sm">
                                    {/* تعديل الـ Integration ID إلى Merchant ID */}
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">{t("Merchant ID")}</span>
                                        <span className="font-semibold text-gray-800">{item.merchantId || "-"}</span>
                                    </div>
                                    {/* تعديل الـ Iframe ID إلى Public Key */}
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">{t("Public Key")}</span>
                                        <span className="font-semibold text-gray-800 truncate max-w-[120px]" title={item.publicKey}>{item.publicKey || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">{t("Webhook Secret")}</span>
                                        <span className="font-semibold text-gray-800 truncate max-w-[120px]" title={item.webhookSecret}>{item.webhookSecret || "-"}</span>
                                    </div>

                                </div>
                            </div>

                            {/* Card Footer (Actions) */}
                            <div className="p-4 bg-white flex items-center justify-between gap-3 border-t border-gray-50">
                                <button
                                    onClick={() => navigate(`/geidea/edit/${item._id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                                >
                                    <Edit size={16} />
                                    {t("Edit")}
                                </button>
                                {/* <button
                                    onClick={() => handleDelete(item._id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-100"
                                >
                                    <Trash2 size={16} />
                                    {t("Delete")}
                                </button> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Geidea;