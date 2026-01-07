// src/pages/PandelEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { X, Trash2 } from "lucide-react"; // إضافة الأيقونات
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import SmartSearch from "@/components/SmartSearch"; // استيراد البحث الذكي
import { useTranslation } from "react-i18next";

const PandelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { putData, loading: updating } = usePut(`/api/admin/pandel/${id}`);
  const { t, i18n } = useTranslation();

  const { data: productsData, loading: productsLoading } =
    useGet("/api/admin/product");
  const { data: pandelData, loading: pandelLoading } = useGet(
    `/api/admin/pandel/${id}`
  );
  const [loading, setLoading] = useState(false);

  if (productsLoading || pandelLoading) return <Loader />;

  const products = productsData?.products || [];
  const pandel = pandelData?.pandel || {};

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toISOString().split("T")[0];
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
      key: "productsId",
      label: t("ProductsBundle"),
      type: "custom",
      required: true,
      render: (formData, setFormData) => {
        const selectedIds = formData.productsId || [];
        const selectedProductsList = products.filter((p) =>
          selectedIds.includes(p._id || p.id)
        );

        const searchTerm = (formData.searchProduct || "").toLowerCase().trim();
        const suggestions =
          searchTerm.length > 0
            ? products
                .filter(
                  (p) =>
                    (p.name && p.name.toLowerCase().includes(searchTerm)) ||
                    p.prices?.some(
                      (pr) => pr.code && pr.code.toString().includes(searchTerm)
                    )
                )
                .slice(0, 8)
            : [];

        return (
          <div className="space-y-4">
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
                      onClick={() => {
                        const prodId = p._id || p.id;
                        if (!selectedIds.includes(prodId)) {
                          setFormData((prev) => ({
                            ...prev,
                            productsId: [...selectedIds, prodId],
                            searchProduct: "",
                          }));
                          toast.success(`${p.name} added!`);
                        } else {
                          toast.warning("Already added!");
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
                        <img
                          src={p.image || "/placeholder.png"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-700">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {t("Code")}: {p.prices?.[0]?.code || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProductsList.length > 0 && (
              <div className="mt-4 border rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase">
                  {t("SelectedItems")}
                </div>
                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                  {selectedProductsList.map((product) => (
                    <div
                      key={product._id || product.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md border overflow-hidden bg-white flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.png"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {t("Code")}: {product.prices?.[0]?.code || "N/A"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newIds = selectedIds.filter(
                            (id) => id !== (product._id || product.id)
                          );
                          setFormData((prev) => ({
                            ...prev,
                            productsId: newIds,
                          }));
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
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
        productsId: formData.productsId,
        images: imagesBase64,
        startdate: formData.startdate,
        enddate: formData.enddate,
        price: Number(formData.price),
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
          productsId: pandel.productsId || [],
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

// مكون رفع الصور (المحسن والمطابق لصفحة الـ Add)
const ImageUploadSection = ({ images, onImagesChange }) => {
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
              Click to upload
            </span>
          </p>
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
                src={
                  img.startsWith("http") ? img : `data:image/jpeg;base64,${img}`
                }
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
