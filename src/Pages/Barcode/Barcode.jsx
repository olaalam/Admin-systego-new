import React, { useState } from "react";
import { Trash2, FileText, Loader as LoaderIcon, X, Plus } from "lucide-react";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { toast } from "react-toastify";
import SmartSearch from "@/components/SmartSearch"; // تأكد من المسار الصحيح للملف
import { useTranslation } from "react-i18next";

const PrintBarcode = () => {
  // Data Fetching
  const { data: productsData, loading: productsLoading } =
    useGet("/api/admin/product");
  const { data: sizesData, loading: sizesLoading } = useGet(
    "/api/admin/label/sizes"
  );
  const { postData: generateLabels, loading: isSubmitting } = usePost(
    "/api/admin/label/generate"
  );

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPaperSize, setSelectedPaperSize] = useState("");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [labelConfig, setLabelConfig] = useState({
    showProductName: true,
    showPrice: true,
    showPromotionalPrice: true,
    showBusinessName: true,
    showBrand: true,
    productNameSize: 15,
    priceSize: 15,
    businessNameSize: 15,
    brandSize: 15,
  });

  const products = productsData?.products || [];
  const labelSizes = sizesData?.labelSizes || [];

  // --- 1. Filter Logic ---
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.code?.toLowerCase().includes(search) || // إضافة البحث في الكود الأساسي
      product.prices?.some((p) => p.code?.toLowerCase().includes(search))
    );
  });

  // --- 2. Selection Actions ---
  const addProduct = (product, priceVariation = null) => {
    // إذا لم يوجد variation، نستخدم معرف المنتج نفسه كمعرف للسعر
    const priceId = priceVariation ? priceVariation._id : product._id;

    const exists = selectedProducts.find(
      (p) => p.productPriceId === priceId
    );

    if (!exists) {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product._id,
          productPriceId: priceId,
          quantity: 1,
          productName: product.name,
          // نأخذ الكود والسعر من التنوع، وإذا لم يوجد نأخذه من المنتج الأساسي
          code: priceVariation ? priceVariation.code : (product.code || ""),
          price: priceVariation ? priceVariation.price : (product.price || 0),
        },
      ]);
    }
    setSearchTerm("");
  };

  const updateQuantity = (priceId, val) => {
    const quantity = Math.max(1, parseInt(val) || 1);
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productPriceId === priceId ? { ...p, quantity } : p
      )
    );
  };

  const removeProduct = (priceId) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productPriceId !== priceId)
    );
  };

  const handleBarcodeScanned = (scannedCode) => {
    if (!scannedCode) return;
    for (const product of products) {
      // 1. فحص الكود الأساسي للمنتج
      if (product.code === scannedCode) {
        addProduct(product);
        toast.success(`${t("Added")}: ${product.name}`);
        return;
      }
      // 2. فحص الأكواد داخل التنوعات
      const priceMatch = product.prices?.find((p) => p.code === scannedCode);
      if (priceMatch) {
        addProduct(product, priceMatch);
        toast.success(`${t("Added")}: ${product.name}`);
        return;
      }
    }
  };

  // --- 3. Print Logic ---
  const handleSubmit = async () => {
    if (selectedProducts.length === 0 || !selectedPaperSize) {
      toast.warn(`${t("Please select products")} ${t("and a paper size")}`);
      return;
    }

    const payload = {
      products: selectedProducts.map((p) => ({
        productId: p.productId,
        productPriceId: p.productPriceId,
        quantity: p.quantity,
      })),
      labelConfig: {
        ...labelConfig,
        productNameSize: parseInt(labelConfig.productNameSize),
        priceSize: parseInt(labelConfig.priceSize),
        businessNameSize: parseInt(labelConfig.businessNameSize),
        brandSize: parseInt(labelConfig.brandSize),
      },
      paperSize: selectedPaperSize, // هذا المتغير حيوي جداً لضبط مساحة الورقة
    };

    try {
      const responseData = await generateLabels(payload, null, {
        responseType: "blob",
      });
      const blob = new Blob([responseData], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 1200);
      };
    } catch (error) {
      console.error("Error generating labels:", error);
      toast.error(t("Failedtogenerateprintfile"));
    }
  };

  // --- Barcode Preview Component ---
  const BarcodePreview = ({ product, size, labelConfig, businessName }) => {
    const getPreviewStyle = () => {
      const dimensions = size?.labelSize?.match(
        /(\d+\.?\d*)mm\s*×\s*(\d+\.?\d*)mm/
      );
      if (!dimensions) return { width: "150px", height: "80px" };
      const width = parseFloat(dimensions[1]) * 3.5;
      const height = parseFloat(dimensions[2]) * 3.5;
      return {
        width: `${Math.min(width, 250)}px`,
        height: `${Math.min(height, 150)}px`,
      };
    };

    return (
      <div
        className="border border-gray-300 rounded bg-white shadow-sm p-2 flex flex-col items-center justify-center text-center overflow-hidden"
        style={getPreviewStyle()}
      >
        {labelConfig.showBusinessName && (
          <div
            className="font-bold uppercase tracking-tighter leading-none mb-1 text-gray-800"
            style={{ fontSize: `${labelConfig.businessNameSize}px` }}
          >
            {businessName}
          </div>
        )}
        {labelConfig.showProductName && (
          <div
            className="font-medium leading-none mb-1 line-clamp-1"
            style={{ fontSize: `${labelConfig.productNameSize}px` }}
          >
            {product.productName}
          </div>
        )}

        {/* تم تغيير الخلفية السوداء هنا لتبدو كباركود حقيقي بالـ CSS */}
        <div
          className="w-full h-10 mb-1 opacity-80"
          style={{
            background:
              "repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 3px)",
          }}
        ></div>

        <div className="text-[10px] mb-1 font-mono">{product.code}</div>
        {labelConfig.showPrice && (
          <div
            className="font-black"
            style={{ fontSize: `${labelConfig.priceSize}px` }}
          >
            {product.price} {t("EGP")}
          </div>
        )}
      </div>
    );
  };

  if (productsLoading || sizesLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {t("PrintBarcodeSystem")}
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          {/* Smart Search Integration */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("SearchorScanProduct")}
            </label>
            <div className="relative">
              <SmartSearch
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  handleBarcodeScanned(val);
                }}
              />

              {/* Search Results Dropdown */}
              {searchTerm && filteredProducts.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="p-3 hover:bg-purple-50 border-b last:border-0 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">
                          {product.name}
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">
                          {product.category?.name}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {/* الحالة الأولى: إذا كان المنتج يحتوي على تنوعات أسعار */}
                        {product.prices && product.prices.length > 0 ? (
                          product.prices.map((pv) => (
                            <button
                              key={pv._id}
                              onClick={() => addProduct(product, pv)}
                              className="text-xs bg-white border border-purple-200 hover:border-purple-500 px-2 py-1 rounded-md flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3 text-purple-600" />
                              <span className="font-mono">{pv.code}</span> -{" "}
                              <span className="text-purple-700 font-bold">
                                ${pv.price}
                              </span>
                            </button>
                          ))
                        ) : (
                          /* الحالة الثانية: إذا كان المنتج بسيطاً (بدون تنوعات) */
                          <button
                            onClick={() => addProduct(product, null)}
                            className="text-xs bg-white border border-blue-200 hover:border-blue-500 px-2 py-1 rounded-md flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3 text-blue-600" />
                            <span className="font-mono">{product.code || "No Code"}</span> -{" "}
                            <span className="text-blue-700 font-bold">
                              ${product.price || 0}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Products Table */}
          {selectedProducts.length > 0 && (
            <div className="mb-8 overflow-hidden border border-gray-200 rounded-xl shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">
                      {t("ProductDetails")}
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">
                      {t("Code")}
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">
                      {t("PrintQuantity")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">
                      {t("Remove")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedProducts.map((product) => (
                    <tr
                      key={product.productPriceId}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 font-mono text-purple-600">
                        {product.code}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              product.productPriceId,
                              e.target.value
                            )
                          }
                          className="w-20 border-2 border-gray-100 rounded-lg px-3 py-1.5 focus:border-purple-400 outline-none transition-all font-bold"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => removeProduct(product.productPriceId)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
            {["productName", "price", "businessName", "brand"].map((item) => (
              <div key={item} className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    checked={
                      labelConfig[
                      `show${item.charAt(0).toUpperCase() + item.slice(1)}`
                      ]
                    }
                    onChange={(e) =>
                      setLabelConfig({
                        ...labelConfig,
                        [`show${item.charAt(0).toUpperCase() + item.slice(1)}`]:
                          e.target.checked,
                      })
                    }
                  />
                  <span className="text-xs font-bold text-gray-700 capitalize group-hover:text-purple-600 transition-colors">
                    {t(item.replace(/([A-Z])/g, " $1"))}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={labelConfig[`${item}Size`]}
                    onChange={(e) =>
                      setLabelConfig({
                        ...labelConfig,
                        [`${item}Size`]: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-purple-400 shadow-sm"
                  />
                  <span className="text-[10px] text-gray-400">px</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paper Selection and Preview */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />{" "}
              {t("PaperFormatSelection")}
            </h3>
            <select
              value={selectedPaperSize}
              onChange={(e) => setSelectedPaperSize(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white hover:border-purple-300 transition-all outline-none font-medium mb-6 shadow-sm"
            >
              <option value="">Select Paper Size (e.g. 50mm x 30mm)</option>
              {labelSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name} — ({size.labelSize})
                </option>
              ))}
            </select>

            {selectedPaperSize && selectedProducts.length > 0 && (
              <div className="p-8 bg-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">
                  {t("LivePreview")}
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  {selectedProducts.slice(0, 3).map((prod, i) => (
                    <BarcodePreview
                      key={i}
                      product={prod}
                      size={labelSizes.find((s) => s.id === selectedPaperSize)}
                      labelConfig={labelConfig}
                      businessName="WegoStation"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              selectedProducts.length === 0 ||
              !selectedPaperSize
            }
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:shadow-purple-200 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <FileText className="w-6 h-6" />
            )}
            {isSubmitting
              ? t("generating_print_file")
              : t("generate_and_print_labels")

            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintBarcode;
