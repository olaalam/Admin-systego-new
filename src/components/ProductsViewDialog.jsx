import React from "react";
import { useTranslation } from "react-i18next";

// Helper function to render stock badge color
const renderStockColor = (quantity) => {
  if (quantity < 10) return "text-red-600";
  if (quantity < 50) return "text-orange-600";
  return "text-green-600";
};

// Helper function to fix image URLs
const getImageUrl = (imageStr) => {
  if (!imageStr) return "";

  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    return imageStr;
  }

  if (imageStr.startsWith("data:")) {
    return imageStr;
  }

  if (imageStr.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/jpeg;base64,${imageStr}`;
  }

  return imageStr;
};

const ProductsViewDialog = ({ products, onCancel, title = "Products" }) => {
    const { t, i18n } = useTranslation();

  if (!products) return null;

  const productsList = Array.isArray(products) ? products : [];
  const hasProducts = productsList.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-teal-100 text-sm mt-1">
                {hasProducts ? `${productsList.length} Products` : t("Noproducts")}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {hasProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productsList.map((product, idx) => {
                const productId = product._id || product.id || idx;
                
                return (
                  <div
                    key={productId}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
<img
  src={getImageUrl(
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : ""
  )}
  alt={product.name || "Product"}
  className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
/>

                        {product.quantity < 10 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {t("Low")}
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {product.name || t("Unnamed Product")}
                        </h4>

                        {/* Category & Brand */}
                        <div className="space-y-1 mb-2">
                          {product.categoryId?.[0]?.name && (
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">{t("Category")}:</span>{" "}
                              {product.categoryId[0].name}
                            </p>
                          )}
                          {product.brandId?.name && (
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">{t("Brand")}:</span>{" "}
                              {product.brandId.name}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-base font-bold text-teal-600">
                            {product.price} {t("EGP")}
                          </span>
                          {product.unit && (
                            <span className="text-xs text-gray-500">
                              / {product.unit}
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        {product.quantity !== undefined && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">{t("Stock")}:</span>{" "}
                            <span
                              className={`font-semibold ${renderStockColor(
                                product.quantity
                              )}`}
                            >
                              {product.quantity}
                            </span>
                          </p>
                        )}

                        {/* Wholesale Price */}
                        {product.whole_price > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">{t("Wholesale")}:</span>{" "}
                            {product.whole_price} {t("EGP")}
                          </p>
                        )}

                        {/* Features Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.different_price && (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-600/20">
                              {t("VariablePrice")}
                            </span>
                          )}
                          {product.product_has_imei && (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-600/20">
                              {t("IMEI")}
                            </span>
                          )}
                          {product.exp_ability && (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-600/20">
                              {t("HasExpiry")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {t("Noproductsavailable")}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {t("Addproducts")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsViewDialog;