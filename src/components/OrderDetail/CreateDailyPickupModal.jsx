import { useEffect, useState } from "react";
import {
  X,
  Truck,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

// ═══════════════════════════════════════════════════════════
// 🕐 Bosta Time Slots — ثابتة (مش من API)
// ═══════════════════════════════════════════════════════════
const BOSTA_TIME_SLOTS = [
  { value: "10:00 to 13:00", label: "10:00 — 13:00" },
  { value: "13:00 to 16:00", label: "13:00 — 16:00" },
];

const CreateDailyPickupModal = ({ open, onClose, onCreated }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    scheduledDate: "",
    scheduledTimeSlot: BOSTA_TIME_SLOTS[0].value,
  });

  // ═══════════════════════════════════════════════════════════
  // Fetch pending shipments
  // ═══════════════════════════════════════════════════════════
  const fetchPending = () => {
    setLoading(true);
    setError(null);

    api
      .get("/api/admin/shipping/bosta/pickups/pending")
      .then((res) => {
        const list = res.data?.data?.shipments || [];
        setShipments(list);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Failed to load pending shipments",
        );
      })
      .finally(() => setLoading(false));
  };

  // ═══════════════════════════════════════════════════════════
  // Init on open
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open) return;

    // default date: بكرة (لتجنب cut-off)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split("T")[0];

    setForm({
      scheduledDate: defaultDate,
      scheduledTimeSlot: BOSTA_TIME_SLOTS[0].value,
    });

    fetchPending();
  }, [open]);

  // ═══════════════════════════════════════════════════════════
  // Submit
  // ═══════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    if (shipments.length === 0) {
      toast.error(t("No pending shipments to schedule"));
      return;
    }
    if (!form.scheduledDate) {
      toast.error(t("Please select a date"));
      return;
    }
    if (!form.scheduledTimeSlot) {
      toast.error(t("Please select a time slot"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/admin/shipping/bosta/pickups/daily", {
        scheduledDate: form.scheduledDate,
        scheduledTimeSlot: form.scheduledTimeSlot,
      });

      const data = res.data?.data;
      toast.success(
        data?.message || `Pickup scheduled for ${shipments.length} shipments`,
      );

      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t("Failed to create pickup"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("Create Daily Pickup")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Schedule one pickup for all pending shipments")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPending}
              disabled={loading || submitting}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition disabled:opacity-50"
              title={t("Refresh")}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Info banner */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
            <AlertCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
              {t(
                "Bosta allows only one pickup per district per day. If a pickup already exists, it will be reused for these shipments.",
              )}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-rose-600 shrink-0 mt-0.5"
              />
              <p className="text-xs font-semibold text-rose-900">{error}</p>
            </div>
          )}

          {/* Shipments */}
          {!loading && !error && (
            <>
              {/* Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-900">
                    {shipments.length}
                  </p>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">
                    {shipments.length === 1
                      ? t("shipment ready for pickup")
                      : t("shipments ready for pickup")}
                  </p>
                </div>
              </div>

              {/* Empty state */}
              {shipments.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="text-emerald-400" size={28} />
                  </div>
                  <p className="text-slate-600 font-bold text-sm">
                    {t("All shipments have pickups scheduled")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("No pending shipments to schedule")}
                  </p>
                </div>
              )}

              {/* List */}
              {shipments.length > 0 && (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {t("Pending Shipments")}
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {shipments.map((s) => (
                        <div
                          key={s._id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              #{s.order?.reference || "—"} •{" "}
                              {s.trackingNumber || "—"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {s.dropOffAddress?.city} —{" "}
                              {s.dropOffAddress?.firstLine || ""}
                            </p>
                          </div>
                          <div className="text-end shrink-0 ms-3">
                            {s.cod > 0 && (
                              <p className="text-xs font-black text-emerald-600">
                                {s.cod.toLocaleString()} EGP
                              </p>
                            )}
                            <p className="text-[9px] text-slate-400 uppercase font-bold">
                              {s.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date + Time Slot */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Calendar size={11} />
                        {t("Pickup Date")} *
                      </label>
                      <input
                        type="date"
                        value={form.scheduledDate}
                        min={(() => {
                          const min = new Date();
                          min.setDate(min.getDate() + 1);
                          return min.toISOString().split("T")[0];
                        })()}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            scheduledDate: e.target.value,
                          }))
                        }
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Clock size={11} />
                        {t("Time Slot")} *
                      </label>
                      <select
                        value={form.scheduledTimeSlot}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            scheduledTimeSlot: e.target.value,
                          }))
                        }
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                      >
                        {BOSTA_TIME_SLOTS.map((slot, i) => (
                          <option key={i} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || shipments.length === 0 || loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("Scheduling...")}
              </>
            ) : (
              <>
                <Truck size={13} />
                {t("Schedule Pickup")} ({shipments.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDailyPickupModal;
