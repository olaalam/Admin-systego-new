// src/Pages/StockTake/StockTakeCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Warehouse,
  Package,
  Search,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { ComboboxMultiSelect } from "@/components/ui/combobox-multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockTakeCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { postData, loading } = usePost("/api/admin/stocktake");
  const { data: warehousesData } = useGet("/api/admin/warehouse");

  const [formData, setFormData] = useState({
    warehouseId: "",
    type: "",
    mode: "",
    productIds: [],
  });

  // Fetch products for the selected warehouse (to send all products when type = full)
  const warehouseProductUrl = formData.warehouseId
    ? `/api/admin/product_warehouse/${formData.warehouseId}`
    : null;
  const { data: warehouseProductsData } = useGet(warehouseProductUrl);
  const warehouseProducts = warehouseProductsData?.products || [];

  // Fetch all products with warehouseId as a query parameter (to search and select when type = partial)
  const allProductUrl = formData.type === "partial" && formData.warehouseId
    ? `/api/admin/product?warehouseId=${formData.warehouseId}`
    : null;
  const { data: allProductsData, loading: loadingAllProducts } = useGet(allProductUrl);
  const allProducts = allProductsData?.products || allProductsData?.data || [];

  const warehouses = warehousesData?.warehouses || [];

  const handleProductSelectionChange = (newSelectedIds) => {
    setFormData((prev) => ({ ...prev, productIds: newSelectedIds }));
  };

  const handleSubmit = async () => {
    if (!formData.warehouseId) {
      toast.error(t("Please select a warehouse"));
      return;
    }
    if (!formData.type) {
      toast.error(t("Please select stock take type"));
      return;
    }
    if (!formData.mode) {
      toast.error(t("Please select stock take mode"));
      return;
    }
    if (formData.type === "partial" && formData.productIds.length === 0) {
      toast.error(t("Please select at least one product"));
      return;
    }

    const payload = {
      warehouseId: formData.warehouseId,
      type: formData.type,
      mode: formData.mode,
      productIds: formData.type === "full" ? warehouseProducts.map(p => p._id || p.productId) : formData.productIds,
    };

    try {
      const response = await postData(payload);
      if (response?.data?._id || response?.data?.stocktake?._id) {
        const id = response.data._id || response.data.stocktake._id;
        navigate(`/stocktake/details/${id}`);
      } else if (response) {
        navigate("/stocktake");
      }
    } catch (error) {
      console.error("StockTake create error:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full bg-white rounded-2xl shadow-sm p-8 border">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-100 p-3 rounded-xl">
            <ClipboardList className="text-red-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">
              {t("Create Stock Take")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("Fill in the details to create a new stock take")}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Warehouse Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Warehouse size={16} className="text-blue-600" />
              {t("Warehouse")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.warehouseId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  warehouseId: value,
                  productIds: [],
                })
              }
            >
              <SelectTrigger className="w-full h-12 rounded-xl focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder={t("Select Warehouse")} />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w._id} value={w._id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Package size={16} className="text-purple-600" />
              {t("Type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value, productIds: [] })
              }
            >
              <SelectTrigger className="w-full h-12 rounded-xl focus:ring-2 focus:ring-purple-500">
                <SelectValue placeholder={t("Select Type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{t("Full")}</SelectItem>
                <SelectItem value="partial">{t("Partial")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <ClipboardList size={16} className="text-cyan-600" />
              {t("Mode")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.mode}
              onValueChange={(value) =>
                setFormData({ ...formData, mode: value })
              }
            >
              <SelectTrigger className="w-full h-12 rounded-xl focus:ring-2 focus:ring-cyan-500">
                <SelectValue placeholder={t("Select Mode")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">{t("Manual")}</SelectItem>
                <SelectItem value="excel">{t("Excel")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Selection (for partial type) */}
        {formData.type === "partial" && (
          <div className="mb-8 p-6 bg-gray-50/30 rounded-2xl border border-gray-100/50 outline outline-1 outline-gray-100/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <label className="text-sm font-bold flex items-center gap-2">
                <Package size={20} className="text-gray-600" />
                <span className="text-lg text-gray-900">
                  {t("Select Products")}
                </span>
              </label>
              {formData.productIds.length > 0 && (
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border">
                  {formData.productIds.length} {t("selected")}
                </span>
              )}
            </div>

            {loadingAllProducts ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-white/50 rounded-xl border border-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
                {t("Loading products...")}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white/50 rounded-xl border-2 border-dashed border-gray-100">
                {t("No products available")}
              </div>
            ) : (
              <div className="w-full">
                <ComboboxMultiSelect
                  options={allProducts.map((p) => ({
                    label: p.name,
                    value: p._id,
                  }))}
                  selected={formData.productIds}
                  onChange={handleProductSelectionChange}
                  placeholder={t("Search and select products...")}
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Search size={12} />
                  {t("Quick search by product name")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {formData.warehouseId && formData.type && formData.mode && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">
              {t("Stock Take Summary")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-blue-600">{t("Warehouse")}:</span>{" "}
                <strong>
                  {warehouses.find((w) => w._id === formData.warehouseId)
                    ?.name || "-"}
                </strong>
              </div>
              <div>
                <span className="text-blue-600">{t("Type")}:</span>{" "}
                <strong>
                  {formData.type === "full" ? t("Full") : t("Partial")}
                </strong>
              </div>
              <div>
                <span className="text-blue-600">{t("Mode")}:</span>{" "}
                <strong>
                  {formData.mode === "manual" ? t("Manual") : t("Excel")}
                </strong>
              </div>
              {formData.type === "partial" && (
                <div>
                  <span className="text-blue-600">
                    {t("Products Selected")}:
                  </span>{" "}
                  <strong>{formData.productIds.length}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.warehouseId ||
            !formData.type ||
            !formData.mode
          }
          className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-red-100/50 flex items-center justify-center gap-3"
        >
          {loading ? (
            t("Processing...")
          ) : (
            <>
              <Send size={24} />
              {t("Create Stock Take")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}