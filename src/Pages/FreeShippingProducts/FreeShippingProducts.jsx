import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, Edit2, Search } from "lucide-react";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const FreeShippingProducts = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    // Fetch the currently selected free shipping products
    const { data: fetchResponse, loading: fetching, error: fetchError } = useGet("/api/admin/shipping/free-products");

    if (fetching) return <Loader />;

    const products = fetchResponse?.products || [];

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t("Free_Shipping_Products") || "Free Shipping Products"}</h1>
                        <p className="text-gray-500 mt-1">{t("Manage_products_with_free_shipping") || "View your current products allowed for free shipping"}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/free-shipping-products/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Edit2 size={16} />
                    {t("Edit_Products") || "Edit Products"}
                </button>
            </div>

            {fetchError && !fetchError.includes("404") && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {t("Error_loading_data") || "Error loading data"}: {fetchError}
                </div>
            )}

            {/* Products List Display */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Package size={20} className="text-red-500" />
                        {t("Selected_Products") || "Selected Products"}
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-2">
                            {products.length}
                        </span>
                    </h2>
                </div>

                <div className="p-6">
                    {products.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                            <div className="w-16 h-16 bg-white shrink-0 rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-gray-400">
                                <Search size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("No_products_selected") || "No products selected"}</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                                {t("No_free_shipping_products_desc") || "You haven't added any products to the free shipping list yet."}
                            </p>
                            <button
                                onClick={() => navigate(`/free-shipping-products/edit`)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                <Edit2 size={16} />
                                {t("Add_Products") || "Add Products"}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {products.map((product) => (
                                <div key={product._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all bg-white group hover:-translate-y-1">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm shrink-0 bg-gray-50"
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className={`w-16 h-16 rounded-xl border border-gray-100 shadow-sm shrink-0 bg-gray-50 items-center justify-center text-gray-400 group-hover:text-red-400 group-hover:bg-red-50 transition-colors ${product.image ? 'hidden' : 'flex'}`}
                                    >
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full">
                                        <h3 
                                            className="text-sm font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2"
                                            title={isArabic && product.ar_name ? product.ar_name : product.name}
                                        >
                                            {isArabic && product.ar_name ? product.ar_name : product.name}
                                        </h3>
                                        {(product.code || product.price) && (
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                {product.code && (
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                        #{product.code}
                                                    </span>
                                                )}
                                                {product.price > 0 && (
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                        {product.price} {t("EGP")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreeShippingProducts;
