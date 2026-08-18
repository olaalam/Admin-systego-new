// src/Pages/StockTake/StockTakeDetails.jsx
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/api";
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

  const { putData, loading: saving } = usePut();
  const { postData, loading: submitting } = usePost();

  const [items, setItems] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [treatUnfilledAsSkipped, setTreatUnfilledAsSkipped] = useState(false);

  const stocktake = stocktakeData?.stocktake || stocktakeData || {};
  const products = itemsData?.items || itemsData?.data || [];

  const loading = loadingStocktake || loadingItems;

  // Initialize items from API data
  useEffect(() => {
    if (products.length > 0) {
      setItems(
        products.map((p) => ({
          itemId: p._id,
          name: p.productNameSnapshot || p.product?.name || p.productId?.name || p.name || "-",
          systemQty: p.systemQty ?? p.system_qty ?? p.quantity ?? 0,
          actualQty: p.actualQty ?? p.actual_qty ?? "",
          status: p.status || "-",
        }))
      );
    }
  }, [products]);

  const handleActualQtyChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, actualQty: value } : item
      )
    );
  };

  const handleSubmit = () => {
    // Validate all actual quantities are filled
    if (stocktake.mode === "manual") {
      const emptyItems = items.filter(
        (item) => item.actualQty === "" || item.actualQty === null || item.actualQty === undefined
      );
      if (emptyItems.length > 0) {
        toast.error(
          t("Please fill in all actual quantities")
        );
        return;
      }
    }
    setShowConfirmDialog(true);
  };

  const handleSaveProgress = async () => {
    try {
      const payload = {
        items: items
          .filter((item) => item.actualQty !== "" && item.actualQty !== null)
          .map((item) => ({
            itemId: item.itemId,
            actualQty: Number(item.actualQty),
          })),
      };

      if (payload.items.length === 0) {
        toast.error(t("No quantities to save"));
        return;
      }

      const response = await putData(payload, `/api/admin/stocktake/${id}/items`);
      if (response) {
        toast.success(t("Progress saved successfully"));
        refetchItems();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      const payload = {
        treatUnfilledAsSkipped: treatUnfilledAsSkipped,
      };

      const response = await postData(payload, `/api/admin/stocktake/${id}/submit`);
      if (response) {
        toast.success(t("Stock take submitted successfully"));
        navigate("/stocktake");
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await api.get(`/api/admin/stocktake/${id}/export?includeSystemQty=true`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `stocktake_${stocktake.reference || id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("File exported successfully"));
    } catch (err) {
      console.error("Export error:", err);
      toast.error(t("Export failed"));
    } finally {
      setExportLoading(false);
    }
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
        // تم تصليح الإيرور واستخدام الدوال الصحيحة
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
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* Excel Mode Buttons */}
        {stocktake.mode === "excel" && (
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-all"
            >
              <Download size={18} />
              {exportLoading ? t("Exporting...") : t("Export Template")}
            </button>

            <label className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-all">
              <Upload size={18} />
              {importLoading ? t("Importing...") : t("Import Excel")}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={importLoading}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImport(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        )}

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const difference =
                      item.actualQty !== "" && item.actualQty !== null
                        ? Number(item.actualQty) - item.systemQty
                        : null;

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
                            disabled={stocktake.status === "completed"}
                            className="w-full border rounded-xl p-2 text-center font-bold focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            value={item.actualQty}
                            onChange={(e) =>
                              handleActualQtyChange(index, e.target.value)
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-bold ${difference > 0 ? "bg-green-50 text-green-700" : difference < 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                            {stocktake.status === "processing" ? "?" : (difference !== null ? (difference > 0 ? `+${difference}` : difference) : "-")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
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
        {stocktake.status !== "completed" && (
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
              <>
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
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("Mismatches")}:</span>
                  <strong className="text-red-600">
                    {
                      items.filter(
                        (i) =>
                          i.actualQty !== "" &&
                          i.actualQty !== null &&
                          Number(i.actualQty) !== i.systemQty
                      ).length
                    }
                  </strong>
                </div>
              </>
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
    </div>
  );
}