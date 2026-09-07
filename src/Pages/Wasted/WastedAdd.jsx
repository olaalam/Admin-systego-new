import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Warehouse,
  Package,
  Layers,
  AlertTriangle,
  FileText,
  Send,
  Search,
  CheckCircle2,
  Info,
  Boxes,
} from "lucide-react";
import { toast } from "react-toastify";

// دالة مساعدة ذكية وشاملة لاستخراج خيارات وتشكيلات المنتج البشرية (مثل SM, LG, RED, Blue) بدلاً من الأكواد
const getVariantOptionLabel = (priceObj, isArabic = false, allVariations = []) => {
  if (!priceObj) return "";

  const collected = [];

  // 1. من priceObj.variations (المُعاد من /api/admin/product)
  // الهيكل: [ { name: "Size", options: [ { name: "SM", ar_name: "صغير" } ] } ]
  if (Array.isArray(priceObj.variations) && priceObj.variations.length > 0) {
    priceObj.variations.forEach((v) => {
      if (Array.isArray(v.options) && v.options.length > 0) {
        const names = v.options
          .map((opt) => {
            if (typeof opt === "object" && opt !== null) {
              return isArabic ? opt.ar_name || opt.name : opt.name || opt.ar_name;
            }
            if (typeof opt === "string" || typeof opt === "number") {
              const strId = String(opt);
              const found = Array.isArray(allVariations)
                ? allVariations.flatMap((item) => item.options || []).find((o) => String(o._id || o.id) === strId)
                : null;
              if (found) {
                return isArabic ? found.ar_name || found.name : found.name || found.ar_name;
              }
              return String(opt);
            }
            return "";
          })
          .filter(Boolean);

        if (names.length > 0) {
          collected.push(names.join(", "));
        }
      } else if (v.name) {
        collected.push(v.name);
      }
    });
  }

  // 2. من priceObj.options (المُعاد من /api/admin/product_warehouse)
  // الهيكل: [ { name: "SM", ar_name: "صغير" } ] أو مصفوفة IDs
  if (collected.length === 0 && Array.isArray(priceObj.options) && priceObj.options.length > 0) {
    const names = priceObj.options
      .map((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return isArabic ? opt.ar_name || opt.name : opt.name || opt.ar_name;
        }
        if (typeof opt === "string" || typeof opt === "number") {
          const strId = String(opt);
          const found = Array.isArray(allVariations)
            ? allVariations.flatMap((item) => item.options || []).find((o) => String(o._id || o.id) === strId)
            : null;
          if (found) {
            return isArabic ? found.ar_name || found.name : found.name || found.ar_name;
          }
        }
        return "";
      })
      .filter(Boolean);

    if (names.length > 0) {
      collected.push(...names);
    }
  }

  // 3. من priceObj.productpriceoptions (Virtuals)
  if (collected.length === 0 && Array.isArray(priceObj.productpriceoptions) && priceObj.productpriceoptions.length > 0) {
    const names = priceObj.productpriceoptions
      .map((po) => {
        const opt = po.option || po;
        if (typeof opt === "object" && opt !== null) {
          return isArabic ? opt.ar_name || opt.name : opt.name || opt.ar_name;
        }
        return "";
      })
      .filter(Boolean);

    if (names.length > 0) {
      collected.push(...names);
    }
  }

  // 4. من الحقول المباشرة على مستوى السعر (name, title, variation_name, size, color)
  if (collected.length === 0) {
    const direct =
      priceObj.variation_name ||
      priceObj.title ||
      priceObj.size ||
      priceObj.color ||
      (priceObj.name && priceObj.name !== priceObj.code ? priceObj.name : "");
    if (direct) {
      collected.push(direct);
    }
  }

  // تنظيف وتجميع الخيارات بدون تكرار
  const uniqueNames = Array.from(new Set(collected.filter(Boolean)));
  if (uniqueNames.length > 0) {
    return uniqueNames.join(" - "); // مثال: SM أو LG أو SM - Red
  }

  // في حال تعذر قراءة أي خيار يتم استخدام الكود كحل أخير
  return priceObj.code || `Variant`;
};

export default function WastedAdd() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;

  const { postData, loading: isSubmitting } = usePost("/api/admin/wasted");

  // 1. جلب قائمة المستودعات
  const { data: warehousesData } = useGet("/api/admin/warehouse");

  const [formData, setFormData] = useState({
    warehouseId: "",
    productId: "",
    productPriceId: "",
    quantity: "",
    reason: "damaged",
    note: "",
    isApproved: true,
  });

  const [productSearch, setProductSearch] = useState("");

  // استخراج قائمة المستودعات
  const warehouses = useMemo(() => {
    if (!warehousesData) return [];
    if (Array.isArray(warehousesData)) return warehousesData;
    if (Array.isArray(warehousesData.warehouses)) return warehousesData.warehouses;
    if (Array.isArray(warehousesData.data?.warehouses)) return warehousesData.data.warehouses;
    if (Array.isArray(warehousesData.data)) return warehousesData.data;
    return [];
  }, [warehousesData]);

  // 2. جلب منتجات المستودع المحدد
  const warehouseProductUrl = formData.warehouseId
    ? `/api/admin/product_warehouse/${formData.warehouseId}`
    : null;
  const { data: whProductsRes, loading: loadingWhProducts } = useGet(warehouseProductUrl);

  // 3. جلب كافة منتجات النظام لضمان عدم ضياع أي منتج تمت إضافته
  const { data: allProductsRes, loading: loadingAllProducts } = useGet("/api/admin/product");

  // 4. جلب التشكيلات العامة لترجمة وقراءة خيارات المنتجات (SM, LG, Red, إلخ)
  const { data: allVariationsRes } = useGet("/api/admin/variation");

  // دمج المنتجات من المستودع ومن النظام لضمان ظهور كل المنتجات
  const combinedProducts = useMemo(() => {
    if (!formData.warehouseId) return [];

    // استخراج منتجات المستودع
    const whProducts =
      whProductsRes?.data?.products ||
      whProductsRes?.products ||
      (Array.isArray(whProductsRes?.data) ? whProductsRes.data : []) ||
      (Array.isArray(whProductsRes) ? whProductsRes : []) ||
      [];

    // استخراج كافة المنتجات العامة
    const allProducts =
      allProductsRes?.data?.products ||
      allProductsRes?.products ||
      (Array.isArray(allProductsRes?.data) ? allProductsRes.data : []) ||
      (Array.isArray(allProductsRes) ? allProductsRes : []) ||
      [];

    // خريطة لتجميع المنتجات بناء على _id
    const productMap = new Map();

    // خريطة للبحث السريع في المنتجات العامة
    const allProdMap = new Map();
    allProducts.forEach((p) => {
      if (p?._id) allProdMap.set(String(p._id), p);
    });

    // أولاً: إضافة منتجات المستودع مع كمياتها الفعلية ودمج خياراتها
    whProducts.forEach((p) => {
      if (!p) return;
      const id = String(p._id || p.stockId || "");
      if (!id) return;

      const generalProd = allProdMap.get(id);

      // دمج مصفوفة prices بحيث تجمع بين variations العامة و options الخاصة بالمستودع
      let mergedPrices = p.prices || generalProd?.prices || [];
      if (generalProd?.prices && p.prices) {
        mergedPrices = p.prices.map((whPrice) => {
          const matchedGenPrice = generalProd.prices.find(
            (gp) => String(gp._id) === String(whPrice._id)
          );
          return {
            ...whPrice,
            ...(matchedGenPrice || {}),
            ...whPrice,
            variations: matchedGenPrice?.variations || whPrice.variations,
            options: whPrice.options || matchedGenPrice?.options,
          };
        });
      }

      if (productMap.has(id)) {
        const existing = productMap.get(id);
        existing.availableStock = (existing.availableStock || 0) + (p.quantity ?? 0);
      } else {
        productMap.set(id, {
          ...(generalProd || {}),
          ...p,
          _id: id,
          availableStock: p.quantity ?? generalProd?.quantity ?? 0,
          inWarehouse: true,
          prices: mergedPrices,
        });
      }
    });

    // ثانياً: إضافة بقية المنتجات العامة إن لم تكن مضافة بعد
    allProducts.forEach((p) => {
      if (!p) return;
      const id = String(p._id || "");
      if (id && !productMap.has(id)) {
        // حساب رصيده في هذا المستودع إن وجد في p.stocks
        let stockInThisWh = 0;
        if (Array.isArray(p.stocks)) {
          const match = p.stocks.find(
            (s) => String(s.warehouseId?._id || s.warehouseId) === String(formData.warehouseId)
          );
          if (match) stockInThisWh = match.quantity || 0;
        } else {
          stockInThisWh = p.quantity || 0;
        }

        productMap.set(id, {
          ...p,
          _id: id,
          availableStock: stockInThisWh,
          inWarehouse: stockInThisWh > 0,
        });
      }
    });

    return Array.from(productMap.values());
  }, [formData.warehouseId, whProductsRes, allProductsRes]);

  // إعادة ضبط المنتج عند تغيير المستودع
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      productId: "",
      productPriceId: "",
      quantity: "",
    }));
    setProductSearch("");
  }, [formData.warehouseId]);

  // المنتجات المصفاة بناءً على البحث
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return combinedProducts;
    const term = productSearch.toLowerCase().trim();
    return combinedProducts.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const arName = (p.ar_name || "").toLowerCase();
      const code = (p.code || "").toLowerCase();
      return name.includes(term) || arName.includes(term) || code.includes(term);
    });
  }, [combinedProducts, productSearch]);

  // المنتج المختار حالياً
  const selectedProduct = useMemo(() => {
    if (!formData.productId) return null;
    return combinedProducts.find((p) => String(p._id) === String(formData.productId));
  }, [combinedProducts, formData.productId]);

  // خيارات/أسعار المنتج المختار (Variants) بأسماء الخيارات البشرية (SM, LG, Red, إلخ)
  const variants = useMemo(() => {
    if (!selectedProduct?.prices || selectedProduct.prices.length === 0) {
      return [];
    }

    const allVariations =
      allVariationsRes?.variations ||
      allVariationsRes?.data?.variations ||
      allVariationsRes?.data ||
      allVariationsRes ||
      [];

    return selectedProduct.prices.map((p) => {
      const optionLabel = getVariantOptionLabel(p, isArabic, allVariations);
      return {
        _id: p._id,
        name: optionLabel,
        code: p.code,
        price: p.price,
        quantity: p.quantity,
      };
    });
  }, [selectedProduct, allVariationsRes, isArabic]);

  // أقصى رصيد متاح للهالك (مع احتساب رصيد الـ Variant إن اختاره المستخدم)
  const maxAvailableStock = useMemo(() => {
    if (!selectedProduct) return 0;
    if (formData.productPriceId) {
      const selectedVariant = variants.find(
        (v) => String(v._id) === String(formData.productPriceId)
      );
      if (
        selectedVariant &&
        selectedVariant.quantity !== undefined &&
        selectedVariant.quantity !== null &&
        selectedVariant.quantity > 0
      ) {
        return selectedVariant.quantity;
      }
    }
    return selectedProduct.availableStock ?? selectedProduct.quantity ?? 0;
  }, [selectedProduct, formData.productPriceId, variants]);

  // تغيير حقول النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // اختيار المنتج
  const handleProductSelect = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productId,
      productPriceId: "",
      quantity: "",
    }));
  };

  // إرسال النموذج للباك إند
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      toast.error(t("Please select a warehouse"));
      return;
    }
    if (!formData.productId) {
      toast.error(t("Please select a product"));
      return;
    }
    const qty = Number(formData.quantity);
    if (!qty || qty <= 0) {
      toast.error(t("Quantity must be greater than 0"));
      return;
    }
    if (maxAvailableStock > 0 && qty > maxAvailableStock) {
      toast.error(
        `${t("Quantity exceeds available warehouse stock")} (${maxAvailableStock})`
      );
      return;
    }
    if (!formData.reason) {
      toast.error(t("Please select a reason"));
      return;
    }

    const payload = {
      warehouseId: formData.warehouseId,
      productId: formData.productId,
      productPriceId: formData.productPriceId || null,
      quantity: qty,
      reason: formData.reason,
      note: formData.note.trim() || undefined,
      isApproved: formData.isApproved,
    };

    try {
      const res = await postData(payload);
      if (res?.success || res) {
        toast.success(t("Wasted entry created successfully!"));
        navigate("/wasted");
      }
    } catch (err) {
      console.error("Create wasted error:", err);
    }
  };

  const isLoadingProducts = loadingWhProducts || loadingAllProducts;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة وزر الرجوع */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/wasted")}
              className="p-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-2xl transition-colors shadow-xs"
            >
              <BackArrow size={18} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {t("Add Wasted")}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isArabic
                  ? "تسجيل منتج تالف أو مفقود مع فحص رصيد المخزن"
                  : "Record damaged or missing inventory items"}
              </p>
            </div>
          </div>
        </div>

        {/* نموذج الإضافة */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
            {/* 1. اختيار المستودع أولاً */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <Warehouse size={15} className="text-orange-500" />
                  {t("Warehouse")} <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                required
              >
                <option value="">-- {t("Select Warehouse")} --</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. اختيار المنتج (يظهر بمجرد اختيار المستودع) */}
            {formData.warehouseId ? (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Package size={15} className="text-blue-500" />
                      {t("Product")} <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <span className="text-[11px] font-bold text-gray-400">
                    {combinedProducts.length}{" "}
                    {isArabic ? "منتج متاح للاختيار" : "products available"}
                  </span>
                </div>

                {isLoadingProducts ? (
                  <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>{isArabic ? "جاري تحميل قائمة المنتجات..." : "Loading products..."}</span>
                  </div>
                ) : combinedProducts.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
                    {isArabic
                      ? "لا توجد منتجات مسجلة في هذا المستودع حتى الآن."
                      : "No products found for this warehouse."}
                  </div>
                ) : (
                  <>
                    {/* قائمة الاختيار المباشرة (Select Dropdown) */}
                    <select
                      value={formData.productId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      required
                    >
                      <option value="">
                        -- {isArabic ? "اختر المنتج من القائمة" : "Choose a product"} --
                      </option>
                      {combinedProducts.map((p) => {
                        const name = isArabic ? p.ar_name || p.name : p.name;
                        const stock = p.availableStock ?? p.quantity ?? 0;
                        return (
                          <option key={p._id} value={p._id}>
                            {name} {p.code ? `[${p.code}]` : ""} — (
                            {isArabic ? "رصيد المخزن" : "Stock"}: {stock})
                          </option>
                        );
                      })}
                    </select>

                    {/* حقل البحث السريع بالاسم أو الباركود كخيار إضافي مريح */}
                    <div className="relative mt-2">
                      <Search
                        size={15}
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                          isArabic ? "right-3.5" : "left-3.5"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder={
                          isArabic
                            ? "أو ابحث هنا باسم المنتج أو الكود..."
                            : "Or search by name or code..."
                        }
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className={`w-full py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
                        }`}
                      />
                    </div>

                    {/* نتائج البحث السريع إن وُجد نص بحث */}
                    {productSearch.trim() && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        {filteredProducts.map((p) => {
                          const isSelected = formData.productId === p._id;
                          const name = isArabic ? p.ar_name || p.name : p.name;
                          return (
                            <div
                              key={p._id}
                              onClick={() => handleProductSelect(p._id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "bg-white border-gray-200 hover:bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="truncate">
                                <p className="font-bold text-xs truncate">{name}</p>
                                {p.code && (
                                  <p
                                    className={`font-mono text-[10px] ${
                                      isSelected ? "text-blue-100" : "text-gray-400"
                                    }`}
                                  >
                                    {p.code}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                                  isSelected
                                    ? "bg-blue-700 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {isArabic ? "متاح" : "Stock"}:{" "}
                                {p.availableStock ?? p.quantity ?? 0}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* بطاقة تأكيد المنتج المختار ورصيده */}
                    {selectedProduct && (
                      <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center font-bold text-blue-600 shrink-0">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900">
                              {isArabic
                                ? selectedProduct.ar_name || selectedProduct.name
                                : selectedProduct.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {selectedProduct.code && (
                                <span className="font-mono text-[11px] text-gray-500">
                                  {selectedProduct.code}
                                </span>
                              )}
                              {formData.productPriceId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[11px] font-black">
                                  <Layers size={11} />
                                  {variants.find((v) => String(v._id) === String(formData.productPriceId))?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-blue-600 block">
                            {isArabic ? "الرصيد في المخزن" : "Warehouse Stock"}
                          </span>
                          <span className="text-xl font-black text-blue-700">
                            {maxAvailableStock}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                {isArabic
                  ? "يرجى اختيار المستودع أولاً لعرض قائمة المنتجات المتاحة فيه."
                  : "Please select a warehouse first to see available products."}
              </div>
            )}

            {/* 3. اختيار التشكيلة/الـ Variant إن وُجدت */}
            {selectedProduct && variants.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Layers size={15} className="text-purple-500" />
                      {isArabic
                        ? "التشكيلة / الخيار (المقاس، اللون، إلخ)"
                        : "Variant / Option (Size, Color, etc.)"}
                    </span>
                  </label>
                  <span className="text-[11px] font-bold text-purple-600">
                    {variants.length} {isArabic ? "خيارات متوفرة" : "options available"}
                  </span>
                </div>
                <select
                  name="productPriceId"
                  value={formData.productPriceId}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="">
                    -- {isArabic ? "اختر الخيار / التشكيلة (مثل: SM, LG, أحمر...)" : "Select Option / Variant (e.g. SM, LG, RED...)"} --
                  </option>
                  {variants.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} {v.price !== undefined ? `(${v.price} EGP)` : ""} {v.quantity !== undefined && v.quantity !== null && v.quantity > 0 ? `[${isArabic ? "الرصيد" : "Stock"}: ${v.quantity}]` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. الكمية والسبب */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {/* الكمية */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
                    {t("Quantity")} <span className="text-red-500">*</span>
                  </label>
                  {selectedProduct && (
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {isArabic ? "أقصى كمية" : "Max"}:{" "}
                      <strong className="text-red-600 font-black">
                        {maxAvailableStock}
                      </strong>
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={maxAvailableStock > 0 ? maxAvailableStock : undefined}
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder={isArabic ? "أدخل الكمية التالفة..." : "Enter wasted quantity"}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  required
                />
              </div>

              {/* سبب الهالك */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-500" />
                    {t("Reason")} <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                  required
                >
                  <option value="damaged">{t("damaged")}</option>
                  <option value="expired">{t("expired")}</option>
                  <option value="theft">{t("theft")}</option>
                  <option value="lost">{t("lost")}</option>
                  <option value="stocktake_not_found">
                    {t("stocktake_not_found")}
                  </option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>
            </div>

            {/* 5. الملاحظات */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <FileText size={15} className="text-gray-400" />
                  {t("Note")} ({t("Optional")})
                </span>
              </label>
              <textarea
                name="note"
                rows="3"
                value={formData.note}
                onChange={handleChange}
                placeholder={
                  isArabic
                    ? "اكتب تفاصيل أو ملاحظات حول سبب الهالك..."
                    : "Explain what happened or why this quantity is wasted..."
                }
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none font-medium"
              />
            </div>

            {/* 6. معلومة الاعتماد والخصم */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-start gap-3 p-4 bg-blue-50/80 border border-blue-100 rounded-2xl">
                <Info size={24} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-md font-bold text-blue-900">
                    {isArabic
                      ? "اعتماد وخصم الكمية من المخزن فوراً"
                      : "Automatic Stock Deduction"}
                  </p>
                  <p className="text-sm text-blue-700/90 leading-relaxed font-medium">
                    {isArabic
                      ? "سيتم تسجيل الهالك واعتماده وخصم الكمية تلقائياً من مخزون المستودع عند حفظ السجل."
                      : "The wasted entry will be recorded, approved, and deducted from warehouse stock upon saving."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/wasted")}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              <Send size={16} />
              {isSubmitting
                ? isArabic
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isArabic
                ? "حفظ وتسجيل الهالك"
                : "Submit Wasted"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
