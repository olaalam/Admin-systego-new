import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Settings, Truck, MapPin, DollarSign, Package, Check } from "lucide-react";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const ShippingEdit = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const { data: fetchResponse, loading: fetching, error: fetchError } = useGet("/api/admin/shipping/settings");
    const { putData, loading: saving } = usePut("/api/admin/shipping/settings");

    const [formData, setFormData] = useState({
        shippingMethod: "zone",
        flatRate: 0,
        carrierRate: 0,
        freeShippingEnabled: false,
    });

    useEffect(() => {
        if (fetchResponse?.settings) {
            const settings = fetchResponse.settings;
            setFormData({
                shippingMethod: settings.shippingMethod || "zone",
                flatRate: settings.flatRate || 0,
                carrierRate: settings.carrierRate || 0,
                freeShippingEnabled: settings.freeShippingEnabled || false,
            });
        }
    }, [fetchResponse]);

    const handleMethodChange = (method) => {
        setFormData(prev => ({ ...prev, shippingMethod: method }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSave = async () => {
        try {
            // Build payload exactly as required by the backend to avoid 400 errors
            const payload = {
                shippingMethod: formData.shippingMethod,
                freeShippingEnabled: formData.freeShippingEnabled,
            };

            // Only add the relevant rate
            if (formData.shippingMethod === "flat_rate") {
                payload.flatRate = formData.flatRate;
            } else if (formData.shippingMethod === "carrier") {
                payload.carrierRate = formData.carrierRate;
            }

            await putData(payload);
            toast.success(t("Shipping_settings_saved_successfully") || "Shipping settings saved successfully");
            navigate("/shipping");
        } catch (error) {
            toast.error(error?.response?.data?.message || t("Failed_to_save_shipping_settings") || "Failed to save shipping settings");
        }
    };

    if (fetching) return <Loader />;

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("Edit_Shipping_Settings") || "Edit Shipping Settings"}</h1>
                        <p className="text-gray-500 mt-1">{t("Update_shipping_methods_and_rates") || "Update shipping methods and rates"}</p>
                    </div>
                </div>
            </div>

            {fetchError && !fetchError.includes("404") && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {t("Error_loading_data") || "Error loading data"}: {fetchError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Method Selection Section */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Settings size={20} className="text-red-500" />
                            {t("Select_Shipping_Method") || "Select Shipping Method"}
                        </h2>

                        <div className="space-y-4">
                            {/* Area Shipping Option */}
                            <label className={`
                                cursor-pointer flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200
                                ${formData.shippingMethod === "zone" ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'}
                            `}>
                                <div className="mt-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === "zone" ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                                        {formData.shippingMethod === "zone" && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="zone"
                                        className="hidden"
                                        checked={formData.shippingMethod === "zone"}
                                        onChange={() => handleMethodChange("zone")}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium text-gray-900 text-lg">
                                        <MapPin size={18} className="text-gray-500" />
                                        {t("Area_Shipping") || "Area Shipping (Zones)"}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {t("Area_shipping_description") || "Calculate shipping rates based on geographical zones or areas."}
                                    </p>
                                </div>
                            </label>

                            {/* Flat Rate Option */}
                            <label className={`
                                cursor-pointer flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200
                                ${formData.shippingMethod === "flat_rate" ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'}
                            `}>
                                <div className="mt-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === "flat_rate" ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                                        {formData.shippingMethod === "flat_rate" && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="flat_rate"
                                        className="hidden"
                                        checked={formData.shippingMethod === "flat_rate"}
                                        onChange={() => handleMethodChange("flat_rate")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium text-gray-900 text-lg">
                                        <DollarSign size={18} className="text-gray-500" />
                                        {t("Flat_Rate_Shipping") || "Flat Rate Shipping"}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1 mb-3">
                                        {t("Flat_rate_description") || "Charge a fixed shipping amount regardless of destination."}
                                    </p>

                                    {/* Flat Rate Input showing only when selected */}
                                    {formData.shippingMethod === "flat_rate" && (
                                        <div className="mt-3 p-4 bg-white rounded-lg border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.preventDefault() /* Prevent label click from radio trigger when typing */}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t("Flat_Rate_Amount") || "Flat Rate Amount"}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm"> EGP </span>
                                                </div>
                                                <input
                                                    type="number"
                                                    name="flatRate"
                                                    min="0"
                                                    value={formData.flatRate}
                                                    onChange={handleNumberChange}
                                                    className={`w-full flex-1 ${isRTL ? "pr-12" : "pl-12"} px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </label>

                            {/* Carrier Option */}
                            <label className={`
                                cursor-pointer flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200
                                ${formData.shippingMethod === "carrier" ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'}
                            `}>
                                <div className="mt-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.shippingMethod === "carrier" ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                                        {formData.shippingMethod === "carrier" && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="shippingMethod"
                                        value="carrier"
                                        className="hidden"
                                        checked={formData.shippingMethod === "carrier"}
                                        onChange={() => handleMethodChange("carrier")}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium text-gray-900 text-lg">
                                        <Package size={18} className="text-gray-500" />
                                        {t("Carrier_Shipping") || "Carrier Shipping"}
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1 mb-3">
                                        {t("Carrier_shipping_description") || "Shipping rates provided by external shipping carriers."}
                                    </p>

                                    {/* Carrier Rate Input showing only when selected */}
                                    {formData.shippingMethod === "carrier" && (
                                        <div className="mt-3 p-4 bg-white rounded-lg border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.preventDefault()}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t("Carrier_Fixed_Rate") || "Carrier Fixed Rate (Optional)"}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm"> EGP </span>
                                                </div>
                                                <input
                                                    type="number"
                                                    name="carrierRate"
                                                    min="0"
                                                    value={formData.carrierRate}
                                                    onChange={handleNumberChange}
                                                    className={`w-full ${isRTL ? "pr-12" : "pl-12"} px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings Section */}
                <div className="space-y-6">
                    {/* Free Shipping Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("Free_Shipping") || "Free Shipping"}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t("Enable_free_shipping_description") || "Enable free shipping globally on selected products (configurable in marketing module)."}
                        </p>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <span className="font-medium text-gray-900 block">{t("Enable_Free_Shipping") || "Enable"}</span>
                                <span className="text-xs text-gray-500">{formData.freeShippingEnabled ? t("Active") || "Active" : t("Inactive") || "Inactive"}</span>
                            </div>
                            <Switch
                                dir={isRTL ? "rtl" : "ltr"}
                                checked={formData.freeShippingEnabled}
                                onCheckedChange={(val) => setFormData(prev => ({ ...prev, freeShippingEnabled: val }))}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t("Saving") || "Saving..."}
                                </>
                            ) : (
                                t("Save_Changes") || "Save Changes"
                            )}
                        </button>
                        <button
                            onClick={() => navigate("/shipping")}
                            disabled={saving}
                            className="w-full py-3 px-4 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors shadow-sm"
                        >
                            {t("Cancel") || "Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingEdit;
