import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";
import DataTable from "@/components/DataTable";
import {
    User, CreditCard, History, RotateCcw, ArrowLeft,
    TrendingUp, Wallet, Clock, ShoppingBag
} from "lucide-react";

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // استدعاء البيانات من الـ API
    const { data, loading, error } = useGet(`/api/admin/customer/single-page/${id}`);
    const [activeTab, setActiveTab] = useState("info");

    if (loading) return <Loader />;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    const customerData = data?.customer || {};
    console.log(data);
    console.log(customerData);
    console.log(data.financial_summary);

    const tabs = [
        { id: "info", label: t("Information"), icon: User },
        { id: "payments", label: t("PaymentHistory"), icon: History },
        { id: "returns", label: t("Returns"), icon: RotateCcw },
    ];

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
            {/* 1. Top Header  */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {customerData.customer_name || "-"}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {customerData.customer_group_id?.name || "General"}
                            </span>
                            <span>•</span>
                            <span>{customerData.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Fixed Financial Summary Cards (الجزء الثابت) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title={t("TotalRevenue")}
                    value={customerData.financial_summary?.total_revenue || 0}
                    icon={<TrendingUp className="text-emerald-600" />}
                    color="emerald"
                />
                <StatCard
                    title={t("TotalPaid")}
                    value={customerData.financial_summary?.total_paid || 0}
                    icon={<Wallet className="text-blue-600" />}
                    color="blue"
                />
                <StatCard
                    title={t("OutstandingBalance")}
                    value={customerData?.financial_summary?.outstanding_balance || 0}
                    icon={<Clock className="text-red-600" />}
                    color="red"
                    isDebt
                />
                <StatCard
                    title={t("TotalOrders")}
                    value={customerData.cards?.total_orders || 0}
                    icon={<ShoppingBag className="text-amber-600" />}
                    color="amber"
                    noCurrency
                />
            </div>

            {/* 3. Main Content Area with Tabs */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs Navigation */}
                <div className="flex w-full bg-slate-50/50 border-b border-slate-100 p-2 gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? "bg-white text-red-600 shadow-sm border border-slate-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tabs Content */}
                <div className="p-8">
                    {activeTab === "info" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                                        {t("BasicInformation")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label={t("FullName")} value={customerData.customer_name} />
                                        <InfoField label={t("PhoneNumber")} value={customerData.phone_number} />
                                        <InfoField label={t("EmailAddress")} value={customerData.email} />
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                                        {t("LocationDetails")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoField label={t("Address")} value={customerData.address} fullWidth />
                                        <InfoField label={t("City")} value={customerData.city} />
                                        <InfoField label={t("Country")} value={customerData.country} />
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Info
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <h3 className="text-slate-800 font-bold mb-4">{t("PointsRewards")}</h3>
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <span className="text-sm text-slate-500 font-medium">{t("AvailablePoints")}</span>
                                    <span className="text-2xl font-black text-amber-500">{customerData.total_points_earned || 0}</span>
                                </div>
                            </div> */}
                        </div>
                    )}

                    {activeTab === "payments" && (
                        <DataTable
                            data={customerData.payment_history || []}
                            columns={[
                                { key: "payment_id", header: "ID" },
                                { key: "amount", header: "Amount", render: (v) => `${v} EGP` },
                                { key: "method", header: "Method" },
                                { key: "date", header: "Date" }
                            ]}
                            showActions={false}
                        />
                    )}

                    {activeTab === "returns" && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <RotateCcw size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">{t("NoReturnsFound")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- المكونات الفرعية للتنظيم ---

const StatCard = ({ title, value, icon, color, noCurrency, isDebt }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-xl font-black ${isDebt ? 'text-red-600' : 'text-slate-800'}`}>
                {value.toLocaleString()} {!noCurrency && "EGP"}
            </p>
        </div>
    </div>
);

const InfoField = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? "md:col-span-2" : ""}>
        <label className="text-slate-400 text-[10px] font-bold uppercase block mb-1.5">{label}</label>
        <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 text-slate-700 font-bold">
            {value || "-"}
        </div>
    </div>
);

export default CustomerDetails;