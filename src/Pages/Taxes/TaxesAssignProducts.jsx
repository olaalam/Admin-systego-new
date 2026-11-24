import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CheckSquare,
  Square,
  Package,
  Percent,
  Check,
  AlertCircle,
  Loader2,
  Filter,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "@/api/api";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";

// Helper for image URLs
const getImageUrl = (imageStr) => {
  if (!imageStr) return "";
  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) return imageStr;
  if (imageStr.startsWith("data:")) return imageStr;
  if (imageStr.match(/^[A-Za-z0-9+/=]+$/)) return `data:image/jpeg;base64,${imageStr}`;
  return imageStr;
};

export default function TaxesAssignProducts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTaxId = searchParams.get("taxId") || "";

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Data fetching
  const { data: taxesSelectionData, loading: loadingTaxes } = useGet(
    "/api/admin/taxes/selection"
  );
  const { data: taxesFallbackData } = useGet("/api/admin/taxes");
  const { data: productsData, loading: loadingProducts, refetch: refetchProducts } = useGet(
    "/api/admin/product"
  );
  const { data: categoriesData } = useGet("/api/admin/category");

  // State
  const [selectedTaxId, setSelectedTaxId] = useState(initialTaxId);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize Taxes List
  const taxesList = useMemo(() => {
    const raw =
      taxesSelectionData?.taxes ||
      taxesSelectionData?.tax ||
      taxesSelectionData?.data ||
      (Array.isArray(taxesSelectionData) ? taxesSelectionData : null) ||
      taxesFallbackData?.taxes ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [taxesSelectionData, taxesFallbackData]);

  // Set initial selected tax when taxes load if not already set
  useEffect(() => {
    if (!selectedTaxId && taxesList.length > 0) {
      if (initialTaxId && taxesList.some((tx) => (tx._id || tx.id) === initialTaxId)) {
        setSelectedTaxId(initialTaxId);
      } else {
        setSelectedTaxId(taxesList[0]._id || taxesList[0].id);
      }
    }
  }, [taxesList, initialTaxId, selectedTaxId]);

  // Normalize Products List
  const productsList = useMemo(() => {
    const raw = productsData?.products || productsData?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [productsData]);

  // Categories list
  const categoriesList = useMemo(() => {
    const raw = categoriesData?.categories || categoriesData?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);

  // Current selected tax object
  const currentTax = useMemo(() => {
    return taxesList.find((tx) => (tx._id || tx.id) === selectedTaxId) || null;
  }, [taxesList, selectedTaxId]);

  // Helper to format tax rate
  const formatTaxRate = (tax) => {
    if (!tax) return "";
    if (tax.type === "percentage") {
      const p =
        tax.amount !== undefined
          ? Number(tax.amount) < 1
            ? Number(tax.amount) * 100
            : Number(tax.amount)
          : tax.percentage || 0;
      return `${parseFloat(Number(p).toFixed(2))}%`;
    }
    return `${tax.amount || 0} ${t("EGP", "EGP")}`;
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Search filter
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (product.name || "").toLowerCase().includes(q) ||
        (product.name_ar || product.ar_name || "").toLowerCase().includes(q) ||
        (product.code || "").toLowerCase().includes(q) ||
        (product.barcode || "").toLowerCase().includes(q) ||
        (product.sku || "").toLowerCase().includes(q);

      // Category filter
      let matchesCategory = true;
      if (selectedCategory) {
        if (Array.isArray(product.categoryId)) {
          matchesCategory = product.categoryId.some(
            (c) => (c._id || c.id || c) === selectedCategory
          );
        } else if (product.categoryId) {
          matchesCategory =
            (product.categoryId._id || product.categoryId.id || product.categoryId) ===
            selectedCategory;
        } else {
          matchesCategory = false;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [productsList, searchTerm, selectedCategory]);

  // Toggle single product selection
  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Toggle all filtered products
  const isAllFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.has(p._id || p.id));

  const toggleSelectAllFiltered = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        filteredProducts.forEach((p) => next.delete(p._id || p.id));
      } else {
        filteredProducts.forEach((p) => next.add(p._id || p.id));
      }
      return next;
    });
  };

  // Pre-select products that currently have this tax assigned
  const selectCurrentlyAssignedProducts = () => {
    if (!selectedTaxId) return;
    const currentTaxAssignedIds = productsList
      .filter((p) => {
        const pTaxId = p.taxesId?._id || p.taxesId || p.taxId?._id || p.taxId;
        return pTaxId === selectedTaxId;
      })
      .map((p) => p._id || p.id);

    setSelectedProductIds(new Set(currentTaxAssignedIds));
    toast.info(
      isRTL
        ? `تم تحديد ${currentTaxAssignedIds.length} منتج مسند لهذه الضريبة بالفعل`
        : `Selected ${currentTaxAssignedIds.length} products already assigned to this tax`
    );
  };

  // Submit Handler
  const handleAssign = async () => {
    if (!selectedTaxId) {
      toast.error(isRTL ? "يرجى اختيار الضريبة أولاً" : "Please select a tax first");
      return;
    }

    if (selectedProductIds.size === 0) {
      toast.error(
        isRTL
          ? "يرجى تحديد منتج واحد على الأقل للربط بالضريبة"
          : "Please select at least one product to assign"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        taxId: selectedTaxId,
        product_ids: Array.from(selectedProductIds),
      };

      const res = await api.post("/api/admin/taxes/assign-products", payload);

      toast.success(
        res.data?.message ||
          (isRTL
            ? `تم ربط ${selectedProductIds.size} منتج بالضريبة بنجاح!`
            : `Successfully assigned ${selectedProductIds.size} products to the tax!`)
      );

      // Refresh products list
      refetchProducts();

      // Navigate back after brief delay
      setTimeout(() => {
        navigate("/taxes");
      }, 700);
    } catch (err) {
      console.error("Failed to assign products to tax:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        (isRTL ? "فشل ربط المنتجات بالضريبة" : "Failed to assign products to tax");
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTaxes && loadingProducts) {
    return <Loader />;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/taxes")}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-xs text-gray-700"
            title={isRTL ? "رجوع للضرائب" : "Back to Taxes"}
          >
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Percent className="w-6 h-6 text-red-600" />
              <span>{isRTL ? "ربط المنتجات بالضريبة" : "Assign Products to Tax"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {isRTL
                ? "حدد الضريبة المستهدفة واختر المنتجات المراد تطبيقها عليها دفعة واحدة"
                : "Select a tax and choose the products you wish to apply it to in bulk"}
            </p>
          </div>
        </div>

        {/* Action Button (Desktop) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/taxes")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || !selectedTaxId || selectedProductIds.size === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-red-700 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>
              {isRTL
                ? `حفظ وتعيين (${selectedProductIds.size})`
                : `Assign (${selectedProductIds.size}) Products`}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tax Selector Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4 text-red-600" />
              <span>{isRTL ? "1. اختيار الضريبة" : "1. Select Tax"}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  {isRTL ? "الضريبة المستهدفة" : "Target Tax"}
                </label>
                <select
                  value={selectedTaxId}
                  onChange={(e) => setSelectedTaxId(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm"
                >
                  <option value="">{isRTL ? "-- اختر الضريبة --" : "-- Select a Tax --"}</option>
                  {taxesList.map((tx) => (
                    <option key={tx._id || tx.id} value={tx._id || tx.id}>
                      {tx.name || tx.ar_name} ({formatTaxRate(tx)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Tax Info Box */}
              {currentTax ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50/70 to-red-100/40 border border-red-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {currentTax.name}
                      </h4>
                      {currentTax.ar_name && (
                        <p className="text-xs text-gray-600">{currentTax.ar_name}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-600 text-white shadow-xs">
                      {formatTaxRate(currentTax)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-xs text-gray-600">
                    <span>{isRTL ? "نوع الضريبة:" : "Type:"}</span>
                    <span className="font-semibold text-gray-800">
                      {currentTax.type === "percentage"
                        ? isRTL
                          ? "نسبة مئوية (%)"
                          : "Percentage (%)"
                        : isRTL
                        ? "قيمة ثابتة"
                        : "Fixed Amount"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{isRTL ? "الحالة:" : "Status:"}</span>
                    <span
                      className={`font-semibold ${
                        currentTax.status ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {currentTax.status
                        ? isRTL
                          ? "نشط"
                          : "Active"
                        : isRTL
                        ? "غير نشط"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Helper Button to select current assigned */}
                  <button
                    type="button"
                    onClick={selectCurrentlyAssignedProducts}
                    className="w-full mt-2 pt-2 border-t border-red-200/60 text-xs text-red-700 hover:text-red-900 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>
                      {isRTL
                        ? "تحديد المنتجات التابعة لهذه الضريبة حالياً"
                        : "Select products currently using this tax"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                  {isRTL
                    ? "يرجى اختيار ضريبة لعرض تفاصيلها وربط المنتجات بها"
                    : "Please choose a tax to view details and assign products"}
                </div>
              )}
            </div>
          </div>

          {/* Selection Counter Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {isRTL ? "ملخص التحديد" : "Selection Summary"}
            </h4>

            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-600">
                {isRTL ? "المنتجات المحددة:" : "Selected Products:"}
              </span>
              <span className="text-2xl font-black text-red-600">
                {selectedProductIds.size}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{isRTL ? "إجمالي المنتجات المعروضة:" : "Visible Products:"}</span>
              <span className="font-medium text-gray-700">{filteredProducts.length}</span>
            </div>

            {selectedProductIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedProductIds(new Set())}
                className="w-full text-xs text-gray-500 hover:text-red-600 transition-colors pt-2 border-t border-gray-100 text-center"
              >
                {isRTL ? "إلغاء تحديد كل المنتجات" : "Clear all selections"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Products Table / Selector Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Table Header & Search Filter */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" />
                  <span>{isRTL ? "2. تحديد المنتجات" : "2. Select Products"}</span>
                </h3>

                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  disabled={filteredProducts.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isAllFilteredSelected ? (
                    <CheckSquare size={14} className="text-red-600" />
                  ) : (
                    <Square size={14} />
                  )}
                  <span>
                    {isAllFilteredSelected
                      ? isRTL
                        ? "إلغاء تحديد المعروض"
                        : "Deselect Visible"
                      : isRTL
                      ? "تحديد كل المعروض"
                      : "Select All Visible"}
                  </span>
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search */}
                <div className="sm:col-span-7 relative">
                  <Search
                    size={16}
                    className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                      isRTL ? "right-3" : "left-3"
                    }`}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      isRTL
                        ? "بحث بالاسم، الباركود، الكود..."
                        : "Search by name, barcode, code..."
                    }
                    className={`w-full h-10 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white ${
                      isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>

                {/* Category Filter */}
                <div className="sm:col-span-5">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 text-xs border border-gray-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">
                      {isRTL ? "جميع الأقسام" : "All Categories"}
                    </option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-gray-100">
              {loadingProducts ? (
                <div className="py-16 text-center text-gray-500">
                  <Loader2 size={32} className="animate-spin text-red-600 mx-auto mb-2" />
                  <p className="text-xs">{isRTL ? "جاري تحميل المنتجات..." : "Loading products..."}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Package size={40} className="mx-auto mb-2 stroke-1" />
                  <p className="text-sm font-semibold text-gray-700">
                    {isRTL ? "لم يتم العثور على أي منتجات" : "No products found"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRTL
                      ? "جرب تغيير مصطلح البحث أو القسم المحدد"
                      : "Try changing your search term or category"}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const pId = product._id || product.id;
                  const isSelected = selectedProductIds.has(pId);
                  const imageUrl = getImageUrl(product.image);

                  // Current product tax info
                  const pTax = product.taxesId || product.taxId;
                  const hasAssignedTax = Boolean(pTax);
                  const isAssignedToCurrent =
                    (pTax?._id || pTax?.id || pTax) === selectedTaxId;

                  return (
                    <div
                      key={pId}
                      onClick={() => toggleProduct(pId)}
                      className={`p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-red-50/60 hover:bg-red-50"
                          : "hover:bg-gray-50/80 bg-white"
                      }`}
                    >
                      {/* Checkbox + Image + Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProduct(pId);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(pId)}
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>
                            {(product.name_ar || product.ar_name) && (
                              <span className="text-xs text-gray-500">
                                ({product.name_ar || product.ar_name})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mt-0.5">
                            {(product.categoryId?.[0]?.name || product.categoryId?.name) && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                                {product.categoryId?.[0]?.name || product.categoryId?.name}
                              </span>
                            )}
                            {(product.code || product.barcode || product.sku) && (
                              <span className="font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 text-[11px]">
                                #{product.code || product.barcode || product.sku}
                              </span>
                            )}
                            <span className="font-bold text-red-600">
                              {typeof product.price === "object"
                                ? product.price.price
                                : product.price || 0}{" "}
                              {t("EGP", "EGP")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Tag / Status Badge */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isAssignedToCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold bg-green-50 text-green-700 border border-green-200">
                            <Check size={12} />
                            <span>{isRTL ? "تتبع هذه الضريبة" : "Assigned"}</span>
                          </span>
                        ) : hasAssignedTax ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span>{isRTL ? "ضريبة أخرى" : "Other Tax"}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 px-2 py-0.5">
                            {isRTL ? "بدون ضريبة" : "No Tax"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex sm:hidden items-center justify-between gap-2">
              <span className="text-xs text-gray-600">
                {isRTL
                  ? `محدد: ${selectedProductIds.size}`
                  : `Selected: ${selectedProductIds.size}`}
              </span>
              <button
                type="button"
                onClick={handleAssign}
                disabled={isSubmitting || !selectedTaxId || selectedProductIds.size === 0}
                className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-red-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>{isRTL ? "حفظ وتعيين" : "Assign"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
