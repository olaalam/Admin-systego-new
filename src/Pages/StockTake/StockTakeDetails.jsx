// src/Pages/StockTake/StockTakeDetails.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Download,
  Upload,
  Send,
  ArrowLeft,
  Package,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  ShoppingCart,
  RefreshCw,
  Trash2,
  Info,
  Wallet,
  CreditCard,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/api";
import DeleteDialog from "@/components/DeleteForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StockTakeDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  // استخراج refetchStocktake لكي نستخدمه في التحديث
  const { data: stocktakeData, loading: loadingStocktake, error, refetch: refetchStocktake } = useGet(
    `/api/admin/stocktake/${id}`
  );

  const { data: itemsData, loading: loadingItems, refetch: refetchItems } = useGet(
    `/api/admin/stocktake/${id}/items?page=1&limit=500`
  );

  const { data: purchaseSelection } = useGet("api/admin/purchase/selection");

  const { putData, loading: saving } = usePut();
  const { postData, loading: submitting } = usePost();

  const [items, setItems] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [treatUnfilledAsSkipped, setTreatUnfilledAsSkipped] = useState(true);

  // حالة التسوية (Resolution)
  const [selectedResolveItem, setSelectedResolveItem] = useState(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolving, setResolving] = useState(false);

  // بيانات الشراء المباشر داخل البوب اب (Purchase in popup - Full Flow)
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseUnitCost, setPurchaseUnitCost] = useState(0);
  const [purchaseAvgCost, setPurchaseAvgCost] = useState(0);
  const [purchaseItemDiscount, setPurchaseItemDiscount] = useState(0);
  const [purchaseItemTax, setPurchaseItemTax] = useState(0);
  const [purchaseExpiryDate, setPurchaseExpiryDate] = useState("");
  const [purchaseSupplierId, setPurchaseSupplierId] = useState("");
  const [purchaseTaxId, setPurchaseTaxId] = useState("");
  const [purchaseShippingCost, setPurchaseShippingCost] = useState(0);
  const [purchaseGeneralDiscount, setPurchaseGeneralDiscount] = useState(0);
  const [purchasePaymentStatus, setPurchasePaymentStatus] = useState("full");
  const [purchaseFinancialId, setPurchaseFinancialId] = useState("");
  const [purchasePaidAmount, setPurchasePaidAmount] = useState(0);

  const stocktake = stocktakeData?.stocktake || stocktakeData || {};
  const products = itemsData?.items || itemsData?.data || [];
  const currencyCode = stocktake.currency?.code || purchaseSelection?.currency?.code || "EGP";

  const loading = loadingStocktake || loadingItems;

  // الحسابات التفاعلية لفاتورة الشراء
  const purchaseTotals = useMemo(() => {
    const qty = Number(purchaseQty) || 0;
    const unitCost = Number(purchaseUnitCost) || 0;
    const itemDisc = Number(purchaseItemDiscount) || 0;
    const itemTx = Number(purchaseItemTax) || 0;

    const itemsSubtotal = Math.max(0, (unitCost - itemDisc + itemTx) * qty);

    const selectedTax = purchaseSelection?.tax?.find((tx) => tx._id === purchaseTaxId);
    const generalTaxAmount = selectedTax ? itemsSubtotal * (Number(selectedTax.amount) / 100) : 0;

    const grandTotal = Math.max(
      0,
      itemsSubtotal +
        generalTaxAmount +
        Number(purchaseShippingCost || 0) -
        Number(purchaseGeneralDiscount || 0)
    );

    const remainingToPay = Math.max(0, grandTotal - Number(purchasePaidAmount || 0));

    return {
      itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
      generalTaxAmount: Number(generalTaxAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      remainingToPay: Number(remainingToPay.toFixed(2)),
      selectedTax,
    };
  }, [
    purchaseQty,
    purchaseUnitCost,
    purchaseItemDiscount,
    purchaseItemTax,
    purchaseTaxId,
    purchaseShippingCost,
    purchaseGeneralDiscount,
    purchasePaidAmount,
    purchaseSelection,
  ]);

  // مزامنة المبلغ المدفوع تلقائياً مع الإجمالي عند اختيار الدفع الكامل
  useEffect(() => {
    if (purchasePaymentStatus === "full") {
      setPurchasePaidAmount(purchaseTotals.grandTotal);
    }
  }, [purchasePaymentStatus, purchaseTotals.grandTotal]);

  // Initialize items from API data with dirty tracking and resolution fields
  useEffect(() => {
    if (products.length > 0) {
      setItems(
        products.map((p) => {
          const initialActual = p.actualQty ?? p.actual_qty ?? "";
          return {
            itemId: p._id,
            productId: p.productId?._id || p.productId,
            productPriceId: p.productPriceId?._id || p.productPriceId || null,
            warehouseId: p.warehouseId?._id || p.warehouseId || stocktake.warehouseId?._id || stocktake.warehouseId,
            name: p.productNameSnapshot || p.product?.name || p.productId?.name || p.name || "-",
            systemQty: p.systemQty ?? p.system_qty ?? p.quantity ?? 0,
            actualQty: initialActual,
            originalActualQty: initialActual,
            difference: p.difference !== null && p.difference !== undefined
              ? p.difference
              : (initialActual !== "" ? Number(initialActual) - (p.systemQty ?? 0) : null),
            resolutionType: p.resolutionType || null,
            resolutionStatus: p.resolutionStatus || "pending",
            resolutionAction: p.resolutionAction || null,
            isDirty: false,
            status: p.status || "-",
            cost: p.productPriceId?.cost ?? p.productId?.cost ?? p.cost ?? 0,
            price: p.productPriceId?.price ?? p.productId?.price ?? p.price ?? 0,
            avg_cost: p.productPriceId?.avg_cost ?? p.productId?.avg_cost ?? p.avg_cost ?? p.productPriceId?.cost ?? p.productId?.cost ?? p.cost ?? 0,
            exp_ability: p.productId?.exp_ability ?? false,
          };
        })
      );
    }
  }, [products, stocktake]);

  // مزامنة حقول الشراء عند فتح نافذة التسوية لصنف به فائض
  useEffect(() => {
    if (selectedResolveItem) {
      const diff = Math.abs(selectedResolveItem.difference || 1);
      setPurchaseQty(diff);
      setResolveNote("");

      let itemCost = Number(selectedResolveItem.cost || 0);
      let itemAvgCost = Number(selectedResolveItem.avg_cost || selectedResolveItem.cost || 0);

      if (purchaseSelection?.products) {
        const targetProdId = typeof selectedResolveItem.productId === "object"
          ? selectedResolveItem.productId._id
          : selectedResolveItem.productId;

        const found = purchaseSelection.products.find(
          (p) => String(p._id) === String(targetProdId)
        );
        if (found) {
          if (selectedResolveItem.productPriceId && found.prices) {
            const targetPriceId = typeof selectedResolveItem.productPriceId === "object"
              ? selectedResolveItem.productPriceId._id
              : selectedResolveItem.productPriceId;
            const variant = found.prices.find(
              (v) => String(v._id) === String(targetPriceId)
            );
            if (variant) {
              itemCost = Number(variant.cost || variant.price || 0);
              itemAvgCost = Number(variant.avg_cost ?? variant.cost ?? 0);
            }
          } else {
            itemCost = Number(found.cost || found.price || 0);
            itemAvgCost = Number(found.avg_cost ?? found.cost ?? 0);
          }
        }
      }

      setPurchaseUnitCost(itemCost);
      setPurchaseAvgCost(itemAvgCost);
      setPurchaseItemDiscount(0);
      setPurchaseItemTax(0);
      setPurchaseShippingCost(0);
      setPurchaseGeneralDiscount(0);
      setPurchaseTaxId("");
      setPurchaseExpiryDate(
        selectedResolveItem.exp_ability
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : ""
      );

      const defaultSupplier = purchaseSelection?.supplier?.[0]?._id || "";
      setPurchaseSupplierId(defaultSupplier);

      const defaultFinancial = purchaseSelection?.financial?.[0]?._id || "";
      setPurchaseFinancialId(defaultFinancial);
      setPurchasePaymentStatus(defaultFinancial ? "full" : "later");
    }
  }, [selectedResolveItem, purchaseSelection]);

  const handleActualQtyChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              actualQty: value,
              isDirty: String(value) !== String(item.originalActualQty ?? ""),
            }
          : item
      )
    );
  };

  const handleSubmit = () => {
    // السماح بالـ submit المباشر دون إجبار المستخدم على تعبئة كل الأصناف
    setShowConfirmDialog(true);
  };

  const handleSaveProgress = async () => {
    try {
      // إرسال الأصناف التي تم تعديلها فقط في الـ payload
      const changedItems = items.filter(
        (item) => item.isDirty && item.actualQty !== "" && item.actualQty !== null
      );

      if (changedItems.length === 0) {
        toast.info(
          isRTL ? "لا توجد تعديلات جديدة لحفظها" : "No changes to save"
        );
        return;
      }

      const payload = {
        items: changedItems.map((item) => ({
          itemId: item.itemId,
          actualQty: Number(item.actualQty),
        })),
      };

      const response = await putData(payload, `/api/admin/stocktake/${id}/items`);
      if (response) {
        toast.success(t("Progress saved successfully"));
        setItems((prev) =>
          prev.map((item) => {
            const wasChanged = changedItems.some((c) => c.itemId === item.itemId);
            return wasChanged
              ? { ...item, originalActualQty: item.actualQty, isDirty: false }
              : item;
          })
        );
        refetchItems();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      // إذا قام المستخدم بتعديل أي كميات ولم يضغط "حفظ" أولاً، يتم حفظها تلقائياً قبل الـ submit
      const unsavedItems = items.filter(
        (item) => item.isDirty && item.actualQty !== "" && item.actualQty !== null
      );

      if (unsavedItems.length > 0) {
        const savePayload = {
          items: unsavedItems.map((item) => ({
            itemId: item.itemId,
            actualQty: Number(item.actualQty),
          })),
        };
        await api.put(`/api/admin/stocktake/${id}/items`, savePayload);
      }

      // إرسال الـ submit مع تخطي الأصناف غير المعدودة تلقائياً
      const payload = {
        treatUnfilledAsSkipped: treatUnfilledAsSkipped,
        ...(unsavedItems.length > 0
          ? {
              items: unsavedItems.map((item) => ({
                itemId: item.itemId,
                actualQty: Number(item.actualQty),
              })),
            }
          : {}),
      };

      const response = await postData(payload, `/api/admin/stocktake/${id}/submit`);
      if (response) {
        toast.success(t("Stock take submitted successfully"));
        navigate("/stocktake");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.response?.data?.message || t("Submit failed"));
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      // إذا كانت الحالة completed (سواء كان manual أو excel):
      // نرسل includeSystemQty = true, includeDifference = true
      // إذا لم يكن completed وكان excel:
      // نرسل includeSystemQty = false
      let queryParams = "";
      if (stocktake.status === "completed") {
        queryParams = "includeSystemQty=true&includeDifference=true";
      } else if (stocktake.mode === "excel") {
        queryParams = "includeSystemQty=false";
      } else {
        queryParams = "includeSystemQty=true";
      }

      const response = await api.get(
        `/api/admin/stocktake/${id}/export?${queryParams}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `stocktake_${stocktake.code || stocktake.reference || id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(isRTL ? "تم تصدير ملف الإكسيل بنجاح" : "File exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.response?.data?.message || t("Export failed"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleCancelStocktake = async () => {
    try {
      setCancelling(true);
      try {
        await api.post(`/api/admin/stocktake/${id}/cancel`);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          await api.patch(`/api/admin/stocktake/${id}/cancel`);
        } else {
          throw err;
        }
      }
      toast.success(isRTL ? "تم إلغاء عملية الجرد بنجاح" : "Stock take cancelled successfully");
      setShowCancelDialog(false);
      refetchStocktake();
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to cancel stock take")
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleResolveAction = async (item, action, note = "") => {
    try {
      setResolving(true);
      const payload = {
        itemId: item.itemId,
        action,
        ...(note ? { note } : {}),
      };

      const res = await api.post(`/api/admin/stocktake/${id}/resolve`, payload);
      if (res.data?.success) {
        toast.success(
          isRTL
            ? (action === "send_to_wasted" ? "تم تسجيل الهالك وتسوية الصنف بنجاح" : "تمت تسوية الصنف بنجاح")
            : "Item resolved successfully"
        );
        setSelectedResolveItem(null);
        setResolveNote("");
        refetchItems();
        refetchStocktake();
      } else {
        toast.error(res.data?.message || t("Resolution failed"));
      }
    } catch (err) {
      console.error("Resolve error:", err);
      toast.error(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Resolution failed")
      );
    } finally {
      setResolving(false);
    }
  };

  const handleDirectPurchaseResolve = async (item) => {
    try {
      setResolving(true);
      const qty = Number(purchaseQty) || Math.abs(item.difference);
      const unitCost = Number(purchaseUnitCost);

      if (isNaN(unitCost) || unitCost < 0) {
        toast.error(isRTL ? "يرجى إدخال سعر تكلفة صحيح" : "Please enter a valid unit cost");
        setResolving(false);
        return;
      }

      const defaultDate = new Date().toISOString().split("T")[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const defaultDueDate = dueDate.toISOString().split("T")[0];

      const rawWarehouse = item.warehouseId || stocktake.warehouseId;
      const targetWarehouseId = typeof rawWarehouse === "object" ? rawWarehouse?._id : rawWarehouse;

      const targetProductId = typeof item.productId === "object" ? item.productId?._id : item.productId;
      const targetPriceId = typeof item.productPriceId === "object" ? item.productPriceId?._id : item.productPriceId;

      const itemDisc = Number(purchaseItemDiscount) || 0;
      const itemTx = Number(purchaseItemTax) || 0;
      const itemSubtotal = Number((Math.max(0, (unitCost - itemDisc + itemTx) * qty)).toFixed(2));

      const selectedTax = purchaseSelection?.tax?.find((tx) => tx._id === purchaseTaxId);
      const generalTaxAmount = selectedTax ? Number((itemSubtotal * (Number(selectedTax.amount) / 100)).toFixed(2)) : 0;

      const shipping = Number(purchaseShippingCost) || 0;
      const generalDisc = Number(purchaseGeneralDiscount) || 0;
      const grandTotal = Number((Math.max(0, itemSubtotal + generalTaxAmount + shipping - generalDisc)).toFixed(2));

      let finalFinancials = [];
      let duePayments = [];

      if (purchasePaymentStatus === "full") {
        let effFinId = purchaseFinancialId;
        if (!effFinId && purchaseSelection?.financial?.length > 0) {
          effFinId = purchaseSelection.financial[0]._id;
        }
        if (!effFinId) {
          toast.error(isRTL ? "يرجى اختيار الخزينة / الحساب المالي للدفع" : "Please select a financial account");
          setResolving(false);
          return;
        }
        finalFinancials = [{
          financial_id: effFinId,
          payment_amount: grandTotal,
        }];
      } else if (purchasePaymentStatus === "partial") {
        let effFinId = purchaseFinancialId;
        if (!effFinId && purchaseSelection?.financial?.length > 0) {
          effFinId = purchaseSelection.financial[0]._id;
        }
        if (!effFinId) {
          toast.error(isRTL ? "يرجى اختيار الخزينة / الحساب المالي للدفع الجزئي" : "Please select a financial account for partial payment");
          setResolving(false);
          return;
        }
        const paid = Number(purchasePaidAmount) || 0;
        if (paid <= 0) {
          toast.error(isRTL ? "يرجى إدخال المبلغ المدفوع حالياً" : "Please enter the amount paid now");
          setResolving(false);
          return;
        }
        if (paid >= grandTotal) {
          toast.error(
            isRTL
              ? "المبلغ المدفوع جزئياً يجب أن يكون أقل من الإجمالي (اختر الدفع الكامل بدلاً من ذلك)"
              : "Partial payment must be less than grand total (use Full payment instead)"
          );
          setResolving(false);
          return;
        }
        finalFinancials = [{
          financial_id: effFinId,
          payment_amount: Number(paid.toFixed(2)),
        }];
        const remaining = Number((grandTotal - paid).toFixed(2));
        duePayments = [{
          amount: remaining,
          date: defaultDueDate,
        }];
      } else if (purchasePaymentStatus === "later") {
        finalFinancials = [];
        duePayments = [{
          amount: grandTotal,
          date: defaultDueDate,
        }];
      }

      const purchaseItem = {
        date: defaultDate,
        product_id: targetProductId,
        quantity: qty,
        unit_cost: unitCost,
        discount: itemDisc,
        tax: itemTx,
        subtotal: itemSubtotal,
        ...(targetPriceId ? {
          variations: [
            {
              product_price_id: targetPriceId,
              quantity: qty,
              unit_cost: unitCost,
            }
          ]
        } : {}),
        ...(item.exp_ability && purchaseExpiryDate ? {
          expiry_date: purchaseExpiryDate,
        } : {})
      };

      const purchasePayload = {
        date: defaultDate,
        warehouse_id: targetWarehouseId,
        payment_status: purchasePaymentStatus,
        exchange_rate: 1,
        total: itemSubtotal,
        grand_total: grandTotal,
        discount: generalDisc,
        shipping_cost: shipping,
        purchase_items: [purchaseItem],
        ...(purchaseSupplierId ? { supplier_id: purchaseSupplierId } : {}),
        ...(purchaseTaxId ? { tax_id: purchaseTaxId } : {}),
        financials: finalFinancials,
        ...(duePayments.length > 0 ? { purchase_due_payment: duePayments } : {}),
        note: `Stocktake surplus resolution - ${stocktake.code || stocktake.reference || id}`,
      };

      // 1. Create Purchase
      const purchaseRes = await api.post("/api/admin/purchase", purchasePayload);
      const newPurchaseId =
        purchaseRes.data?.purchase?._id ||
        purchaseRes.data?.data?.purchase?._id ||
        purchaseRes.data?._id ||
        purchaseRes.data?.data?._id;

      if (!newPurchaseId) {
        throw new Error(purchaseRes.data?.message || "Failed to retrieve new purchase ID");
      }

      // 2. Resolve Stocktake Item with create_purchase and referenceId
      const resolveRes = await api.post(`/api/admin/stocktake/${id}/resolve`, {
        itemId: item.itemId,
        action: "create_purchase",
        referenceId: newPurchaseId,
      });

      if (resolveRes.data?.success) {
        toast.success(
          isRTL
            ? `تم إنشاء فاتورة الشراء وتسوية الصنف (${item.name}) بنجاح`
            : `Purchase created and item (${item.name}) resolved successfully`
        );
        setSelectedResolveItem(null);
        refetchItems();
        if (refetchStocktake) refetchStocktake();
      } else {
        toast.error(resolveRes.data?.message || t("Resolution failed"));
      }
    } catch (err) {
      console.error("Direct purchase resolve error:", err);
      toast.error(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        t("Purchase resolution failed")
      );
    } finally {
      setResolving(false);
    }
  };

  const handleNavigateToPurchase = (item) => {
    navigate("/purchase/add", {
      state: {
        fromStocktakeResolve: true,
        stocktakeId: id,
        itemId: item.itemId,
        warehouseId: item.warehouseId || stocktake.warehouseId?._id || stocktake.warehouseId,
        productId: item.productId,
        productPriceId: item.productPriceId,
        productName: item.name,
        quantity: Math.abs(item.difference),
      },
    });
  };

  const handleImport = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImportLoading(true);
      const response = await api.post(
        `/api/admin/stocktake/${id}/import`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success) {
        toast.success(t("File imported successfully"));
        refetchStocktake();
        refetchItems();
      } else {
        toast.error(response.data?.message || t("Import failed"));
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error(
        err.response?.data?.message || t("Import failed")
      );
    } finally {
      setImportLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      matched: { bg: "bg-green-100 text-green-800", label: t("Matched") },
      mismatch: { bg: "bg-red-100 text-red-800", label: t("Mismatch") },
      pending: { bg: "bg-yellow-100 text-yellow-800", label: t("Pending") },
      counted: { bg: "bg-blue-100 text-blue-800", label: t("Counted") },
    };
    const config = statusConfig[status] || {
      bg: "bg-gray-100 text-gray-800",
      label: status || "-",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {t("Error loading stock take")}: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full bg-white rounded-2xl shadow-sm p-8 border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/stocktake")}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="bg-red-100 p-3 rounded-xl">
              <ClipboardList className="text-red-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">
                {t("Stock Take Details")}
              </h1>
              {stocktake.reference && (
                <p className="text-sm text-gray-500">
                  {t("Reference")}: {stocktake.reference}
                </p>
              )}
            </div>
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
              {stocktake.type === "full" ? t("Full") : t("Partial")}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
              {stocktake.mode === "manual" ? t("Manual") : t("Excel")}
            </span>
            {stocktake.warehouseId?.name && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {stocktake.warehouseId.name}
              </span>
            )}
            {stocktake.status && (
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  stocktake.status === "completed"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : stocktake.status === "cancelled"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {t(stocktake.status.charAt(0).toUpperCase() + stocktake.status.slice(1))}
              </span>
            )}
            {stocktake.status === "processing" && (
              <button
                type="button"
                onClick={() => setShowCancelDialog(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all cursor-pointer shadow-xs"
              >
                {isRTL ? "إلغاء الجرد" : "Cancel Stock Take"}
              </button>
            )}
          </div>
        </div>

        {/* Actions & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Export Excel Button:
                - In manual mode: hidden before submit (only shown when completed)
                - In excel mode: shown before submit (as template) and after submit (as completed report)
            */}
            {(stocktake.mode === "excel" || stocktake.status === "completed") && (
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Download size={18} />
                <span>
                  {exportLoading
                    ? (isRTL ? "جاري التصدير..." : "Exporting...")
                    : stocktake.status === "completed"
                    ? (isRTL ? "تصدير تقرير الجرد (إكسيل)" : "Export Stocktake Report")
                    : (isRTL ? "تحميل نموذج الإكسيل" : "Export Excel Template")}
                </span>
              </button>
            )}

            {/* Import Excel Button (For excel mode when processing) */}
            {stocktake.mode === "excel" && stocktake.status === "processing" && (
              <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-all shadow-sm">
                <Upload size={18} />
                <span>
                  {importLoading
                    ? (isRTL ? "جاري الاستيراد..." : "Importing...")
                    : (isRTL ? "استيراد إكسيل" : "Import Excel")}
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImport(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {stocktake.mode === "manual"
              ? (isRTL ? "جرد يدوي - إدخال الكميات مباشرة أو تصدير التقرير" : "Manual Count - Enter quantities directly or export report")
              : (isRTL ? "جرد إكسيل - تحميل القالب ثم رفع الملف المكتمل" : "Excel Count - Download template and upload filled sheet")}
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package size={20} className="text-gray-600" />
            {t("Products")} ({items.length})
          </h3>

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 text-left font-bold">#</th>
                  <th className={`p-4 ${isRTL ? "text-right" : "text-left"} font-bold`}>
                    {t("Product Name")}
                  </th>
                  <th className="p-4 text-center font-bold">
                    {t("System Qty")}
                  </th>
                  <th className="p-4 text-center font-bold">
                    {t("Actual Qty")}
                  </th>
                  <th className="p-4 text-center font-bold">{t("Difference")}</th>
                  {stocktake.status === "completed" && (
                    <th className="p-4 text-center font-bold">{isRTL ? "التسوية" : "Resolution"}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const difference =
                      item.difference !== null && item.difference !== undefined
                        ? item.difference
                        : (item.actualQty !== "" && item.actualQty !== null
                            ? Number(item.actualQty) - item.systemQty
                            : null);

                    const isResolved = item.resolutionStatus === "resolved";

                    return (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="p-4 text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-gray-700">
                          {item.name}
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">
                            {stocktake.status === "processing" ? "?" : item.systemQty}
                          </span>
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            min="0"
                            disabled={stocktake.status !== "processing"}
                            className="w-full border rounded-xl p-2 text-center font-bold focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            value={item.actualQty}
                            onChange={(e) =>
                              handleActualQtyChange(index, e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                            stocktake.status === "processing"
                              ? "bg-gray-100 text-gray-400"
                              : difference > 0
                              ? "bg-green-50 text-green-700"
                              : difference < 0
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-700"
                          }`}>
                            {stocktake.status === "processing"
                              ? "—"
                              : (difference !== null ? (difference > 0 ? `+${difference}` : difference) : "-")}
                          </span>
                        </td>

                        {/* خانة الـ Resolve */}
                        {stocktake.status === "completed" && (
                          <td className="p-4 text-center">
                            {isResolved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-xs">
                                <CheckCircle2 size={13} className="text-green-600" />
                                <span>
                                  {item.resolutionAction === "send_to_wasted"
                                    ? (isRTL ? "تم كـ هالك" : "Wasted")
                                    : item.resolutionAction === "adjust_stock"
                                    ? (isRTL ? "تم تعديل المخزون" : "Stock Adjusted")
                                    : item.resolutionAction === "create_purchase"
                                    ? (isRTL ? "تم الشراء" : "Purchased")
                                    : (isRTL ? "تمت التسوية" : "Resolved")}
                                </span>
                              </span>
                            ) : difference === 0 || difference === null ? (
                              <span className="text-xs font-semibold text-gray-400">
                                —
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedResolveItem({ ...item, difference })}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer ${
                                  difference > 0
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-amber-500 hover:bg-amber-600 text-white"
                                }`}
                                title={
                                  difference > 0
                                    ? (isRTL ? "تسوية الفائض (شراء)" : "Resolve Surplus (Purchase)")
                                    : (isRTL ? "تسوية العجز" : "Resolve Discrepancy")
                                }
                              >
                                {difference > 0 ? <ShoppingCart size={13} /> : <Wrench size={13} />}
                                <span>{isRTL ? "تسوية" : "Resolve"}</span>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={stocktake.status === "completed" ? 6 : 5} className="p-8 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={40} className="text-gray-300" />
                        <p>{t("No products found")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        {stocktake.status === "processing" && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleSaveProgress}
              disabled={saving || items.length === 0}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? t("Saving...") : t("Save Progress")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-3"
            >
              {submitting ? (
                t("Submitting...")
              ) : (
                <>
                  <Send size={20} />
                  {t("Submit Stock Take")}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertTriangle className="text-yellow-600" size={24} />
              </div>
              <DialogTitle className="text-lg font-bold">
                {t("Confirm Submission")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              {t(
                "Are you sure you want to submit this stock take? This action will update the inventory records."
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Summary in Dialog */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("Total Products")}:</span>
              <strong>{items.length}</strong>
            </div>
            {stocktake.mode === "manual" && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t("Counted")}:</span>
                <strong>
                  {
                    items.filter(
                      (i) =>
                        i.actualQty !== "" &&
                        i.actualQty !== null &&
                        i.actualQty !== undefined
                    ).length
                  }
                </strong>
              </div>
            )}
          </div>

          {/* Treat Unfilled As Skipped Checkbox */}
          <label className="flex items-center gap-3 mt-4 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              checked={treatUnfilledAsSkipped}
              onChange={(e) => setTreatUnfilledAsSkipped(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              {t("Treat unfilled quantities as skipped (0)")}
            </span>
          </label>


          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-colors"
            >
              {submitting ? t("Submitting...") : t("Yes, Submit")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Stock Take Dialog */}
      {showCancelDialog && (
        <DeleteDialog
          title={isRTL ? "إلغاء عملية الجرد" : "Cancel Stock Take"}
          message={
            isRTL
              ? "هل أنت متأكد من رغبتك في إلغاء عملية الجرد هذه؟ لن تتمكن من تعديلها أو إرسالها بعد الإلغاء."
              : "Are you sure you want to cancel this stock take? You will not be able to edit or submit it after cancellation."
          }
          onConfirm={handleCancelStocktake}
          onCancel={() => setShowCancelDialog(false)}
          confirmText={cancelling ? (isRTL ? "جاري الإلغاء..." : "Cancelling...") : (isRTL ? "إلغاء الجرد" : "Cancel Stock Take")}
          cancelText={isRTL ? "تراجع" : "Go Back"}
        />
      )}

      {/* Resolve Item Dialog */}
      {selectedResolveItem && (
        <Dialog open={!!selectedResolveItem} onOpenChange={(open) => !open && setSelectedResolveItem(null)}>
          <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[100dvh] overflow-y-auto flex flex-col p-6">
            <DialogHeader>
              <div className="flex items-center gap-2.5 mb-1">
                <div className={`p-2 rounded-xl ${selectedResolveItem.difference > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  <Wrench size={22} />
                </div>
                <DialogTitle className="text-xl font-bold">
                  {isRTL ? "تسوية فرق الجرد" : "Resolve Stocktake Discrepancy"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-gray-500">
                {selectedResolveItem.name}
              </DialogDescription>
            </DialogHeader>

            {/* تفاصيل الصنف والفرق */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-sm my-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{isRTL ? "اسم المنتج:" : "Product:"}</span>
                <span className="font-bold text-gray-800 text-left">{selectedResolveItem.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{isRTL ? "الكمية في السيستم:" : "System Qty:"}</span>
                <span className="font-bold text-gray-700">{selectedResolveItem.systemQty}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{isRTL ? "الكمية الفعلية المحصورة:" : "Actual Qty:"}</span>
                <span className="font-bold text-gray-700">{selectedResolveItem.actualQty}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-gray-700 font-bold">{isRTL ? "قيمة الفرق:" : "Difference:"}</span>
                <span className={`px-2.5 py-0.5 rounded-lg font-black text-sm ${
                  selectedResolveItem.difference > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedResolveItem.difference > 0
                    ? `+${selectedResolveItem.difference} (${isRTL ? "فائض" : "Surplus"})`
                    : `${selectedResolveItem.difference} (${isRTL ? "عجز" : "Shortage"})`}
                </span>
              </div>
            </div>

            {/* الحالة 1: فائض (+) Surplus */}
            {selectedResolveItem.difference > 0 && (
              <div className="space-y-4 mt-2">
                <p className="text-xs text-gray-600 font-medium">
                  {isRTL
                    ? "يوجد فائض في المخزون. يمكنك إنشاء فاتورة شراء كاملة ومطابقة للفاتورة العادية لتسوية الفائض أو تعديل رصيد المخزون مباشرة:"
                    : "There is surplus stock. You can create a complete purchase invoice or adjust stock directly:"}
                </p>

                <div className="space-y-4">
                  {/* خيار 1: فاتورة شراء متكاملة Purchase في البوب اب */}
                  <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                          <ShoppingCart size={20} />
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <h4 className="font-bold text-base text-emerald-950">
                            {isRTL ? "فاتورة شراء لتسوية الفائض (Purchase Invoice)" : "Purchase Invoice for Surplus"}
                          </h4>
                          <p className="text-xs text-emerald-700">
                            {isRTL
                              ? `شراء ${selectedResolveItem.difference} قطعة وإضافتها للمخزون وتسوية الصنف`
                              : `Purchase ${selectedResolveItem.difference} units and resolve item`}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                        +{selectedResolveItem.difference} {isRTL ? "قطعة فائض" : "surplus"}
                      </span>
                    </div>

                    {/* كارت بيانات الصنف وأسعار الشراء والتكلفة */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                        <div>
                          <span className="text-xs text-gray-500 font-medium block">
                            {isRTL ? "المنتج:" : "Product:"}
                          </span>
                          <span className="font-bold text-sm text-gray-900">{selectedResolveItem.name}</span>
                        </div>

                        {/* متوسط التكلفة الاسترشادي Reference Avg Cost */}
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl">
                          <Info size={16} className="text-indigo-600 flex-shrink-0" />
                          <div>
                            <span className="text-[11px] text-indigo-700 font-semibold block">
                              {isRTL ? "متوسط التكلفة الاسترشادي:" : "Average Cost (Ref):"}
                            </span>
                            <span className="font-mono font-bold text-xs text-indigo-900">
                              {Number(purchaseAvgCost || 0) > 0 ? `${Number(purchaseAvgCost).toFixed(2)} ${currencyCode}` : (isRTL ? "لم يتم الشراء بعد" : "N/A")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* حقول التسعير والتكلفة */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* سعر الشراء للقطعة (يدخله المستخدم ويُحسب عليه الإجمالي) */}
                        <div className="sm:col-span-1">
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {isRTL ? "سعر التكلفة للقطعة *" : "Unit Cost *"}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={purchaseUnitCost}
                              onChange={(e) => setPurchaseUnitCost(e.target.value)}
                              className="w-full p-2.5 border-2 border-emerald-500/80 rounded-xl bg-white font-mono font-bold text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-14"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold pointer-events-none">
                              {currencyCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                            {isRTL ? "اكتب التكلفة وسيتم الحساب عليها" : "Totals calculate based on this cost"}
                          </span>
                        </div>

                        {/* خصم الصنف Disc/Item */}
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">
                            {isRTL ? "خصم القطعة" : "Disc/Item"}
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={purchaseItemDiscount}
                            onChange={(e) => setPurchaseItemDiscount(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/70 font-semibold text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* ضريبة الصنف Tax/Item */}
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">
                            {isRTL ? "ضريبة القطعة" : "Tax/Item"}
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={purchaseItemTax}
                            onChange={(e) => setPurchaseItemTax(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50/70 font-semibold text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* تاريخ الصلاحية إن كان المنتج يتطلب ذلك */}
                      {selectedResolveItem.exp_ability && (
                        <div className="pt-1">
                          <label className="text-xs font-bold text-orange-600 block mb-1">
                            {isRTL ? "تاريخ الصلاحية *" : "Expiry Date *"}
                          </label>
                          <input
                            type="date"
                            value={purchaseExpiryDate}
                            onChange={(e) => setPurchaseExpiryDate(e.target.value)}
                            className="w-full sm:w-1/2 p-2 border border-orange-300 rounded-xl bg-orange-50/40 text-xs font-medium"
                          />
                        </div>
                      )}
                    </div>

                    {/* كارت الإعدادات العامة (المورد، الضريبة العامة، الخصم العام، تكلفة الشحن) */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* المورد Supplier */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {isRTL ? "المورد (Supplier):" : "Supplier:"}
                          </label>
                          <select
                            value={purchaseSupplierId}
                            onChange={(e) => setPurchaseSupplierId(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none truncate"
                          >
                            <option value="">{isRTL ? "بدون مورد (اختياري)" : "No Supplier (Optional)"}</option>
                            {purchaseSelection?.supplier?.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name || s.username}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* الضريبة العامة General Tax */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {isRTL ? "الضريبة العامة (General Tax):" : "General Tax:"}
                          </label>
                          <select
                            value={purchaseTaxId}
                            onChange={(e) => setPurchaseTaxId(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">{isRTL ? "بدون ضريبة عامة" : "No General Tax"}</option>
                            {purchaseSelection?.tax?.map((tx) => (
                              <option key={tx._id} value={tx._id}>
                                {tx.name} ({tx.amount}%)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* الخصم العام General Discount */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {isRTL ? "الخصم العام (General Discount):" : "General Discount:"}
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={purchaseGeneralDiscount}
                            onChange={(e) => setPurchaseGeneralDiscount(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* تكلفة الشحن Shipping Cost */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">
                            {isRTL ? "تكلفة الشحن (Shipping Cost):" : "Shipping Cost:"}
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={purchaseShippingCost}
                            onChange={(e) => setPurchaseShippingCost(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* كارت طريقة وحالة الدفع (كامل / جزئي / آجل) */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-3">
                      <label className="text-xs font-bold text-gray-700 block">
                        {isRTL ? "طريقة وحالة الدفع (Payment Status):" : "Payment Status:"}
                      </label>

                      <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setPurchasePaymentStatus("full");
                            setPurchasePaidAmount(purchaseTotals.grandTotal);
                          }}
                          className={`py-2 rounded-lg font-bold text-xs transition-all ${
                            purchasePaymentStatus === "full"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRTL ? "دفع كامل (Full)" : "Full Payment"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPurchasePaymentStatus("partial");
                            setPurchasePaidAmount(Number((purchaseTotals.grandTotal / 2).toFixed(2)));
                          }}
                          className={`py-2 rounded-lg font-bold text-xs transition-all ${
                            purchasePaymentStatus === "partial"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRTL ? "دفع جزئي (Partial)" : "Partial Payment"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPurchasePaymentStatus("later");
                            setPurchasePaidAmount(0);
                          }}
                          className={`py-2 rounded-lg font-bold text-xs transition-all ${
                            purchasePaymentStatus === "later"
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {isRTL ? "دفع آجل (Later)" : "Later Payment"}
                        </button>
                      </div>

                      {/* حقول الدفع حسب الحالة المختارة */}
                      {purchasePaymentStatus === "full" && (
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                          <label className="text-xs font-bold text-emerald-950 block">
                            {isRTL ? "الخزينة / الحساب المالي المخصوم منه:" : "Treasury / Financial Account:"}
                          </label>
                          <select
                            value={purchaseFinancialId}
                            onChange={(e) => setPurchaseFinancialId(e.target.value)}
                            className="w-full p-2.5 border border-emerald-300 rounded-xl bg-white font-medium text-gray-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          >
                            {purchaseSelection?.financial?.map((f) => (
                              <option key={f._id} value={f._id}>
                                {f.name || f.title || f._id}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-emerald-800 font-bold">
                            {isRTL
                              ? `سيتم خصم المبلغ الإجمالي بالكامل (${purchaseTotals.grandTotal} ${currencyCode}) من الخزينة.`
                              : `Full amount (${purchaseTotals.grandTotal} ${currencyCode}) will be deducted immediately.`}
                          </p>
                        </div>
                      )}

                      {purchasePaymentStatus === "partial" && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">
                                {isRTL ? "الخزينة / الحساب المالي:" : "Treasury / Account:"}
                              </label>
                              <select
                                value={purchaseFinancialId}
                                onChange={(e) => setPurchaseFinancialId(e.target.value)}
                                className="w-full p-2.5 border border-amber-300 rounded-xl bg-white font-medium text-gray-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                              >
                                {purchaseSelection?.financial?.map((f) => (
                                  <option key={f._id} value={f._id}>
                                    {f.name || f.title || f._id}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">
                                {isRTL ? "المبلغ المدفوع الآن *" : "Paid Amount Now *"}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max={purchaseTotals.grandTotal}
                                  value={purchasePaidAmount}
                                  onChange={(e) => setPurchasePaidAmount(e.target.value)}
                                  className="w-full p-2.5 border border-amber-300 rounded-xl bg-white font-mono font-bold text-gray-800 text-xs focus:ring-1 focus:ring-amber-500 outline-none pr-12"
                                />
                                <span className="absolute right-3 top-2.5 text-[11px] text-gray-400 font-bold">
                                  {currencyCode}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-amber-100/70 p-2.5 rounded-lg text-xs font-bold text-amber-900">
                            <span>{isRTL ? "المبلغ المتبقي (آجل / دين على الفاتورة):" : "Remaining Due:"}</span>
                            <span className="font-mono text-sm font-black text-amber-950">
                              {purchaseTotals.remainingToPay} {currencyCode}
                            </span>
                          </div>
                        </div>
                      )}

                      {purchasePaymentStatus === "later" && (
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
                          <p className="text-xs text-blue-900 font-semibold leading-relaxed">
                            {isRTL
                              ? `سيتم تسجيل كامل قيمة الفاتورة (${purchaseTotals.grandTotal} ${currencyCode}) كدين آجل على حساب المورد دون صرف أي مبالغ من الخزينة حالياً.`
                              : `Full amount (${purchaseTotals.grandTotal} ${currencyCode}) will be recorded as credit/due without immediate treasury deduction.`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* كارت شريط الإجماليات النهائي */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-300 pb-2 border-b border-slate-800">
                        <span>{isRTL ? "إجمالي الأصناف:" : "Items Subtotal:"}</span>
                        <span className="font-mono font-bold">{purchaseTotals.itemsSubtotal} {currencyCode}</span>
                      </div>
                      {purchaseTotals.generalTaxAmount > 0 && (
                        <div className="flex justify-between items-center text-xs text-slate-300">
                          <span>{isRTL ? "الضريبة العامة:" : "General Tax:"}</span>
                          <span className="font-mono text-emerald-400">+{purchaseTotals.generalTaxAmount} {currencyCode}</span>
                        </div>
                      )}
                      {Number(purchaseShippingCost) > 0 && (
                        <div className="flex justify-between items-center text-xs text-slate-300">
                          <span>{isRTL ? "تكلفة الشحن:" : "Shipping:"}</span>
                          <span className="font-mono text-emerald-400">+{Number(purchaseShippingCost)} {currencyCode}</span>
                        </div>
                      )}
                      {Number(purchaseGeneralDiscount) > 0 && (
                        <div className="flex justify-between items-center text-xs text-slate-300">
                          <span>{isRTL ? "الخصم العام:" : "General Discount:"}</span>
                          <span className="font-mono text-orange-400">-{Number(purchaseGeneralDiscount)} {currencyCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="font-bold text-sm text-slate-100">{isRTL ? "المبلغ الإجمالي النهائي:" : "Grand Total:"}</span>
                        <span className="font-mono font-black text-xl text-emerald-400">
                          {purchaseTotals.grandTotal} <span className="text-xs text-slate-400 font-sans">{currencyCode}</span>
                        </span>
                      </div>
                    </div>

                    {/* زر تأكيد الشراء والتسوية */}
                    <button
                      type="button"
                      onClick={() => handleDirectPurchaseResolve(selectedResolveItem)}
                      disabled={resolving}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {resolving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>{isRTL ? "جاري إنشاء الفاتورة والتسوية..." : "Creating Purchase & Resolving..."}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          <span>{isRTL ? "تأكيد الشراء وتسوية الجرد فوراً" : "Confirm Purchase & Resolve Now"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* خيار 2: تعديل المخزون مباشرة بدون فاتورة Adjust Stock */}
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                        <RefreshCw size={18} />
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h4 className="font-bold text-sm text-blue-950">
                          {isRTL ? "تعديل كمية المخزون مباشرة (Adjust Stock)" : "Adjust Stock Directly"}
                        </h4>
                        <p className="text-xs text-blue-800">
                          {isRTL
                            ? "إضافة كمية الفائض لرصيد المخزون فوراً في النظام دون إنشاء فاتورة شراء"
                            : "Add surplus directly to system inventory without purchase invoice"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResolveAction(selectedResolveItem, "adjust_stock")}
                      disabled={resolving}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {resolving ? (isRTL ? "جاري التعديل..." : "Processing...") : (isRTL ? "تأكيد تعديل كمية المخزون وتسوية" : "Confirm Stock Adjustment & Resolve")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* الحالة 2: عجز (-) Shortage */}
            {selectedResolveItem.difference < 0 && (
              <div className="space-y-3 mt-2">
                <p className="text-xs text-gray-600 font-medium">
                  {isRTL
                    ? "يوجد عجز في هذا الصنف. اختر الإجراء المناسب لتسوية هذا العجز:"
                    : "There is a shortage for this item. Choose the desired resolution:"}
                </p>

                <div className="space-y-3">
                  {/* خيار 1: هالك Wasted */}
                  <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-orange-600 text-white rounded-lg shadow-xs">
                        <Trash2 size={18} />
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h4 className="font-bold text-sm text-orange-950">
                          {isRTL ? "تسجيل في الهالك (Send to Wasted)" : "Record as Wasted"}
                        </h4>
                        <p className="text-xs text-orange-800">
                          {isRTL
                            ? `تسجيل ${Math.abs(selectedResolveItem.difference)} قطعة كهالك بسبب عجز جرد وتعديل المخزون`
                            : `Record ${Math.abs(selectedResolveItem.difference)} units as wasted due to stocktake discrepancy`}
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={isRTL ? "ملاحظة الهالك (اختياري)..." : "Wasted note (optional)..."}
                      value={resolveNote}
                      onChange={(e) => setResolveNote(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleResolveAction(selectedResolveItem, "send_to_wasted", resolveNote)}
                      disabled={resolving}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {resolving ? (isRTL ? "جاري التسجيل..." : "Processing...") : (isRTL ? "تأكيد التسجيل كهالك وتسوية" : "Confirm Wasted & Resolve")}
                    </button>
                  </div>

                  {/* خيار 2: تعديل كمية السيستم Adjust Stock */}
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                        <RefreshCw size={18} />
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h4 className="font-bold text-sm text-blue-950">
                          {isRTL ? "تعديل كمية السيستم (Adjust Stock)" : "Adjust Stock in System"}
                        </h4>
                        <p className="text-xs text-blue-800">
                          {isRTL
                            ? "تعديل كمية المخزون في النظام لتطابق الكمية الفعلية المحصورة"
                            : "Adjust system inventory to match actual counted quantity"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResolveAction(selectedResolveItem, "adjust_stock")}
                      disabled={resolving}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {resolving ? (isRTL ? "جاري التعديل..." : "Processing...") : (isRTL ? "تأكيد تعديل كمية المخزون وتسوية" : "Confirm Stock Adjustment & Resolve")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedResolveItem(null);
                  setResolveNote("");
                }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}