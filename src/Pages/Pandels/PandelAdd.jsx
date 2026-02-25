import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Trash2, Plus, Minus } from "lucide-react";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import SmartSearch from "@/components/SmartSearch";
import { useTranslation } from "react-i18next";

const PandelAdd = () => {
  const navigate = useNavigate();
  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const products = productsData?.products || [];

  const fields = [
    {
      key: "name",
      label: t("BundleName"),
      type: "text",
      required: true,
      placeholder: t("BundleNamePlaceholder"),
    },
    {
      key: "startdate",
      label: t("StartDate"),
      type: "date",
      required: true,
    },
    {
      key: "enddate",
      label: t("EndDate"),
      type: "date",
      required: true,
    },
    {
      key: "price",
      label: t("Price"),
      type: "number",
      required: true,
      placeholder: t("PricePlaceholder"),
      min: 0,
      step: "0.01",
    },
    {
      key: "products",
      label: t("ProductsBundle"),
      type: "custom",
      required: true,
      render: (formData, setFormData) => {
        // products في الـ formData هيكون array من objects:
        // { productId, productPriceId, quantity }
        const selectedProducts = formData.products || [];

        // جلب كامل بيانات المنتج من الـ products list بناءً على productId
        const getProductData = (productId) =>
          products.find((p) => (p._id || p.id) === productId);

        // البحث
        const searchTerm = (formData.searchProduct || "").toLowerCase().trim();
        const suggestions =
          searchTerm.length > 0
            ? products
              .filter(
                (p) =>
                  (p.name && p.name.toLowerCase().includes(searchTerm)) ||
                  (p.code && p.code.toString().toLowerCase().includes(searchTerm))
              )
              .slice(0, 8)
            : [];

        // إضافة منتج جديد للقائمة
        const handleAddProduct = (p) => {
          const prodId = p._id || p.id;
          const alreadyAdded = selectedProducts.some(
            (sp) => sp.productId === prodId
          );
          if (alreadyAdded) {
            toast.warning(t("Thisproductisalreadyinthebundle"));
            return;
          }
          setFormData((prev) => ({
            ...prev,
            products: [
              ...selectedProducts,
              { productId: prodId, productPriceId: null, quantity: 1 },
            ],
            searchProduct: "",
          }));
          toast.success(`${p.name} added!`);
        };

        // حذف منتج
        const handleRemoveProduct = (productId) => {
          setFormData((prev) => ({
            ...prev,
            products: selectedProducts.filter((sp) => sp.productId !== productId),
          }));
        };

        // تغيير الـ variation (productPriceId)
        const handleVariationChange = (productId, priceId) => {
          setFormData((prev) => ({
            ...prev,
            products: selectedProducts.map((sp) =>
              sp.productId === productId
                ? { ...sp, productPriceId: priceId || null }
                : sp
            ),
          }));
        };

        // تغيير الـ quantity
        const handleQuantityChange = (productId, delta) => {
          setFormData((prev) => ({
            ...prev,
            products: selectedProducts.map((sp) =>
              sp.productId === productId
                ? { ...sp, quantity: Math.max(1, sp.quantity + delta) }
                : sp
            ),
          }));
        };

        return (
          <div className="space-y-4">
            {/* حقل البحث */}
            <div className="relative z-20">
              <SmartSearch
                value={formData.searchProduct || ""}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, searchProduct: val }))
                }
              />

              {/* Dropdown الاقتراحات */}
              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-50 overflow-hidden">
                  {suggestions.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-b-0"
                      onClick={() => handleAddProduct(p)}
                    >
                      <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0 bg-gray-50">
                        <img
                          src={p.image || "/placeholder-product.png"}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/40")
                          }
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t("Code")}: {p.prices?.[0]?.code || "N/A"}
                          {p.prices && p.prices.length > 1 && (
                            <span className="ml-2 text-purple-500 font-medium">
                              {p.prices.length} {t("Variations")}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* قائمة المنتجات المختارة */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 border rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {t("BundleItems")} ({selectedProducts.length})
                  </span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {selectedProducts.map((sp) => {
                    const productData = getProductData(sp.productId);
                    if (!productData) return null;

                    // الـ variations (prices) بتاعة المنتج
                    const variations = productData.prices || [];
                    const hasVariations = variations.length > 1;

                    return (
                      <div
                        key={sp.productId}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* صورة المنتج */}
                          <div className="w-12 h-12 rounded-md border overflow-hidden bg-white flex-shrink-0 mt-1">
                            <img
                              src={
                                productData.image ||
                                "https://via.placeholder.com/50"
                              }
                              alt={productData.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* تفاصيل المنتج */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 truncate">
                              {productData.name}
                            </h4>

                            {/* Variation Dropdown - تظهر فقط لو المنتج عنده variations */}
                            {hasVariations && (
                              <div className="mt-2">
                                <label className="text-xs text-gray-500 font-medium mb-1 block">
                                  {t("SelectVariation")}
                                </label>
                                <select
                                  value={sp.productPriceId || ""}
                                  onChange={(e) =>
                                    handleVariationChange(
                                      sp.productId,
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                >
                                  <option value="">
                                    — {t("NoVariation")} —
                                  </option>
                                  {variations.map((v) => (
                                    <option key={v._id || v.id} value={v._id || v.id}>
                                      {v.size || v.color || v.name || v.code} — {v.price} {t("EGP")}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* لو مفيش variations - اظهر الكود */}
                            {!hasVariations && variations.length === 1 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {t("Code")}: {variations[0]?.code || "N/A"} — {variations[0]?.price} {t("EGP")}
                              </p>
                            )}

                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500 font-medium">
                                {t("Quantity")}:
                              </span>
                              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(sp.productId, -1)
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-600 hover:text-gray-900"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-bold text-gray-800 w-6 text-center">
                                  {sp.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(sp.productId, +1)
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-600 hover:text-gray-900"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* زرار الحذف */}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(sp.productId)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                            title="Remove product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "images",
      label: t("BundleImages"),
      type: "custom",
      required: false,
      render: (formData, setFormData) => (
        <ImageUploadSection
          images={formData.images || []}
          onImagesChange={(images) =>
            setFormData((prev) => ({ ...prev, images }))
          }
        />
      ),
    },
  ];

  const handleSubmit = async (formData) => {
    // Validation
    if (!formData.products || formData.products.length === 0) {
      toast.error(t("Please select at least one product for the Pandel"));
      return;
    }

    setLoading(true);
    try {
      // Clean Base64 images
      const imagesToSubmit = (formData.images || []).map((img) => {
        if (typeof img === "string" && img.includes("base64,")) {
          return img.split("base64,")[1];
        }
        return img;
      });

      // بناء الـ payload بالشكل الجديد
      const payload = {
        name: formData.name,
        startdate: formData.startdate,
        enddate: formData.enddate,
        status: true,
        price: Number(formData.price),
        images: imagesToSubmit,
        products: formData.products.map((sp) => ({
          productId: sp.productId,
          productPriceId: sp.productPriceId || null,
          quantity: sp.quantity || 1,
        })),
      };

      await api.post("/api/admin/pandel", payload);
      toast.success(t("Pandelcreatedsuccessfully"));
      navigate("/pandel");
    } catch (err) {
      console.error("❌ Error creating pandel:", err);
      const errorMessage =
        err.response?.data?.message || t("Failedtocreatepandel");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        title={t("CreateNewPandel")}
        description={t("CreatePandelDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pandel")}
        initialData={{
          name: "",
          startdate: "",
          enddate: "",
          price: "",
          products: [],         // Array of { productId, productPriceId, quantity }
          images: [],
          searchProduct: "",
        }}
        loading={loading}
      />
    </div>
  );
};

// --- Sub Component: Image Upload ---
const ImageUploadSection = ({ images, onImagesChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((newImages) => {
      onImagesChange([...images, ...newImages]);
    });
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-2 bg-purple-50 rounded-full mb-2">
            <svg
              className="w-6 h-6 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-purple-600">
              {t("ClickToUpload")}
            </span>{" "}
            {t("OrDragAndDrop")}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={img}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white text-red-500 shadow-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PandelAdd;