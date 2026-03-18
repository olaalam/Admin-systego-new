import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Truck, Package, ShieldCheck } from "lucide-react";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import ProductSelector from "@/components/ProductSelector";
import { useTranslation } from "react-i18next";

const FreeShippingProductsEdit = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Fetch existing free shipping products
    const { data: fetchResponse, loading: fetching, error: fetchError } = useGet("/api/admin/shipping/free-products");
    
    // Fetch all products for selector
    const { data: allProductsResponse, loading: fetchingProducts } = useGet("/api/admin/product");
    
    // Put mutation
    const { putData, loading: saving } = usePut("/api/admin/shipping/free-products");

    // Local state for selected product IDs
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    const allProducts = allProductsResponse?.products || [];

    useEffect(() => {
        if (fetchResponse?.products) {
            // ProductSelector expects array of IDs when showQuantity=false
            const initialIds = fetchResponse.products.map(p => p._id);
            setSelectedProductIds(initialIds);
        }
    }, [fetchResponse]);

    const handleSave = async () => {
        try {
            await putData({
                productIds: selectedProductIds
            });
            toast.success(t("Free_shipping_products_saved") || "Free shipping products updated successfully");
            navigate("/free-shipping-products");
        } catch (error) {
            toast.error(error?.response?.data?.message || t("Failed_to_save_products") || "Failed to save products");
        }
    };

    if (fetching || fetchingProducts) return <Loader />;

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("Edit_Free_Shipping_Products") || "Edit Free Shipping Products"}</h1>
                        <p className="text-gray-500 mt-1">{t("Select_products_free_shipping_allow") || "Select the products that are allowed for free shipping"}</p>
                    </div>
                </div>
            </div>

            {fetchError && !fetchError.includes("404") && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {t("Error_loading_data") || "Error loading data"}: {fetchError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <Package size={20} className="text-red-500" />
                            {t("Select_Products") || "Select Products"}
                        </h2>
                        
                        <div className="min-h-[400px]">
                            <ProductSelector 
                                products={allProducts}
                                selectedProducts={selectedProductIds}
                                onProductsChange={setSelectedProductIds}
                                showQuantity={false}
                                label={t("Search_and_select_products") || "Search and Select Products"}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Setup */}
                <div className="space-y-6">
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm">
                        <ShieldCheck size={32} className="text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("Important_Note") || "Important Note"}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {t("Free_shipping_products_note") || "Items selected here will be eligible for free shipping if the global free shipping setting is enabled, or based on specific promotional campaigns."}
                        </p>
                    </div>

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
                            onClick={() => navigate("/free-shipping-products")}
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

export default FreeShippingProductsEdit;
