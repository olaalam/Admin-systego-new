import { useState, useMemo, useEffect } from "react";
import {
  X,
  Truck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";
import SetBostaAddressModal from "./SetBostaAddressModal";

const BulkCreateBostaShipmentsModal = ({ open, onClose, onCreated }) => {
  const { t } = useTranslation();

  const [creating, setCreating] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [result, setResult] = useState(null);

  // 🆕 State للـ address modal
  const [addressModalOrder, setAddressModalOrder] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // Fetch all bosta orders
  // ═══════════════════════════════════════════════════════════
  const fetchOrders = () => {
    setLoadingOrders(true);
    api
      .get("/api/admin/online-orders")
      .then((res) => {
        const list = res.data?.data?.orders || res.data?.orders || [];

        const bostaOrders = list.filter((order) => {
          const method = order.shippingMethod || order.shipmentType;
          if (method !== "bosta") return false;
          if (order.bostaShipment) return false;
          if (
            ["delivered", "returned", "canceled", "rejected"].includes(
              order.status,
            )
          ) {
            return false;
          }
          return true;
        });

        setAllOrders(bostaOrders);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        toast.error(t("Failed to load orders"));
      })
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSelectedIds([]);
    fetchOrders();
  }, [open]);

  // ═══════════════════════════════════════════════════════════
  // Eligibility
  // ═══════════════════════════════════════════════════════════
  const isEligible = (order) => {
    const addr = order.shippingAddress || {};
    return !!(addr.bostaCityId && addr.bostaZoneId && addr.bostaDistrictId);
  };

  const eligibleOrders = useMemo(
    () => allOrders.filter(isEligible),
    [allOrders],
  );

  // ═══════════════════════════════════════════════════════════
  // Selection
  // ═══════════════════════════════════════════════════════════
  const toggleOrder = (orderId, order) => {
    if (!isEligible(order)) return;
    setSelectedIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleOrders.map((o) => o._id));
    }
  };

  const allSelected =
    eligibleOrders.length > 0 && selectedIds.length === eligibleOrders.length;

  const selectedOrders = useMemo(() => {
    return allOrders.filter((o) => selectedIds.includes(o._id));
  }, [allOrders, selectedIds]);

  // ═══════════════════════════════════════════════════════════
  // Create bulk
  // ═══════════════════════════════════════════════════════════
  const handleCreate = async () => {
    if (selectedOrders.length === 0) {
      toast.error(t("Please select at least one order"));
      return;
    }

    setCreating(true);
    try {
      const ordersPayload = selectedOrders.map((order) => {
        const addr = order.shippingAddress || {};

        const total =
          (order.totalOrderPrice || 0) +
          (order.shippingPrice || 0) +
          (order.serviceFee || 0) +
          (order.taxAmount || 0) -
          (order.couponDiscount || 0);

        const codAmount =
          order.paymentStatus === "paid" ? 0 : Math.max(0, total);

        return {
          order_id: order._id,
          dropOffAddress: {
            city: addr.bostaCityName || addr.city || "",
            zoneId: addr.bostaZoneId || "",
            districtId: addr.bostaDistrictId || "",
            firstLine: addr.details || addr.street || "",
            secondLine: "",
            buildingNumber: String(addr.buildingNumber || ""),
            floor: String(addr.floorNumber || ""),
            apartment: String(addr.apartmentNumber || ""),
          },
          cod: codAmount,
          weight: 1,
        };
      });

      const res = await api.post("/api/admin/shipping/bosta/deliveries/bulk", {
        orders: ordersPayload,
      });

      const data = res.data?.data || res.data;

      setResult({
        total: data?.total || ordersPayload.length,
        valid: data?.valid || 0,
        succeeded: data?.succeeded || 0,
        failed: data?.failed || 0,
        created: data?.created || [],
        errors: data?.errors || [],
      });

      if ((data?.succeeded || 0) > 0) {
        toast.success(t("Created successfully") + ": " + data.succeeded);
        onCreated?.();
      }
      if ((data?.succeeded || 0) === 0 && (data?.failed || 0) > 0) {
        toast.error(t("All shipments failed"));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          t("Bulk create failed"),
      );
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t("Create Bosta Shipments")}
                </h3>
                <p className="text-xs text-slate-500">
                  {allOrders.length} {t("Bosta orders")} •{" "}
                  {eligibleOrders.length} {t("ready")}
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

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {result ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      {t("Total")}
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      {result.total}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">
                      {t("Created")}
                    </p>
                    <p className="text-2xl font-black text-emerald-700">
                      {result.succeeded}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                    <p className="text-[10px] text-rose-600 font-bold uppercase mb-1">
                      {t("Failed")}
                    </p>
                    <p className="text-2xl font-black text-rose-700">
                      {result.failed}
                    </p>
                  </div>
                </div>

                {result.created?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      {t("Created Shipments")} ({result.created.length})
                    </h4>
                    <div className="space-y-2">
                      {result.created.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              #{item.order_id?.slice(-6).toUpperCase()} •{" "}
                              {item.reference}
                            </p>
                            {item.trackingNumber && (
                              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                                AWB: {item.trackingNumber}
                              </p>
                            )}
                          </div>
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600 shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <XCircle size={13} />
                      {t("Failed Orders")} ({result.errors.length})
                    </h4>
                    <div className="space-y-2">
                      {result.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-rose-50 border border-rose-100"
                        >
                          <p className="text-xs font-bold text-slate-800 truncate">
                            #{err.order_id?.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-rose-700 mt-0.5">
                            {err.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-orange-500" />
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="text-slate-300" size={28} />
                </div>
                <p className="text-slate-600 font-bold text-sm">
                  {t("No Bosta orders available")}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {t(
                    "All Bosta orders already have shipments, or in terminal state.",
                  )}
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
                  <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
                    {t(
                      "Pickup address will be taken from Bosta settings. Make sure it's configured in Shipping Settings → Advanced.",
                    )}
                  </p>
                </div>

                {eligibleOrders.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {t("Select All Ready")} ({eligibleOrders.length})
                      </span>
                    </label>
                    {selectedIds.length > 0 && (
                      <span className="text-[11px] font-bold text-orange-600">
                        {selectedIds.length} {t("selected")}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allOrders.map((order) => {
                    const total =
                      (order.totalOrderPrice || 0) +
                      (order.shippingPrice || 0) +
                      (order.serviceFee || 0) +
                      (order.taxAmount || 0) -
                      (order.couponDiscount || 0);

                    const eligible = isEligible(order);
                    const isSelected = selectedIds.includes(order._id);
                    const addr = order.shippingAddress || {};

                    return (
                      <div
                        key={order._id}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          !eligible
                            ? "border-amber-100 bg-amber-50/50"
                            : isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!eligible}
                          onChange={() => toggleOrder(order._id, order)}
                          className="w-4 h-4 accent-orange-500 cursor-pointer shrink-0 disabled:cursor-not-allowed"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              #{order._id?.slice(-6).toUpperCase()} •{" "}
                              {order.reference}
                            </p>

                            {!eligible && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertTriangle size={9} />
                                {t("Missing Bosta address")}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {eligible
                              ? `${addr.bostaCityName} — ${addr.bostaDistrictName}`
                              : addr.city || addr.details || "—"}
                          </p>
                        </div>

                        {/* 🆕 Edit button لو مش eligible */}
                        {!eligible && (
                          <button
                            onClick={() => setAddressModalOrder(order)}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold transition active:scale-95"
                          >
                            <Edit3 size={11} />
                            {t("Set Address")}
                          </button>
                        )}

                        {eligible && (
                          <div className="text-end shrink-0">
                            <p className="text-sm font-black text-slate-900">
                              {total.toLocaleString()}{" "}
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {t("EGP")}
                              </span>
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">
                              {order.paymentStatus}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              {result ? t("Close") : t("Cancel")}
            </button>

            {!result && allOrders.length > 0 && (
              <button
                onClick={handleCreate}
                disabled={creating || selectedIds.length === 0}
                className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 active:scale-95"
              >
                {creating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    {t("Creating...")}
                  </>
                ) : (
                  <>
                    <Truck size={13} />
                    {t("Create")} {selectedIds.length}{" "}
                    {selectedIds.length === 1 ? t("Shipment") : t("Shipments")}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🆕 Set Bosta Address Modal */}
      <SetBostaAddressModal
        open={!!addressModalOrder}
        onClose={() => setAddressModalOrder(null)}
        order={addressModalOrder}
        onSaved={() => {
          // نعيد تحميل الأوردرات
          fetchOrders();
        }}
      />
    </>
  );
};

export default BulkCreateBostaShipmentsModal;
