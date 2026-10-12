import { useEffect, useState } from "react";
import {
  X,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

const AssignDeliveryManModal = ({ open, onClose, orderId, onAssigned }) => {
  const { t } = useTranslation();
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [notes, setNotes] = useState("");

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/api/admin/delivery-assignment/delivery-men/available",
      );
      // Support both { data: { deliveryMen } } and { deliveryMen }
      const list = res.data?.data?.deliveryMen || res.data?.deliveryMen || [];
      setDeliveryMen(list);
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to fetch delivery men"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailable();
      setNotes("");
    }
  }, [open]);

  const handleAssign = async (dmId) => {
    setAssigning(dmId);
    try {
      const res = await api.post(
        `/api/admin/delivery-assignment/orders/${orderId}/assign`,
        {
          delivery_man_id: dmId,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      );
      toast.success(res.data?.message || t("Assigned successfully"));
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t("Failed to assign"));
    } finally {
      setAssigning(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("Assign Delivery Man")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Choose an available delivery man")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAvailable}
              disabled={loading}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
              title={t("Refresh")}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : deliveryMen.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-600 font-bold text-sm">
                {t("No available delivery men")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t("All delivery men are busy or inactive")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliveryMen.map((dm) => {
                const activeCount = dm.currentOrders?.length || 0;
                const maxCount = dm.maxConcurrentOrders || 10;
                const isAssigning = assigning === dm._id;

                return (
                  <div
                    key={dm._id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                        {dm.photo ? (
                          <img
                            src={dm.photo}
                            alt={dm.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-indigo-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {dm.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Phone size={11} />
                          <span dir="ltr">{dm.phone_number || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {activeCount} / {maxCount} {t("orders")}
                          </span>
                          {dm.completedOrders > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                              {dm.completedOrders} {t("completed")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssign(dm._id)}
                      disabled={isAssigning || !!assigning}
                      className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          {t("Assigning...")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} />
                          {t("Assign")}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — Notes */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
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
            placeholder={t("e.g. Call before delivery")}
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignDeliveryManModal;
