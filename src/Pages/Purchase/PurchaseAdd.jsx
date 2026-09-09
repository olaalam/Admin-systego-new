import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";
import { Trash2, Wallet, Calendar, User, Warehouse, Info, Calculator, X, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import SmartSearch from "@/components/SmartSearch";
import api from "@/api/api";

const PurchaseAdd = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const resolveState = location.state;
  const isFromStocktake = Boolean(resolveState?.fromStocktakeResolve);
  const prefilledRef = useRef(false);

  const { postData, loading } = usePost("/api/admin/purchase");
  const { data: selection } = useGet("api/admin/purchase/selection");
  const [searchProduct, setSearchProduct] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    warehouse_id: resolveState?.warehouseId
      ? (typeof resolveState.warehouseId === "object" ? resolveState.warehouseId._id : resolveState.warehouseId)
      : "",
    supplier_id: "",
    tax_id: "",
    payment_status: "full",
    shipping_cost: 0,
    discount: 0,
    exchange_rate: 1,
    purchase_items: [],
    financials: [{ financial_id: "", payment_amount: 0 }],
    installments: [],
  });
  // معالجة المنتجات للبحث
  const processedProducts = useMemo(() => {
    if (!selection?.products) return [];

    const allItems = [];
    selection.products.forEach(product => {
      // إذا كان المنتج له أسعار مختلفة (variations)
      if (product.different_price && product.prices?.length > 0) {
        product.prices.forEach(variant => {
          // سحب اسم الـ variation واسم الـ option التابع له (مثل: Colors: Red)
          const variantDetails = variant.variations?.map(v => {
            const optionName = v.options?.[0]?.name;
            return optionName ? `${v.name}: ${optionName}` : v.name;
          }).join(" | ") || t("Variation");

          const variantCost = Number(variant.cost || 0);

          allItems.push({
            ...product,
            id: variant._id,
            original_product_id: product._id,
            displayName: `${product.name} - ${variantDetails}`,
            price: variant.price,
            cost: variantCost,
            avg_cost: variantCost,
          });
        });
      } else {
        // منتج عادي بدون تشكيلات
        const prodCost = Number(product.cost || 0);
        allItems.push({
          ...product,
          id: product._id,
          displayName: product.name,
          cost: prodCost,
          avg_cost: prodCost,
        });
      }
    });
    return allItems;
  }, [selection?.products, t]);

  const currencyCode = selection?.currency?.code || "EGP";

  // Auto-fill everything when navigated from Stocktake Discrepancy Resolution
  useEffect(() => {
    if (!isFromStocktake || prefilledRef.current) return;
    if (!selection) return;

    if (selection.products && selection.products.length > 0 && processedProducts.length === 0) {
      return; // wait until processedProducts memo completes
    }

    prefilledRef.current = true;

    // 1. Target Warehouse ID
    const targetWarehouseId = resolveState.warehouseId
      ? (typeof resolveState.warehouseId === "object" ? resolveState.warehouseId._id : resolveState.warehouseId)
      : (selection.warehouse?.[0]?._id || "");

    // 2. Default Supplier ID (auto-select first supplier if available)
    const defaultSupplierId = selection.supplier?.[0]?._id || "";

    // 3. Default Financial Account (auto-select first financial account if available)
    const defaultFinancialId = selection.financial?.[0]?._id || "";

    // 4. Product matching
    let matchedItem = null;
    if (processedProducts.length > 0) {
      if (resolveState.productPriceId) {
        matchedItem = processedProducts.find(
          (p) => String(p.id) === String(resolveState.productPriceId)
        );
      }
      if (!matchedItem && resolveState.productId) {
        matchedItem = processedProducts.find(
          (p) => String(p.original_product_id || p.id) === String(resolveState.productId)
        );
      }
      if (!matchedItem && resolveState.productName) {
        matchedItem = processedProducts.find(
          (p) => p.displayName?.toLowerCase().includes(resolveState.productName?.toLowerCase())
        );
      }
    }

    const qty = Math.max(1, Number(resolveState.quantity) || 1);
    const defaultExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let prefilledItem;
    if (matchedItem) {
      const itemCost = Number(matchedItem.cost ?? matchedItem.avg_cost ?? matchedItem.price ?? 1);
      const safeCost = itemCost > 0 ? itemCost : (Number(matchedItem.price) > 0 ? Number(matchedItem.price) : 1);
      prefilledItem = {
        product_id: matchedItem.original_product_id || matchedItem.id,
        variant_id: matchedItem.original_product_id ? matchedItem.id : null,
        name: matchedItem.displayName,
        quantity: qty,
        unit_cost: safeCost,
        avg_cost: safeCost,
        tax: 0,
        discount: 0,
        exp_ability: matchedItem.exp_ability || false,
        expiry_date: matchedItem.exp_ability ? defaultExpiry : null,
      };
    } else {
      prefilledItem = {
        product_id: resolveState.productId,
        variant_id: resolveState.productPriceId || null,
        name: resolveState.productName || "Product",
        quantity: qty,
        unit_cost: 1,
        avg_cost: 1,
        tax: 0,
        discount: 0,
        exp_ability: false,
        expiry_date: null,
      };
    }

    const estTotal = prefilledItem.quantity * prefilledItem.unit_cost;

    setFormData((prev) => ({
      ...prev,
      warehouse_id: targetWarehouseId || prev.warehouse_id,
      supplier_id: prev.supplier_id || defaultSupplierId,
      purchase_items: [prefilledItem],
      financials: defaultFinancialId
        ? [{ financial_id: defaultFinancialId, payment_amount: estTotal }]
        : (prev.financials.length > 0 ? prev.financials : [{ financial_id: "", payment_amount: 0 }]),
      payment_status: defaultFinancialId ? "full" : "later",
    }));

    toast.info(
      isArabic
        ? `تم تجهيز فاتورة الشراء للمنتج (${prefilledItem.name}) بالكمية (${qty}) تلقائياً`
        : `Pre-filled purchase for product (${prefilledItem.name}) with qty (${qty})`
    );
  }, [isFromStocktake, resolveState, selection, processedProducts, isArabic]);

  useEffect(() => {
    if (formData.payment_status === "full") {
      // في حالة الدفع الكامل: نفرغ الأقساط ونضمن وجود خانة دفع واحدة على الأقل بالقيمة الإجمالية
      setFormData(prev => ({
        ...prev,
        installments: [],
        financials: prev.financials.length > 0
          ? prev.financials.map((f, i) => i === 0 ? { ...f, payment_amount: totals.grandTotal } : f)
          : [{ financial_id: "", payment_amount: totals.grandTotal }]
      }));
    } else if (formData.payment_status === "later") {
      // في حالة الدفع لاحقاً: نفرغ بيانات الخزينة تماماً
      setFormData(prev => ({
        ...prev,
        financials: []
      }));
    } else if (formData.payment_status === "partial") {
      // في حالة الدفع الجزئي: نضمن وجود خانة دفع واحدة فارغة للمستخدم ليبدأ الإدخال
      if (formData.financials.length === 0) {
        setFormData(prev => ({
          ...prev,
          financials: [{ financial_id: "", payment_amount: 0 }]
        }));
      }
    }
  }, [formData.payment_status]); // نعتمد على تغيير حالة الدفع فقط لتجنب الدخول في Infinite Loop مع الـ Grand Total

  const totals = useMemo(() => {
    let itemsTotalBeforeAll = 0;

    const processedItems = formData.purchase_items.map(item => {
      const qty = Number(item.quantity || 0);
      const cost = Number(item.unit_cost || 0);
      const itemDisc = Number(item.discount || 0);
      const itemTax = Number(item.tax || 0);

      const subtotal = (cost - itemDisc + itemTax) * qty;
      itemsTotalBeforeAll += subtotal;

      return { ...item, subtotal, date: formData.date };
    });

    const selectedTax = selection?.tax?.find(tx => tx._id === formData.tax_id);
    const generalTaxAmount = selectedTax ? (itemsTotalBeforeAll * (selectedTax.amount / 100)) : 0;

    const grandTotal = itemsTotalBeforeAll + generalTaxAmount + Number(formData.shipping_cost) - Number(formData.discount);

    const paidAmount = formData.financials.reduce((acc, curr) => acc + Number(curr.payment_amount || 0), 0);
    const remainingToPay = Math.max(0, grandTotal - paidAmount);

    const itemsWithNetCost = processedItems.map(item => {
      const weight = itemsTotalBeforeAll > 0 ? (item.subtotal / itemsTotalBeforeAll) : 0;
      const shareOfGeneralDiscount = Number(formData.discount) * weight;
      const shareOfShipping = Number(formData.shipping_cost) * weight;
      const shareOfGeneralTax = itemsTotalBeforeAll * (selectedTax ? (selectedTax.amount / 100) : 0) * weight;

      const netTotalForItem = item.subtotal - shareOfGeneralDiscount + shareOfShipping + shareOfGeneralTax;
      const netUnitCost = item.quantity > 0 ? (netTotalForItem / item.quantity) : 0;

      return { ...item, netUnitCost };
    });

    return { itemsTotalBeforeAll, generalTaxAmount, grandTotal, itemsWithNetCost, remainingToPay };
  }, [formData, selection]);

  const addFinancialRow = () => {
    setFormData(prev => ({
      ...prev,
      financials: [...prev.financials, { financial_id: "", payment_amount: totals.remainingToPay }]
    }));
  };

  const removeFinancialRow = (index) => {
    const newFins = formData.financials.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      financials: newFins.length > 0 ? newFins : [{ financial_id: "", payment_amount: 0 }]
    });
  };

  const suggestions = useMemo(() => {
    const term = searchProduct?.toLowerCase().trim();
    if (!term) return []; // القائمة تكون فارغة لو مفيش سيرش (وهذا يغلق الـ list)

    return processedProducts.filter(p =>
      p.displayName?.toLowerCase().includes(term) ||
      p.code?.toString().includes(term)
    ).slice(0, 10);
  }, [searchProduct, processedProducts]);

  const handleSelectProduct = (item) => {
    // منع التكرار: نتحقق من الـ variant_id لو كان variation، أو الـ product_id لو كان منتج عادي
    const isDuplicate = formData.purchase_items.some(p =>
      item.original_product_id
        ? p.variant_id === item.id
        : p.product_id === item.id
    );

    if (isDuplicate) {
      setSearchProduct("");
      return toast.warning(t("ProductAlreadyAdded"));
    }

    const itemCost = Number(item.cost || 0);

    setFormData(prev => ({
      ...prev,
      purchase_items: [...prev.purchase_items, {
        product_id: item.original_product_id || item.id, // ID المنتج الأساسي
        variant_id: item.original_product_id ? item.id : null, // ID السعر/النوع (product_price_id)
        name: item.displayName,
        quantity: 1,
        unit_cost: itemCost, // ينادي مباشرة على الكوست من السيلكشن حتى لو 0
        avg_cost: itemCost, // متوسط التكلفة يساوي الكوست مباشرة
        tax: 0,
        discount: 0,
        exp_ability: item.exp_ability || false,
        expiry_date: item.exp_ability ? "" : null
      }]
    }));

    setSearchProduct("");
  };
  const handleSave = async () => { // استخدم handleUpdate في ملف الـ Edit
    const missingExpiry = totals.itemsWithNetCost.find(item => item.exp_ability && !item.expiry_date);
    if (missingExpiry) {
      return toast.error(`${t("Expiry date is required for product")}: ${missingExpiry.name}`);
    }

    // --- بداية خوارزمية التجميع (Grouping) ---
    const groupedItemsMap = {};

    totals.itemsWithNetCost.forEach((item) => {
      const mainId = item.product_id;

      // إذا كان المنتج الأساسي غير موجود في القائمة، ننشئ الهيكل الأساسي له
      if (!groupedItemsMap[mainId]) {
        groupedItemsMap[mainId] = {
          product_id: mainId,
          quantity: 0,
          unit_cost: Number(item.unit_cost), // نأخذ تكلفة أول عنصر كأساس
          tax: 0,
          discount: 0,
          subtotal: 0,
          date: formData.date,
          ...(item.exp_ability && item.expiry_date ? { expiry_date: item.expiry_date } : {}),
          variations: []
        };
      }

      // تجميع الإجماليات للمنتج الأساسي
      groupedItemsMap[mainId].quantity += Number(item.quantity);
      groupedItemsMap[mainId].tax += Number(item.tax);
      groupedItemsMap[mainId].discount += Number(item.discount);
      groupedItemsMap[mainId].subtotal += Number(item.subtotal);

      // إذا كان العنصر لديه نوع (variation)، نضيفه لمصفوفة variations
      if (item.variant_id) {
        groupedItemsMap[mainId].variations.push({
          quantity: Number(item.quantity),
          product_price_id: item.variant_id,
          unit_cost: Number(item.unit_cost),
        });
      }
    });

    // تحويل الكائن إلى مصفوفة نهائية جاهزة للإرسال
    const finalPurchaseItems = Object.values(groupedItemsMap);
    // --- نهاية خوارزمية التجميع ---

    let finalFinancials = formData.financials;
    if (formData.payment_status === "full" && finalFinancials.length > 0) {
      finalFinancials = finalFinancials.map((f, i) =>
        i === 0 ? { ...f, payment_amount: totals.grandTotal } : f
      );
    }

    const payload = {
      ...formData,
      total: totals.itemsTotalBeforeAll,
      grand_total: totals.grandTotal,
      purchase_items: finalPurchaseItems, // استخدام المنتجات المجمعة هنا
      financials: finalFinancials.filter(
        (f) => f.financial_id !== "" && Number(f.payment_amount) > 0
      ),
      installments: [...formData.installments],
    };

    const qDate = document.getElementById('q_date')?.value;
    const qAmt = document.getElementById('q_amt')?.value;
    if (qDate && qAmt) {
      payload.installments.push({ date: qDate, amount: qAmt });
    }

    if (!payload.tax_id) delete payload.tax_id;
    if (!payload.supplier_id) delete payload.supplier_id;

    if (!payload.warehouse_id || payload.purchase_items.length === 0) {
      return toast.error(t("PleaseCompleteRequiredFields"));
    }

    try {
      const response = await postData(payload); // استخدم putData في ملف الـ Edit
      if (response) {
        if (isFromStocktake && resolveState?.stocktakeId && resolveState?.itemId) {
          const purchaseId =
            response?.purchase?._id ||
            response?.data?.purchase?._id ||
            response?._id ||
            response?.data?._id;

          if (purchaseId) {
            try {
              await api.post(`/api/admin/stocktake/${resolveState.stocktakeId}/resolve`, {
                itemId: resolveState.itemId,
                action: "create_purchase",
                referenceId: purchaseId,
              });
              toast.success(
                isArabic
                  ? "تم إنشاء فاتورة الشراء وتسوية صنف الجرد بنجاح"
                  : "Purchase created and stocktake item resolved successfully"
              );
              navigate(`/stocktake/details/${resolveState.stocktakeId}`);
              return;
            } catch (resolveErr) {
              console.error("Resolve error after purchase:", resolveErr);
              toast.warning(
                isArabic
                  ? "تم إنشاء فاتورة الشراء، ولكن تعذر تسوية صنف الجرد تلقائياً"
                  : "Purchase created, but failed to automatically resolve stocktake item"
              );
              navigate(`/stocktake/details/${resolveState.stocktakeId}`);
              return;
            }
          }
        }

        toast.success(t("PurchaseAddedSuccessfully")); // أو Updated Successfully
        navigate("/purchase");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-8 border">

        {/* Banner when coming from stocktake resolve */}
        {isFromStocktake && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs flex-shrink-0">
                <ShoppingCart size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  {isArabic ? "تسوية فائض جرد المخزون عبر الشراء" : "Stocktake Surplus Resolution via Purchase"}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {isArabic
                    ? `تم تعبئة بيانات المنتج والكمية الزائدة (${resolveState?.quantity || 1} قطعة) تلقائياً. اضغط "تأكيد الشراء وتسوية الجرد" لإتمام العملية دون الحاجة لإدخال بيانات يدوياً.`
                    : `Product and surplus quantity (${resolveState?.quantity || 1}) are pre-filled automatically. Click "Confirm Purchase & Resolve" to finish without typing anything.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart size={15} />
                {loading ? (isArabic ? "جاري الإتمام..." : "Processing...") : (isArabic ? "شراء وتسوية فوراً" : "Buy & Resolve Now")}
              </button>
              {resolveState?.stocktakeId && (
                <button
                  type="button"
                  onClick={() => navigate(`/stocktake/details/${resolveState.stocktakeId}`)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline cursor-pointer"
                >
                  {isArabic ? "العودة للجرد" : "Back to Stocktake"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* المورد والمخزن */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2"><Warehouse size={16} /> {t("Warehouse")}</label>
            <select className="w-full border rounded-xl p-3 bg-white" value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}>
              <option value="">{t("Select Warehouse")}</option>
              {selection?.warehouse?.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2"><User size={16} /> {t("Supplier")}</label>
            <select className="w-full border rounded-xl p-3 bg-white" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}>
              <option value="">{t("Select Supplier")}</option>
              {selection?.supplier?.map(s => <option key={s._id} value={s._id}>{s.name || s.username}</option>)}
            </select>
          </div>
        </div>

        {/* البحث عن المنتجات */}
        <div className="relative z-40 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">{t("Search Products")}</label>
          <SmartSearch
            value={searchProduct}
            onChange={(val) => setSearchProduct(val)} // لضمان عمل الـ state
            onSelect={handleSelectProduct}
            data={suggestions} // نمرر له الـ suggestions المفلترة
            keys={["displayName", "code"]}
            placeholder={t("SearchProduct")}
          />
          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border shadow-2xl rounded-xl mt-1 overflow-hidden z-50">
              {suggestions.map((p) => (
                <div
                  key={p.id} // استخدمي p.id لأنه يمثل الـ ID الفريد للـ variation
                  onClick={() => handleSelectProduct(p)}
                  className="p-4 hover:bg-red-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors group"
                >
                  <div className="flex flex-col">
                    {/* عرض الاسم المعالج الذي يحتوي على اسم المنتج + النوع */}
                    <span className="font-bold text-gray-800 group-hover:text-red-700 transition-colors">
                      {p.displayName || p.name}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      {/* عرض الكود إن وجد */}
                      {p.code && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                          #{p.code}
                        </span>
                      )}

                      {/* تنبيه تاريخ الانتهاء */}
                      {p.exp_ability && (
                        <span className="text-[10px] text-orange-500 font-black tracking-tighter uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                          {t("Requires Expiry")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* السعر والعملة */}
                  <div className="text-right">
                    <span className="font-black text-red-600 text-lg">
                      {p.price}
                    </span>
                    <span className="text-red-400 text-xs ml-1 font-bold">
                      {currencyCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* جدول المشتريات */}
        <div className="overflow-x-auto border rounded-2xl mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">{t("Product")}</th>
                <th className="p-4 w-32 text-center text-orange-600">{t("Expiry Date")}</th>
                <th className="p-4 w-20 text-center">{t("Qty")}</th>
                <th className="p-4 w-28 text-center text-indigo-700 bg-indigo-50/50">{t("Average Cost")}</th>
                <th className="p-4 w-28 text-center">{t("Cost")}</th>
                <th className="p-4 w-24 text-orange-600">{t("Disc/Item")}</th>
                <th className="p-4 w-24 text-blue-600">{t("Tax/Item")}</th>
                <th className="p-4 text-red-700 bg-red-50 font-bold">{t("Net Cost")}</th>
                <th className="p-4 text-right">{t("Subtotal")}</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totals.itemsWithNetCost.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold">{item.name}</td>
                  <td className="p-4">
                    {item.exp_ability ? (
                      <input
                        type="date"
                        className="w-full border border-orange-300 rounded p-1.5 text-xs bg-orange-50/30"
                        value={item.expiry_date}
                        onChange={(e) => {
                          const newItems = [...formData.purchase_items];
                          newItems[idx].expiry_date = e.target.value;
                          setFormData({ ...formData, purchase_items: newItems });
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-300">—</div>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      className="w-full border rounded p-1 text-center font-bold"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].quantity = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }}
                    />
                  </td>
                  {/* متوسط التكلفة الاسترشادي */}
                  <td className="p-3 text-center whitespace-nowrap">
                    {Number(item.avg_cost || 0) > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
                        {Number(item.avg_cost).toFixed(2)}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        {isArabic ? "لم يتم الشراء بعد" : "Not purchased yet"}
                      </span>
                    )}
                  </td>
                  {/* سعر الشراء (Cost / Unit Cost) - حقل قابل للتعديل */}
                  <td className="p-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="w-full border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded p-1.5 text-center font-mono font-bold text-gray-800 bg-white"
                      value={item.unit_cost}
                      onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].unit_cost = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }}
                    />
                  </td>
                  <td className="p-4">
                    <input type="number" className="w-full border border-orange-200 rounded p-1 text-center" value={item.discount} onChange={(e) => {
                      const items = [...formData.purchase_items];
                      items[idx].discount = e.target.value;
                      setFormData({ ...formData, purchase_items: items });
                    }} />
                  </td>
                  <td className="p-4">
                    <input type="number" className="w-full border border-blue-200 rounded p-1 text-center" value={item.tax} onChange={(e) => {
                      const items = [...formData.purchase_items];
                      items[idx].tax = e.target.value;
                      setFormData({ ...formData, purchase_items: items });
                    }} />
                  </td>
                  <td className="p-4 text-center font-black text-red-700 bg-red-50/30">
                    {item.netUnitCost.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-gray-700">{item.subtotal.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setFormData({ ...formData, purchase_items: formData.purchase_items.filter((_, i) => i !== idx) })} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* قسم الدفع والإجماليات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
              {['full', 'partial', 'later'].map(m => (
                <button key={m} onClick={() => setFormData({ ...formData, payment_status: m })}
                  className={`flex-1 py-3 rounded-xl font-black transition-all ${formData.payment_status === m ? "bg-white text-red-600 shadow-md" : "text-gray-400"}`}>
                  {t(m.toUpperCase())}
                </button>
              ))}
            </div>

            {formData.payment_status !== 'later' && (
              <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Wallet size={16} className="text-red-600" /> {t("Split Payment Methods")}</label>
                  <button onClick={addFinancialRow} className="bg-red-50 text-red-600 p-1.5 rounded-full hover:bg-red-100 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>

                {formData.financials.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center animate-in slide-in-from-top-1">
                    <select className="flex-1 border rounded-xl p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none" value={f.financial_id} onChange={(e) => {
                      const fins = [...formData.financials];
                      fins[i].financial_id = e.target.value;
                      setFormData({ ...formData, financials: fins });
                    }}>
                      <option value="">{t("Select Account")}</option>
                      {selection?.financial?.map(fin => <option key={fin._id} value={fin._id}>{fin.name}</option>)}
                    </select>
                    <div className="relative">
                      <input type="number" className="w-32 border rounded-xl p-3 font-bold pr-12 text-right focus:ring-2 focus:ring-red-500 outline-none" placeholder="0.00" value={f.payment_amount} onChange={(e) => {
                        const fins = [...formData.financials];
                        fins[i].payment_amount = e.target.value;
                        setFormData({ ...formData, financials: fins });
                      }} />
                      <span className="absolute right-3 top-3.5 text-[10px] text-gray-400 font-bold">{currencyCode}</span>
                    </div>
                    <button onClick={() => removeFinancialRow(i)} className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}

                {totals.remainingToPay > 0 && (
                  <div className="bg-red-50/50 p-2 rounded-lg flex justify-between items-center px-4">
                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{t("Remaining to allocate")}</span>
                    <span className="text-sm font-black text-red-700">{totals.remainingToPay} {currencyCode}</span>
                  </div>
                )}
              </div>
            )}

            {formData.payment_status !== 'full' && (() => {
              const totalInstallments = formData.installments.reduce((acc, item) => acc + Number(item.amount || 0), 0);
              const totalPaidFinancials = formData.financials.reduce((acc, f) => acc + Number(f.payment_amount || 0), 0);
              const remainingAfterInstallments = totals.grandTotal - totalPaidFinancials - totalInstallments;
              return (
                <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-black text-orange-700 flex items-center gap-2"><Calendar size={16} /> {t("Installments Schedule")}</label>
                    {formData.installments.length > 0 && (
                      <div className={`text-xs font-black px-3 py-1 rounded-full ${remainingAfterInstallments > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {remainingAfterInstallments > 0
                          ? `${t("Remaining")}: ${remainingAfterInstallments.toFixed(2)} ${currencyCode}`
                          : `✓ ${t("Fully Covered")}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="date" id="q_date" className="flex-1 border border-orange-200 rounded-xl p-2.5 text-sm" />
                    <input type="number" id="q_amt" className="w-32 border border-orange-200 rounded-xl p-2.5 text-sm" placeholder="Amount" />
                    <button onClick={() => {
                      const d = document.getElementById('q_date').value;
                      const a = document.getElementById('q_amt').value;
                      if (d && a) {
                        setFormData(prev => ({ ...prev, installments: [...prev.installments, { date: d, amount: a }] }));
                        document.getElementById('q_date').value = "";
                        document.getElementById('q_amt').value = "";
                      }
                    }} className="bg-orange-500 text-white px-4 rounded-xl font-bold hover:bg-orange-600 transition-colors">+</button>
                  </div>

                  {/* شريط تقدم السداد */}
                  {totals.grandTotal > 0 && formData.installments.length > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, ((totalPaidFinancials + totalInstallments) / totals.grandTotal) * 100)}%`,
                            background: remainingAfterInstallments <= 0 ? '#22c55e' : '#f97316'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-orange-500 font-bold">
                        <span>{t("Scheduled")}: {(totalPaidFinancials + totalInstallments).toFixed(2)}</span>
                        <span>{Math.min(100, ((totalPaidFinancials + totalInstallments) / totals.grandTotal * 100)).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {formData.installments.map((item, i) => {
                      const runningTotal = formData.installments.slice(0, i + 1).reduce((acc, it) => acc + Number(it.amount || 0), 0);
                      const runningRemaining = totals.grandTotal - totalPaidFinancials - runningTotal;
                      return (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm text-xs border border-orange-100">
                          <span className="font-medium text-gray-500">{item.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-orange-600">{Number(item.amount).toFixed(2)} {currencyCode}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${runningRemaining > 0 ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-500'}`}>
                              {runningRemaining > 0 ? `${t("Left")}: ${runningRemaining.toFixed(2)}` : `✓`}
                            </span>
                          </div>
                          <button onClick={() => setFormData({ ...formData, installments: formData.installments.filter((_, idx) => idx !== i) })} className="text-red-300 hover:text-red-500">×</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400 text-sm">{t("Items Total")}</span>
                <span className="font-mono text-lg">{totals.itemsTotalBeforeAll}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{t("General Tax")}</span>
                  <Info size={14} className="text-gray-600" />
                </div>
                <select className="bg-gray-800 text-xs border-none rounded-lg p-2 outline-none" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}>
                  <option value="">{t("No General Tax")}</option>
                  {selection?.tax?.map(tx => <option key={tx._id} value={tx._id}>{tx.name} ({tx.amount}%)</option>)}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t("Shipping Cost")}</span>
                <input type="number" className="w-24 bg-gray-800 border-none rounded-lg p-2 text-right font-bold" value={formData.shipping_cost} onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t("General Discount")}</span>
                <input type="number" className="w-24 bg-gray-800 border-none rounded-lg p-2 text-right font-bold text-orange-400" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-800 flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("Payable Amount")}</p>
                <span className="text-gray-400 font-bold">{t("Grand Total")}</span>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-red-400 font-mono tracking-tighter">
                  {totals.grandTotal}
                </span>
                <span className="text-red-700 ml-2 font-bold">{currencyCode}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full mt-12 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-red-100/50 flex items-center justify-center gap-3">
          {loading ? (
            t("Processing...")
          ) : (
            <>
              {isFromStocktake ? <ShoppingCart size={24} /> : <Calculator size={24} />}
              {isFromStocktake
                ? (isArabic ? "تأكيد الشراء وتسوية الجرد" : "Confirm Purchase & Resolve Stocktake")
                : t("Confirm & Save Purchase")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default PurchaseAdd;