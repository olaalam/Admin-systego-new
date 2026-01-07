import React from "react";

// Helper function to render stock badge color
const renderStockColor = (quantity) => {
  if (quantity < 10) return "text-red-600";
  if (quantity < 50) return "text-orange-600";
  return "text-green-600";
};

const VariablePricesDialog = ({ product, onCancel }) => {
  if (!product) return null;

  const prices = product.prices || [];
  const hasPrices = prices.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                Variable Prices
              </h3>
              {product.variations?.name && (
                <p className="text-teal-100 text-sm mt-1">
                  {product.variations.name}
                </p>
              )}
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
          {hasPrices ? (
            <div className="space-y-3">
              {prices.map((priceItem, idx) => {
                const variation = priceItem.variations?.[0];
                const variationName = variation?.name || "Variation";
                const options =
                  variation?.options?.map((opt) => opt.name).join(" / ") || "";

                return (
                  <div
                    key={priceItem._id || idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {variationName}
                        </p>

                        {options && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Options:</span>{" "}
                            {options}
                          </p>
                        )}

                        {priceItem.code && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Code:</span>{" "}
                            {priceItem.code}
                          </p>
                        )}

                        {priceItem.quantity !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Stock:</span>{" "}
                            <span
                              className={`font-semibold ${renderStockColor(
                                priceItem.quantity
                              )}`}
                            >
                              {priceItem.quantity}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-600">
                          {priceItem.price} EGP
                        </p>
                      </div>
                    </div>

                    {/* Gallery */}
                    {priceItem.gallery && priceItem.gallery.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {priceItem.gallery.map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt={`${variationName} - ${imgIdx + 1}`}
                            className="h-14 w-14 object-cover rounded-md border border-gray-200 hover:border-teal-400 transition-colors"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm font-medium">
                No variable prices configured yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Add price variations in the product edit page
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariablePricesDialog;
