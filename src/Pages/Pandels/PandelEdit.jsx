// src/pages/PandelEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { X, Trash2, Plus, Minus } from "lucide-react";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import SmartSearch from "@/components/SmartSearch";
import { useTranslation } from "react-i18next";

const PandelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { putData, loading: updating } = usePut(`/api/admin/pandel/${id}`);
  const { t } = useTranslation();

  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const { data: pandelData, loading: pandelLoading } = useGet(`/api/admin/pandel/${id}`);
  const [loading, setLoading] = useState(false);

  if (productsLoading || pandelLoading) return <Loader />;

  const products = productsData?.products || [];
  const pandel = pandelData?.pandel || {};

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toISOString().split("T")[0];
  };

  // تحويل بيانات الـ pandel القادمة من الـ API إلى الشكل المطلوب
  // لو الـ API بيرجع productsId (القديم) أو products (الجديد) — نتعامل مع الاتنين
  const normalizeExistingProducts = () => {
    // لو الـ API بيرجع products بالشكل الجديد
    if (pandel.products && Array.isArray(pandel.products)) {
      return pandel.products.map((sp) => ({
        productId: sp.productId?._id || sp.productId || sp._id,
        productPriceId: sp.productPriceId?._id || sp.productPriceId || null,
        quantity: sp.quantity || 1,
      }));
    }
    // fallback لو الـ API لسه بيرجع productsId القديم (array of IDs)
    if (pandel.productsId && Array.isArray(pandel.productsId)) {
      return pandel.productsId.map((pid) => ({
        productId: typeof pid === "object" ? pid._id || pid.id : pid,
        productPriceId: null,
        quantity: 1,
      }));
    }
    return [];
  };

  const fields = [
    {
      key: "name",
      label: t("PandelName"),
      type: "text",
      required: true,
      placeholder: t("EnterPandelName"),
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
      label: t("Price(EGP)"),
      type: "number",
      required: true,
      placeholder: t("EnterPrice"),
      min: 0,
      step: "0.01",
    },
    {
      key: "products",
      label: t("ProductsBundle"),
      type: "custom",
      required: true,
      render: (formData, setFormData) => {
        const selectedProducts = formData.products || [];

        const getProductData = (productId) =>
          products.find((p) => (p._id || p.id) === productId);

        const searchTerm = (formData.searchProduct || "").toLowerCase().trim();
        const suggestions =
          searchTerm.length > 0
            ? products
              .filter(
                (p) =>
                  (p.name && p.name.toLowerCase().includes(searchTerm)) ||
                  p.prices?.some(
                    (pr) =>
                      pr.code && pr.code.toString().includes(searchTerm)
                  )
              )
              .slice(0, 8)
            : [];

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

        const handleRemoveProduct = (productId) => {
          setFormData((prev) => ({
            ...prev,
            products: selectedProducts.filter(
              (sp) => sp.productId !== productId
            ),
          }));
        };

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

              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-50 overflow-hidden">
                  {suggestions.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-b-0"
                      onClick={() => handleAddProduct(p)}
                    >
                      <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={p.image || "/placeholder.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
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
                <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase">
                  {t("SelectedItems")} ({selectedProducts.length})
                </div>
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {selectedProducts.map((sp) => {
                    const productData = getProductData(sp.productId);
                    if (!productData) return null;

                    const variations = productData.prices || [];
                    const hasVariations = variations.length > 1;

                    return (
                      <div
                        key={sp.productId}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-md border overflow-hidden bg-white flex-shrink-0 mt-1">
                            <img
                              src={productData.image || "/placeholder.png"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 truncate">
                              {productData.name}
                            </h4>

                            {/* Variation Dropdown */}
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
                                    <option
                                      key={v._id || v.id}
                                      value={v._id || v.id}
                                    >
                                      {v.size || v.color || v.name || v.code} — {v.price} {t("EGP")}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

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

                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(sp.productId)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
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

  const toBase64 = (url) => {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const imagesBase64 = await Promise.all(
        (formData.images || []).map(async (img) => {
          if (typeof img === "string" && img.startsWith("http"))
            return await toBase64(img);
          return img;
        })
      );

      const payload = {
        name: formData.name,
        startdate: formData.startdate,
        enddate: formData.enddate,
        price: Number(formData.price),
        images: imagesBase64,
        products: (formData.products || []).map((sp) => ({
          productId: sp.productId,
          productPriceId: sp.productPriceId || null,
          quantity: sp.quantity || 1,
        })),
      };

      await putData(payload);
      toast.success(t("Bundle updated successfully"));
      navigate("/pandel");
    } catch (err) {
      toast.error(t("FailedtoupdateBundle"), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        description={t("Fill in the details below to add a new record")}
        title={t("EditBundleTitle", { name: pandel.name || "" })}
        submitButtonText={t("UpdateBundle")}
        fields={fields}
        initialData={{
          name: pandel.name || "",
          startdate: formatDate(pandel.startdate),
          enddate: formatDate(pandel.enddate),
          price: pandel.price || "",
          products: normalizeExistingProducts(), // ← تحويل البيانات القديمة للشكل الجديد
          images: pandel.images || [],
          searchProduct: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pandel")}
        loading={loading || updating}
      />
    </div>
  );
};

// مكون رفع الصور
const ImageUploadSection = ({ images, onImagesChange }) => {
  const { t } = useTranslation();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((newImages) =>
      onImagesChange([...images, ...newImages])
    );
  };

  const removeImage = (index) =>
    onImagesChange(images.filter((_, i) => i !== index));

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
                src={img.startsWith("http") ? img : `data:image/jpeg;base64,${img}`}
                alt=""
                className="w-full h-full object-cover rounded-lg border shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white text-red-500 shadow-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

export default PandelEdit;
