import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Trash2 } from "lucide-react"; // Import icons
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import SmartSearch from "@/components/SmartSearch";
import { useTranslation } from "react-i18next";

const PandelAdd = () => {
  const navigate = useNavigate();
  // Fetch products to search against
  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const products = productsData?.products || [];

  const fields = [
    { 
      key: "name", 
      label: t("BundleName"), 
      type: "text", 
      required: true, 
    placeholder: t("BundleNamePlaceholder")
    },
    { 
      key: "startdate", 
      label: t("StartDate"), 
      type: "date", 
      required: true 
    },
    { 
      key: "enddate", 
    label: t("EndDate"),
      type: "date", 
      required: true 
    },
    {
      key: "price",
    label: t("Price"),
      type: "number",
      required: true,
      placeholder: t("PricePlaceholder"),
      min: 0,
      step: "0.01"
    },
{
  key: "productsId",
    label: t("ProductsBundle"),
  type: "custom",
  required: true,
  render: (formData, setFormData) => {
    const selectedIds = formData.productsId || [];
    // جلب بيانات المنتجات المختارة كاملة لعرضها في الصفوف
    const selectedProductsList = products.filter(p => selectedIds.includes(p._id || p.id));

    // منطق الفلترة (البحث اللحظي)
    const searchTerm = (formData.searchProduct || "").toLowerCase().trim();
    const suggestions = searchTerm.length > 0 
      ? products.filter(p => 
          (p.name && p.name.toLowerCase().includes(searchTerm)) || 
          (p.code && p.code.toString().toLowerCase().includes(searchTerm))
        ).slice(0, 8) // عرض عدد محدود لجمال التصميم
      : [];

    return (
      <div className="space-y-4">
        {/* حقل البحث والقائمة المنسدلة */}
        <div className="relative z-20">
          <SmartSearch
            value={formData.searchProduct || ""}
            onChange={(val) => setFormData(prev => ({ ...prev, searchProduct: val }))}
          />
          
          {/* قائمة الاقتراحات المنسدلة (Dropdown) */}
          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-50 overflow-hidden">
              {suggestions.map((p) => (
                <div
                  key={p._id || p.id}
                  className="px-4 py-3 hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-b-0"
                  onClick={() => {
                    const prodId = p._id || p.id;
                    if (!selectedIds.includes(prodId)) {
                      setFormData(prev => ({
                        ...prev,
                        productsId: [...selectedIds, prodId],
                        searchProduct: "" // تصغير القائمة بعد الاختيار
                      }));
                      toast.success(`${p.name} added!`);
                    } else {
                      toast.warning(t("Thisproductisalreadyinthebundle"));
                    }
                  }}
                >
                  {/* صورة المنتج في الاقتراحات */}
                  <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0 bg-gray-50">
                    <img 
                      src={p.image || "/placeholder-product.png"} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://via.placeholder.com/40"} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{p.name}</span>
                    <span className="text-xs text-gray-400">{t('Code')}: {p.prices?.[0]?.code || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* عرض المنتجات المختارة في صفوف (Rows) */}
        {selectedProductsList.length > 0 && (
          <div className="mt-4 border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-xs font-bold text-gray-500 uppercase">{t('BundleItems')} ({selectedProductsList.length})</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {selectedProductsList.map((product) => (
                <div key={product._id || product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* صورة المنتج في الصف */}
                    <div className="w-12 h-12 rounded-md border overflow-hidden bg-white">
                      <img 
                        src={product.image || "https://via.placeholder.com/50"} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{product.name}</h4>
                      <p className="text-xs text-gray-500 font-mono">ID: {product.code || product._id?.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newIds = selectedIds.filter(id => id !== (product._id || product.id));
                      setFormData(prev => ({ ...prev, productsId: newIds }));
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Remove product"
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
  }
},
    {
      key: "images",
      label: t("BundleImages"),
      type: "custom",
      required: false,
      render: (formData, setFormData) => (
        <ImageUploadSection 
          images={formData.images || []} 
          onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
        />
      )
    }
  ];

  const handleSubmit = async (formData) => {
    // Validation
    if(!formData.productsId || formData.productsId.length === 0) {
        toast.error(t("Please select at least one product for the Pandel"));
        return;
    }

    setLoading(true);
    try {
      // Clean Base64 images
      const imagesToSubmit = (formData.images || []).map(img => {
        if (typeof img === 'string' && img.includes("base64,")) {
          return img.split("base64,")[1];
        }
        return img;
      });

      const payload = {
        name: formData.name,
        productsId: formData.productsId, // Array of IDs
        images: imagesToSubmit,
        startdate: formData.startdate,
        enddate: formData.enddate,
        price: Number(formData.price)
      };

      await api.post("/api/admin/pandel", payload);
      toast.success(t("Pandelcreatedsuccessfully"));
      navigate("/pandel");
    } catch (err) {
      console.error("❌ Error creating pandel:", err);
      const errorMessage = err.response?.data?.message || t("Failedtocreatepandel");
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
          productsId: [],
          images: [],
          searchProduct: ""
        }}
        loading={loading}
      />
    </div>
  );
};

// --- Sub Component: Image Upload (Kept exactly as you had it, just visually polished) ---
const ImageUploadSection = ({ images, onImagesChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); 
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      onImagesChange([...images, ...newImages]);
    });
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="p-2 bg-purple-50 rounded-full mb-2">
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-purple-600">{t("ClickToUpload")}</span> {t("OrDragAndDrop")}</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
        </div>
        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
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