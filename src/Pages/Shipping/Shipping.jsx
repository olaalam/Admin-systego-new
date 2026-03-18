import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Truck, MapPin, DollarSign, Package, Check, Edit2 } from "lucide-react";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const Shipping = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const { data: fetchResponse, loading: fetching, error: fetchError } = useGet("/api/admin/shipping/settings");

    if (fetching) return <Loader />;

    const settings = fetchResponse?.settings || {
        shippingMethod: "zone",
        flatRate: 0,
        carrierRate: 0,
        freeShippingEnabled: false,
    };

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("Shipping_Settings") || "Shipping Settings"}</h1>
                        <p className="text-gray-500 mt-1">{t("View_shipping_methods_and_rates") || "View your current shipping methods and rates"}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/shipping/edit/${settings._id || 'default'}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Edit2 size={16} />
                    {t("Edit_Settings") || "Edit Settings"}
                </button>
            </div>

            {fetchError && !fetchError.includes("404") && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {t("Error_loading_data") || "Error loading data"}: {fetchError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Display */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Method Display Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 opacity-50"></div>

                        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-red-500" />
                            {t("Active_Shipping_Method") || "Active Shipping Method"}
                        </h2>

                        {/* Display Active Method */}
                        <div className="p-5 rounded-xl border border-red-100 bg-red-50/50">
                            {settings.shippingMethod === "zone" && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm text-red-500">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t("Area_Shipping") || "Area Shipping (Zones)"}</h3>
                                        <p className="text-gray-600 text-sm">{t("Area_shipping_description") || "Calculate shipping rates based on geographical zones or areas."}</p>
                                    </div>
                                </div>
                            )}

                            {settings.shippingMethod === "flat_rate" && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm text-red-500">
                                        <DollarSign size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t("Flat_Rate_Shipping") || "Flat Rate Shipping"}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{t("Flat_rate_description") || "Charge a fixed shipping amount regardless of destination."}</p>

                                        <div className="inline-flex flex-col bg-white p-4 rounded-xl border border-red-100 shadow-sm min-w-48">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("Rate_Amount") || "Rate Amount"}</span>
                                            <span className="text-2xl font-bold text-gray-900">{settings.flatRate?.toFixed(2) || "0.00"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {settings.shippingMethod === "carrier" && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm text-red-500">
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t("Carrier_Shipping") || "Carrier Shipping"}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{t("Carrier_shipping_description") || "Shipping rates provided by external shipping carriers."}</p>

                                        <div className="inline-flex flex-col bg-white p-4 rounded-xl border border-red-100 shadow-sm min-w-48">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t("Carrier_Fixed_Rate") || "Carrier Fixed Rate"}</span>
                                            <span className="text-2xl font-bold text-gray-900">{settings.carrierRate?.toFixed(2) || "0.00"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Display */}
                <div className="space-y-6">
                    {/* Free Shipping Status */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("Free_Shipping") || "Free Shipping"}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t("Enable_free_shipping_description") || "Enable free shipping globally on selected products (configurable in marketing module)."}
                        </p>

                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${settings.freeShippingEnabled ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            <div className={`p-2 rounded-full ${settings.freeShippingEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                                {settings.freeShippingEnabled ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-50"></div>}
                            </div>
                            <div>
                                <span className="font-semibold block">{settings.freeShippingEnabled ? t("Active") || "Active" : t("Inactive") || "Inactive"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
