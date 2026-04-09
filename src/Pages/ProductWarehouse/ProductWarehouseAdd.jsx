// src/pages/AddProductToWarehouse.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2, Search, Loader2, CheckSquare, CheckCircle2, Square } from "lucide-react";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import SmartSearch from "@/components/SmartSearch";
import { useTranslation } from "react-i18next";

const ProductWarehouseAdd = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const warehouseId = localStorage.getItem("currentWarehouseId");

  const handleSearchByCode = async (code) => {
    if (!code) return toast.warn(t("Please enter a code first"));
    setIsSearching(true);
    try {
      const response = await api.post("/api/admin/product/code", { code });
      setSearchResults(response.data?.data?.products || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fields = [
    // حقول القيم الافتراضية (Global) - اختيارية لتسريع الإدخال
    {
      key: "default_qty",
      label: t("Default Quantity"),
      type: "number",
      placeholder: "1",
    },
    {
      key: "default_low",
      label: t("Default Low Stock"),
      type: "number",
      placeholder: "5",
    },
    // الحقل المخصص للبحث والجدول
    {
      key: "items",
      type: "custom",
      render: (formData, setFormData) => {
        const selectedItems = formData.items || [];
        const selectedIds = selectedItems.map(i => i.productId);

        const toggleProduct = (product) => {
          if (selectedIds.includes(product._id)) {
            setFormData(prev => ({
              ...prev,
              items: prev.items.filter(item => item.productId !== product._id)
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              items: [...prev.items, {
                productId: product._id,
                name: product.name,
                image: product.image,
                quantity: formData.default_qty || 1, // بياخد من القيمة الافتراضية لو موجودة
                low_stock: formData.default_low || 5
              }]
            }));
          }
        };

        const handleSelectAll = () => {
          const newItems = [...selectedItems];
          searchResults.forEach(p => {
            if (!selectedIds.includes(p._id)) {
              newItems.push({
                productId: p._id,
                name: p.name,
                image: p.image,
                quantity: formData.default_qty || 1,
                low_stock: formData.default_low || 5
              });
            }
          });
          setFormData(prev => ({ ...prev, items: newItems }));
        };

        const updateItemField = (id, field, value) => {
          setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
              item.productId === id ? { ...item, [field]: value } : item
            )
          }));
        };

        return (
          <div className="space-y-4">
            {/* منطقة البحث */}
            <div className="relative z-30">
              <div className="flex gap-2">
                <div className="flex-1">
                  <SmartSearch
                    value={formData.searchProduct || ""}
                    onChange={(val) => setFormData(prev => ({ ...prev, searchProduct: val }))}
                    placeholder={t("Search by name / code / scan...")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchByCode(formData.searchProduct)}
                  className="px-5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>

              {/* نتائج البحث */}
              {searchResults.length > 0 && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 z-50 overflow-hidden">
                  <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("Results")}</span>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <CheckSquare size={14} /> {t("Select All")}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((p) => (
                      <div key={p._id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <img src={p.image || "/placeholder.png"} className="w-10 h-10 rounded-lg object-cover border" />
                          <span className="text-sm font-bold text-gray-700">{p.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProduct(p)}
                          className={`p-1.5 rounded-lg border transition-all ${selectedIds.includes(p._id) ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-400 hover:border-red-300"}`}
                        >
                          {selectedIds.includes(p._id) ? <CheckCircle2 size={18} /> : <Square size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* قائمة المنتجات المختارة - هنا كل منتج له الـ 2 inputs بتوعه */}
            {selectedItems.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase px-1">{t("Selected Products Configuration")}</h3>
                {selectedItems.map((item) => (
                  <div key={item.productId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={item.image || "/placeholder.png"} className="w-10 h-10 rounded-xl object-cover" />
                        <span className="text-sm font-bold text-gray-800">{item.name}</span>
                      </div>
                      <button type="button" onClick={() => toggleProduct({ _id: item.productId })} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* الـ 2 Inputs لكل منتج */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("Quantity")}</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemField(item.productId, "quantity", e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("Low Stock Alert")}</label>
                        <input
                          type="number"
                          value={item.low_stock}
                          onChange={(e) => updateItemField(item.productId, "low_stock", e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const handleSubmit = async (formData) => {
    if (!warehouseId) return toast.error(t("Warehouse ID missing"));
    if (!formData.items?.length) return toast.error(t("Select at least one product"));

    setLoading(true);
    try {
      const payload = {
        warehouseId: warehouseId,
        products: formData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          low_stock: Number(item.low_stock)
        }))
      };

      await api.post("/api/admin/product_warehouse", payload);
      toast.success(t("Products added to inventory successfully"));
      navigate(`/product-warehouse/${warehouseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t("Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        title={t("Add Inventory")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/product-warehouse/${warehouseId}`)}
        initialData={{ items: [], searchProduct: "", default_qty: "", default_low: "" }}
        loading={loading}
      />
    </div>
  );
};

export default ProductWarehouseAdd;