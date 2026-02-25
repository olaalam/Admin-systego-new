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
  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) return imageStr;
  if (imageStr.startsWith("data:")) return imageStr;
  return imageStr;
};

const ProductsViewDialog = ({ products, onCancel, title = "Products" }) => {
  const { t } = useTranslation();

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
            <button onClick={onCancel} className="text-white/80 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {hasProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productsList.map((item, idx) => {
                // استخراج البيانات من productId لأن الباك إند يرسلها متداخلة
                const productDetails = item.productId || {};
                const productId = item._id || idx;

                // السعر غالباً يكون في productPriceId أو السعر المرسل مباشرة
                const displayPrice = item.productPriceId?.price || item.price || 0;

                return (
                  <div key={productId} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-all">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(productDetails.image)} // التعديل هنا لقرائة image من details
                          alt={productDetails.name}
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                        />
                        {item.quantity < 10 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {t("Low")}
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {productDetails.name || t("Unnamed Product")}
                        </h4>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-base font-bold text-teal-600">
                            {displayPrice} {t("EGP")}
                          </span>
                        </div>

                        {/* Stock Quantity */}
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{t("Quantity in Bundle")}:</span>{" "}
                          <span className={`font-semibold ${renderStockColor(item.quantity)}`}>
                            {item.quantity}
                          </span>
                        </p>

                        {/* Code (if exists) */}
                        {item.productPriceId?.code && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            Code: {item.productPriceId.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{t("Noproductsavailable")}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button onClick={onCancel} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-medium">
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsViewDialog;