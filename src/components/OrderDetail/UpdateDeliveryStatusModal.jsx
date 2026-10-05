import { useEffect, useState } from "react";
import {
  X,
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

const STATUS_OPTIONS = [
  {
    id: "picked_up",
    label: "Picked Up",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "failed",
    label: "Failed",
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    id: "returned",
    label: "Returned",
    icon: RotateCcw, // 🆕 ضيف import
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const UpdateDeliveryStatusModal = ({
  open,
  onClose,
  orderId,
  currentStatus,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(currentStatus || "");
  const [notes, setNotes] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(currentStatus || "");
      setNotes("");
      setFailureReason("");
    }
  }, [open, currentStatus]);

  const handleSave = async () => {
    if (!selected) {
      toast.error(t("Please select a status"));
      return;
    }
    if (selected === "failed" && !failureReason.trim()) {
      toast.error(t("Failure reason is required"));
      return;
    }

    setSaving(true);
    try {
      const payload = { status: selected };
      if (notes.trim()) payload.notes = notes.trim();
      if (selected === "failed" && failureReason.trim())
        payload.failure_reason = failureReason.trim();

      const res = await api.post(
        `/api/admin/delivery-assignment/orders/${orderId}/delivery-status`,
        payload,
      );
      toast.success(res.data?.message || t("Status updated"));
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t("Failed to update status"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <RefreshCw size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t("Update Delivery Status")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status grid */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              {t("New Status")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-start ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${opt.bg} ${opt.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {t(opt.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Failure reason — only when failed */}
          {selected === "failed" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                {t("Failure Reason")} *
              </label>
              <input
                type="text"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder={t("e.g. Customer not answering")}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              {t("Notes")}{" "}
              <span className="text-slate-400 font-normal normal-case">
                ({t("Optional")})
              </span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("Additional notes")}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selected}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("Saving...")}
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                {t("Save")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDeliveryStatusModal;
