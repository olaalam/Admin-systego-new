// src/pages/AddProductToWarehouse.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import { Trash2, Package, Search } from "lucide-react"; 
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import SmartSearch from "@/components/SmartSearch"; 
import { useTranslation } from "react-i18next";

const ProductWarehouseAdd = () => {
  const navigate = useNavigate();
  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const [loading, setLoading] = useState(false);
  const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  // جلب معرف المخزن من localStorage
  const warehouseId = localStorage.getItem("currentWarehouseId");
  const products = productsData?.products || [];

  const fields = [
    {
      key: "productId",
      label: t("SelectProduct"),
      type: "custom",
      required: true,
      render: (formData, setFormData) => {
        // العثور على المنتج المختار حالياً من المصفوفة الكاملة
        const selectedProduct = products.find(p => (p._id || p.id) === formData.productId);
        
        // منطق الفلترة للبحث اللحظي
        const searchTerm = (formData.searchProduct || "").toLowerCase().trim();
        const suggestions = searchTerm.length > 0 
          ? products.filter(p => 
              (p.name && p.name.toLowerCase().includes(searchTerm)) || 
              (p.prices?.some(pr => pr.code && pr.code.toString().includes(searchTerm)))
            ).slice(0, 6) // تقليل العدد لشكل أنظف في صفحة المخزن
          : [];

        return (
          <div className="space-y-4">
            {!formData.productId ? (
              <div className="relative z-30">
                <SmartSearch
                  value={formData.searchProduct || ""}
                  onChange={(val) => setFormData(prev => ({ ...prev, searchProduct: val }))}
placeholder={t("ScanOrTypeProduct")}
                />
                
                {/* قائمة الاقتراحات المنسدلة */}
                {suggestions.length > 0 && (
                  <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((p) => (
                      <div
                        key={p._id || p.id}
                        className="px-4 py-3 hover:bg-teal-50 cursor-pointer flex items-center justify-between transition-colors border-b last:border-b-0"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            productId: p._id || p.id,
                            searchProduct: "" 
                          }));
                          toast.info(`Selected: ${p.name}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border bg-gray-50 overflow-hidden flex-shrink-0">
                            <img 
                              src={p.image || "/placeholder.png"} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = "https://via.placeholder.com/40"} 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700">{p.name}</span>
                            <span className="text-xs text-gray-400 font-mono">{t("Code")}: {p.prices?.[0]?.code || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-teal-600">
                           <Search size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* عرض الكارت عند اختيار منتج */
              <div className="flex items-center justify-between p-4 bg-white border-2 border-teal-100 rounded-xl shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-teal-50 overflow-hidden bg-gray-50 shadow-inner">
                    <img 
                      src={selectedProduct?.image || "/placeholder.png"} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-md font-black text-gray-800">{selectedProduct?.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full uppercase">
                         {t("Selected")}
                       </span>
                       <span className="text-xs text-gray-400 font-mono">
                         #{selectedProduct?.prices?.[0]?.code || 'No Code'}
                       </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, productId: "" }))}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
                  title="Remove and change product"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "quantity",
      label: t("Initial Stock Quantity"),
      type: "number",
      required: true,
      placeholder:t( "How many pieces are you adding?"),
      min: 1,
    },
    {
      key: "low_stock",
      label: t("Low Stock Alert Level"),
      type: "number",
      required: true,
      placeholder: t("Alert me when stock falls below..."),
      min: 0,
    },
  ];

  const handleSubmit = async (formData) => {
  if (!warehouseId) return toast.error(t("warehouseIdMissing"));
if (!formData.productId) return toast.error(t("selectProduct"));


    setLoading(true);
    try {
      const payload = {
        productId: formData.productId,
        warehouseId: warehouseId,
        quantity: Number(formData.quantity),
        low_stock: Number(formData.low_stock),
      };

      await api.post("/api/admin/product_warehouse", payload);
      toast.success(t("Inventory updated successfully"));
      navigate(`/product-warehouse/${warehouseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t("Failed to add product to warehouse"));
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
title={t("title")}
description={t("description")}
submitButtonText={t("submit")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/product-warehouse/${warehouseId}`)}
        initialData={{
          productId: "",
          quantity: "",
          low_stock: "",
          searchProduct: ""
        }}
        loading={loading}
      />
    </div>
  );
};

export default ProductWarehouseAdd;