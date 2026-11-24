import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Trash2,
  RotateCcw,
  Search,
  X,
  AlertTriangle,
  Package,
  Folder,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import api from "@/api/api";
import DeleteDialog from "@/components/DeleteForm";

// Helper for image URLs (handles raw urls, base64, etc.)
const getImageUrl = (imageStr) => {
  if (!imageStr) return "";
  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    return imageStr;
  }
  if (imageStr.startsWith("data:")) {
    return imageStr;
  }
  if (imageStr.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/jpeg;base64,${imageStr}`;
  }
  return imageStr;
};

// Robust extractor for items returned by trash API
const extractItems = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.products)) return resData.products;
  if (Array.isArray(resData.categories)) return resData.categories;
  if (Array.isArray(resData.trash)) return resData.trash;
  if (Array.isArray(resData.items)) return resData.items;
  if (resData.data && typeof resData.data === "object") {
    if (Array.isArray(resData.data.products)) return resData.data.products;
    if (Array.isArray(resData.data.categories)) return resData.data.categories;
    if (Array.isArray(resData.data.trash)) return resData.data.trash;
    if (Array.isArray(resData.data.items)) return resData.data.items;
  }
  return [];
};

export default function TrashModal({
  isOpen,
  onClose,
  title,
  type = "product", // "product" | "category"
  trashEndpoint,
  restoreEndpoint,
  forceDeleteEndpoint,
  onItemRestored,
  onItemForceDeleted,
  onTrashCountChange,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restoringId, setRestoringId] = useState(null);
  const [forceDeleteTarget, setForceDeleteTarget] = useState(null);
  const [forceDeleting, setForceDeleting] = useState(false);

  // Fetch trash items
  const fetchTrash = useCallback(async () => {
    if (!trashEndpoint) return;
    setLoading(true);
    try {
      const res = await api.get(trashEndpoint);
      const parsedItems = extractItems(res.data);
      setItems(parsedItems);
      if (onTrashCountChange) {
        onTrashCountChange(parsedItems.length);
      }
    } catch (err) {
      console.error("Failed to fetch trash items:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedToLoadTrash", "فشل تحميل سلة المحذوفات");
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [trashEndpoint, onTrashCountChange, t]);

  // Load when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      fetchTrash();
    }
  }, [isOpen, fetchTrash]);

  // Handle Restore
  const handleRestore = async (item) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    setRestoringId(itemId);
    try {
      const url = restoreEndpoint
        ? restoreEndpoint(itemId)
        : `${trashEndpoint.replace(/\/trash$/, "")}/${itemId}/restore`;

      const res = await api.post(url);

      toast.success(
        res.data?.message ||
          (isRTL
            ? "تمت استعادة العنصر بنجاح"
            : "Item restored successfully")
      );

      // Remove from local trash list
      setItems((prev) => {
        const next = prev.filter((i) => (i._id || i.id) !== itemId);
        if (onTrashCountChange) onTrashCountChange(next.length);
        return next;
      });

      // Notify parent to refetch active table
      if (onItemRestored) {
        onItemRestored(item);
      }
    } catch (err) {
      console.error("Failed to restore item:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedToRestoreItem", "فشل استرجاع العنصر");
      toast.error(errMsg);
    } finally {
      setRestoringId(null);
    }
  };

  // Handle Force Delete
  const confirmForceDelete = async () => {
    if (!forceDeleteTarget) return;
    const itemId = forceDeleteTarget._id || forceDeleteTarget.id;
    if (!itemId) return;

    setForceDeleting(true);
    try {
      const url = forceDeleteEndpoint
        ? forceDeleteEndpoint(itemId)
        : `${trashEndpoint.replace(/\/trash$/, "")}/${itemId}/force`;

      const res = await api.delete(url);

      toast.success(
        res.data?.message ||
          (isRTL
            ? "تم حذف العنصر نهائياً بنجاح"
            : "Item permanently deleted successfully")
      );

      // Remove from local trash list
      setItems((prev) => {
        const next = prev.filter((i) => (i._id || i.id) !== itemId);
        if (onTrashCountChange) onTrashCountChange(next.length);
        return next;
      });

      if (onItemForceDeleted) {
        onItemForceDeleted(forceDeleteTarget);
      }
    } catch (err) {
      console.error("Failed to permanently delete item:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedToForceDeleteItem", "فشل الحذف النهائي للعنصر");
      toast.error(errMsg);
    } finally {
      setForceDeleting(false);
      setForceDeleteTarget(null);
    }
  };

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const arName = (item.ar_name || item.name_ar || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      const barcode = (item.barcode || "").toLowerCase();
      const sku = (item.sku || "").toLowerCase();
      const parentName = (item.parentId?.name || item.parentId?.ar_name || "").toLowerCase();
      const catName = Array.isArray(item.categoryId)
        ? (item.categoryId[0]?.name || "").toLowerCase()
        : (item.categoryId?.name || "").toLowerCase();

      return (
        name.includes(q) ||
        arName.includes(q) ||
        code.includes(q) ||
        barcode.includes(q) ||
        sku.includes(q) ||
        parentName.includes(q) ||
        catName.includes(q)
      );
    });
  }, [items, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center shadow-xs">
                <Trash2 size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {title || (isRTL ? "سلة المحذوفات" : "Trash")}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">
                    {items.length} {isRTL ? "عنصر" : "items"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRTL
                    ? "العناصر المحذوفة مؤقتاً، يمكنك استعادتها أو حذفها نهائياً"
                    : "Temporarily deleted items. You can restore or permanently delete them."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchTrash}
                disabled={loading}
                title={isRTL ? "تحديث" : "Refresh"}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 sm:px-6 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search
                size={18}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isRTL
                    ? "ابحث في سلة المحذوفات بالاسم أو الكود..."
                    : "Search in trash by name or code..."
                }
                className={`w-full py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                    isRTL ? "left-3" : "right-3"
                  }`}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Items Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 size={36} className="animate-spin text-red-600 mb-3" />
                <p className="text-sm">
                  {isRTL ? "جاري تحميل سلة المحذوفات..." : "Loading trash items..."}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                  <Trash2 size={28} />
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-1">
                  {searchQuery
                    ? isRTL
                      ? "لا توجد نتائج مطابقة لبحثك"
                      : "No matching items found"
                    : isRTL
                    ? "سلة المحذوفات فارغة"
                    : "Trash is empty"}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  {searchQuery
                    ? isRTL
                      ? "جرّب البحث بكلمة أخرى أو امسح شريط البحث."
                      : "Try searching with different keywords."
                    : isRTL
                    ? "لا توجد أي عناصر محذوفة حالياً في هذا القسم."
                    : "No deleted items currently present."}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const itemId = item._id || item.id;
                const isRestoring = restoringId === itemId;
                const imageUrl = getImageUrl(item.image);
                const hasImage = Boolean(imageUrl);

                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200/80 hover:border-red-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Item Details */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Image / Icon */}
                      <div className="relative flex-shrink-0">
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={item.name || "Item"}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center">
                            {type === "category" ? (
                              <Folder size={22} />
                            ) : (
                              <Package size={22} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {item.name || (isRTL ? "بدون اسم" : "Unnamed")}
                          </h4>
                          {(item.ar_name || item.name_ar) && (
                            <span className="text-xs text-gray-500">
                              ({item.ar_name || item.name_ar})
                            </span>
                          )}
                        </div>

                        {/* Extra metadata */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {/* Type Category Specific */}
                          {type === "category" && (
                            <>
                              {item.parentId && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                  {isRTL ? "القسم الرئيسي:" : "Parent:"}{" "}
                                  {item.parentId.name || item.parentId.ar_name || "—"}
                                </span>
                              )}
                              {typeof item.product_quantity === "number" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                  {item.product_quantity}{" "}
                                  {isRTL ? "منتج" : "products"}
                                </span>
                              )}
                            </>
                          )}

                          {/* Type Product Specific */}
                          {type === "product" && (
                            <>
                              {(item.categoryId?.[0]?.name || item.categoryId?.name) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                  {item.categoryId?.[0]?.name || item.categoryId?.name}
                                </span>
                              )}
                              {item.brandId?.name && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                                  {item.brandId.name}
                                </span>
                              )}
                              {(item.code || item.barcode || item.sku) && (
                                <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                  #{item.code || item.barcode || item.sku}
                                </span>
                              )}
                              {item.price !== undefined && (
                                <span className="font-semibold text-red-600">
                                  {typeof item.price === "object"
                                    ? item.price.price
                                    : item.price}{" "}
                                  {t("EGP", "EGP")}
                                </span>
                              )}
                              {item.totalQuantity !== undefined && (
                                <span className="text-gray-600">
                                  {isRTL ? "المخزون:" : "Stock:"}{" "}
                                  <strong className="font-semibold">
                                    {item.totalQuantity}
                                  </strong>
                                </span>
                              )}
                            </>
                          )}

                          {(item.deletedAt || item.updatedAt) && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock size={12} />
                              {new Date(
                                item.deletedAt || item.updatedAt
                              ).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: The 2 requested options (Restore & Force Delete) */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 mt-2 sm:mt-0">
                      {/* 1. Restore Option */}
                      <button
                        type="button"
                        onClick={() => handleRestore(item)}
                        disabled={isRestoring || forceDeleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                        title={isRTL ? "استرجاع العنصر" : "Restore Item"}
                      >
                        {isRestoring ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                        <span>{isRTL ? "استرجاع" : "Restore"}</span>
                      </button>

                      {/* 2. Force Delete Option */}
                      <button
                        type="button"
                        onClick={() => setForceDeleteTarget(item)}
                        disabled={isRestoring || forceDeleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                        title={isRTL ? "حذف نهائي خالص" : "Permanent Delete"}
                      >
                        <Trash2 size={14} />
                        <span>{isRTL ? "حذف نهائي" : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 sm:px-6 bg-white border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {isRTL
                ? `إجمالي العناصر المحذوفة: ${items.length}`
                : `Total deleted items: ${items.length}`}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isRTL ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Permanent Force Delete */}
      {forceDeleteTarget && (
        <DeleteDialog
          title={isRTL ? "تأكيد الحذف النهائي" : "Confirm Permanent Delete"}
          message={
            isRTL
              ? `هل أنت متأكد من رغبتك في حذف "${
                  forceDeleteTarget.name || forceDeleteTarget.ar_name || "هذا العنصر"
                }" نهائياً من قاعدة البيانات؟ هذا الإجراء لا يمكن التراجع عنه أبداً وسيتم مسحه خالص.`
              : `Are you sure you want to permanently delete "${
                  forceDeleteTarget.name || "this item"
                }"? This action CANNOT be undone and will permanently wipe the record.`
          }
          confirmText={isRTL ? "حذف نهائي" : "Delete Permanently"}
          cancelText={isRTL ? "إلغاء" : "Cancel"}
          onConfirm={confirmForceDelete}
          onCancel={() => setForceDeleteTarget(null)}
          loading={forceDeleting}
        />
      )}
    </>
  );
}
