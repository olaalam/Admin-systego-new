import { useEffect, useState } from "react";
import { X, Truck, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

const BOSTA_STATUS_OPTIONS = [
  "PendingPickup",
  "Pickup requested",
  "Picked up",
  "In transit",
  "Out for delivery",
  "Delivered",
  "Cancelled",
  "Failed to deliver",
  "Returned",
];

const UpdateBostaStatusModal = ({
  open,
  onClose,
  orderId,
  currentStatus,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(currentStatus || "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected(currentStatus || "PendingPickup");
      setDescription("");
    }
  }, [open, currentStatus]);

  const handleSave = async () => {
    if (!selected) {
      toast.error(t("Please select a status"));
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch(
        `/api/admin/online-orders/${orderId}/status`,
        {
          status: selected,
          statusDescription: description.trim() || undefined,
        },
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Truck size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("Update Bosta Status")}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  "Manual override — the tracking will update automatically on next sync",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
            <AlertTriangle
              size={14}
              className="text-blue-600 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
              {t(
                "This manually overrides the Bosta status. On next Sync, it will be replaced with the real Bosta status.",
              )}
            </p>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              {t("Bosta Status")}
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            >
              {BOSTA_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              {t("Description")}{" "}
              <span className="text-slate-400 font-normal normal-case">
                ({t("Optional")})
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Why are you overriding?")}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
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
            className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("Saving...")}
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                {t("Override Status")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBostaStatusModal;
