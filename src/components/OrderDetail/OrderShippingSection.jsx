import { useState } from "react";
import {
  Truck,
  User,
  Phone,
  UserPlus,
  UserMinus,
  RefreshCw,
  Package,
  X,
  Loader2,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";
import AssignDeliveryManModal from "./AssignDeliveryManModal";
import UpdateDeliveryStatusModal from "./UpdateDeliveryStatusModal";
import CreateBostaShipmentModal from "./CreateBostaShipmentModal";
import UpdateBostaStatusModal from "./UpdateBostaStatusModal";

const OrderShippingSection = ({ order, refetch }) => {
  const { t } = useTranslation();

  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showBostaStatus, setShowBostaStatus] = useState(false);
  const [showCreateBosta, setShowCreateBosta] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [bostaLoading, setBostaLoading] = useState(null);

  const method = order.shippingMethod || order.shipmentType;
  const self = order.selfShipment;
  const deliveryMan = self?.deliveryManId;
  const bosta = order.bostaShipment;
  const warehouse = self?.warehouseId;

  // ✅ Bosta terminal states
  const isBostaCancelled = bosta?.status === "Cancelled";
  const isBostaDelivered = bosta?.status === "Delivered";
  const isBostaTerminal = isBostaCancelled || isBostaDelivered;

  // ═══════════════════════════════════════════════════════════
  // SELF: Unassign
  // ═══════════════════════════════════════════════════════════
  const handleUnassign = async () => {
    if (!window.confirm(t("Are you sure you want to unassign this order?")))
      return;
    setUnassigning(true);
    try {
      const res = await api.post(
        `/api/admin/delivery-assignment/orders/${order._id}/unassign`,
      );
      toast.success(res.data?.message || t("Unassigned"));
      refetch?.();
    } catch (err) {
      toast.error(err.response?.data?.message || t("Failed to unassign"));
    } finally {
      setUnassigning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // BOSTA: Refresh / Cancel / Label
  // ═══════════════════════════════════════════════════════════
  const handleBostaAction = async (action) => {
    setBostaLoading(action);
    try {
      if (action === "refresh") {
        const res = await api.post(
          `/api/admin/shipping/bosta/shipments/${bosta._id}/refresh`,
        );
        toast.success(res.data?.message || t("Tracking refreshed"));
      } else if (action === "cancel") {
        if (
          !window.confirm(t("Are you sure you want to cancel this shipment?"))
        ) {
          setBostaLoading(null);
          return;
        }
        const res = await api.delete(
          `/api/admin/shipping/bosta/shipments/${bosta._id}`,
        );
        toast.success(res.data?.message || t("Shipment cancelled"));
      } else if (action === "label") {
        const res = await api.get(
          `/api/admin/shipping/bosta/shipments/${bosta._id}/label`,
        );
        const url = res.data?.data?.labelUrl || res.data?.labelUrl;
        if (url) {
          window.open(url, "_blank");
          setBostaLoading(null);
          return;
        }
        toast.error(t("Label not available yet"));
      }
      refetch?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || t("Action failed"),
      );
    } finally {
      setBostaLoading(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  if (!method) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <Clock size={16} className="text-slate-400" />
        <p className="text-xs font-bold text-slate-500">
          {t("Shipping method not set yet")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Truck size={15} className="text-slate-500" />
          {t("Shipping Information")}
        </h4>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${
            method === "bosta"
              ? "bg-orange-50 text-orange-600 border border-orange-200"
              : "bg-indigo-50 text-indigo-600 border border-indigo-200"
          }`}
        >
          {method === "bosta" ? <Truck size={13} /> : <User size={13} />}
          {t(method)}
        </span>
      </div>

      {/* ═══════════════ SELF ═══════════════ */}
      {method === "self" && (
        <>
          {/* Pickup Warehouse */}
          {warehouse && (
            <div className="mb-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">
                    {t("Pickup Warehouse (for delivery man)")}
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {warehouse.name || t("Unnamed Warehouse")}
                  </p>
                  {warehouse.address && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <MapPin
                        size={12}
                        className="text-indigo-500 shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-slate-600 font-medium leading-tight">
                        {warehouse.address}
                      </p>
                    </div>
                  )}
                  {warehouse.phone && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <Phone size={11} />
                      <span dir="ltr">{warehouse.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Man Section */}
          {!deliveryMan ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <AlertTriangle
                size={16}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900">
                  {t("Not assigned to a delivery man yet")}
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {t("Assign a delivery man to start the delivery process")}
                </p>
                <button
                  onClick={() => setShowAssign(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <UserPlus size={13} />
                  {t("Assign Delivery Man")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {deliveryMan.photo ? (
                      <img
                        src={deliveryMan.photo}
                        alt={deliveryMan.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} className="text-indigo-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {deliveryMan.name || "—"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Phone size={11} />
                      <span dir="ltr">{deliveryMan.phone_number || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          self?.status === "delivered"
                            ? "bg-emerald-50 text-emerald-600"
                            : self?.status === "failed"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {t(self?.status || "assigned")}
                      </span>
                      {self?.assignmentType && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase">
                          {t(self.assignmentType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUnassign}
                  disabled={unassigning}
                  className="shrink-0 p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  title={t("Unassign")}
                >
                  {unassigning ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserMinus size={16} />
                  )}
                </button>
              </div>

              {self?.failureReason && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-rose-600 shrink-0 mt-0.5"
                  />
                  <p className="text-xs font-semibold text-rose-900">
                    {self.failureReason}
                  </p>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowStatus(true)}
                  disabled={
                    self?.status === "delivered" || self?.status === "failed"
                  }
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={13} />
                  {t("Update Status")}
                </button>
                <button
                  onClick={() => setShowAssign(true)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <UserPlus size={13} />
                  {t("Reassign")}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══════════════ BOSTA ═══════════════ */}
      {method === "bosta" && (
        <>
          {!bosta ? (
            // ─── No shipment yet ───
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
              <AlertTriangle
                size={16}
                className="text-orange-600 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-900">
                  {t("No Bosta shipment created yet")}
                </p>
                <p className="text-[11px] text-orange-700 mt-0.5">
                  {t("Create a shipment in Bosta to start tracking")}
                </p>
                <button
                  onClick={() => setShowCreateBosta(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Truck size={13} />
                  {t("Create Shipment in Bosta")}
                </button>
              </div>
            </div>
          ) : (
            // ─── Shipment exists ───
            <>
              <div className="space-y-2">
                <InfoRow
                  label={t("AWB / Tracking")}
                  value={bosta.awb || bosta.trackingNumber || "N/A"}
                />
                <InfoRow
                  label={t("Courier Status")}
                  value={bosta.status || "N/A"}
                />
                {bosta.cod > 0 && (
                  <InfoRow
                    label={t("COD")}
                    value={`${bosta.cod.toLocaleString()} ${t("EGP")}`}
                  />
                )}
              </div>

              {/* Pickup Info */}
              {bosta.pickup?.scheduledDate && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                      {t("Pickup Scheduled")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                    <Calendar size={11} />
                    <span className="font-bold">
                      {bosta.pickup.scheduledDate}
                    </span>
                    {bosta.pickup.scheduledTimeSlot && (
                      <>
                        <Clock size={11} className="ms-2" />
                        <span className="font-bold">
                          {typeof bosta.pickup.scheduledTimeSlot === "string"
                            ? bosta.pickup.scheduledTimeSlot
                            : `${bosta.pickup.scheduledTimeSlot.from} — ${bosta.pickup.scheduledTimeSlot.to}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ⚠️ Cancelled / Delivered Banner */}
              {isBostaTerminal && (
                <div
                  className={`mt-3 p-3 rounded-xl border flex items-start gap-2 ${
                    isBostaCancelled
                      ? "bg-red-50 border-red-100"
                      : "bg-emerald-50 border-emerald-100"
                  }`}
                >
                  {isBostaCancelled ? (
                    <X size={14} className="text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2
                      size={14}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-[11px] font-bold ${
                        isBostaCancelled ? "text-red-900" : "text-emerald-900"
                      }`}
                    >
                      {isBostaCancelled
                        ? t("This shipment is cancelled")
                        : t("This shipment is delivered")}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isBostaCancelled ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {isBostaCancelled
                        ? t(
                            "No further actions are available. If you need to ship again, create a new shipment.",
                          )
                        : t("No further actions are available.")}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleBostaAction("refresh")}
                  disabled={!!bostaLoading || isBostaTerminal}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    isBostaTerminal
                      ? t("Shipment is in terminal state — cannot sync")
                      : t("Sync Tracking")
                  }
                >
                  <RefreshCw
                    size={12}
                    className={bostaLoading === "refresh" ? "animate-spin" : ""}
                  />
                  {t("Sync Tracking")}
                </button>

                <button
                  onClick={() => setShowBostaStatus(true)}
                  disabled={isBostaTerminal}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    isBostaTerminal
                      ? t("Shipment is in terminal state")
                      : t("Update Status")
                  }
                >
                  <RefreshCw size={12} />
                  {t("Update Status")}
                </button>

                <button
                  onClick={() => handleBostaAction("label")}
                  disabled={
                    !!bostaLoading || !bosta.trackingNumber || isBostaCancelled
                  }
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    isBostaCancelled
                      ? t("Shipment is cancelled — no label available")
                      : t("Print Label")
                  }
                >
                  <Package size={12} />
                  {t("Print Label")}
                </button>

                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition"
                  title={t("View History")}
                >
                  <History size={12} />
                </button>

                <button
                  onClick={() => handleBostaAction("cancel")}
                  disabled={!!bostaLoading || isBostaTerminal}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    isBostaCancelled
                      ? t("Shipment is already cancelled")
                      : isBostaDelivered
                        ? t("Cannot cancel a delivered shipment")
                        : t("Cancel Shipment")
                  }
                >
                  <X size={12} />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <AssignDeliveryManModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        orderId={order._id}
        onAssigned={refetch}
      />

      <UpdateDeliveryStatusModal
        open={showStatus}
        onClose={() => setShowStatus(false)}
        orderId={order._id}
        currentStatus={self?.status}
        onUpdated={refetch}
      />

      <CreateBostaShipmentModal
        open={showCreateBosta}
        onClose={() => setShowCreateBosta(false)}
        order={order}
        onCreated={refetch}
      />

      <UpdateBostaStatusModal
        open={showBostaStatus}
        onClose={() => setShowBostaStatus(false)}
        orderId={order._id}
        currentStatus={bosta?.status}
        onUpdated={refetch}
      />

      {/* Bosta Tracking History Modal */}
      {showHistory && bosta && (
        <BostaTrackingHistoryModal
          open={showHistory}
          onClose={() => setShowHistory(false)}
          shipment={bosta}
        />
      )}
    </div>
  );
};

// ── Small helper ──
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
    <span className="text-[11px] font-bold text-slate-500 uppercase">
      {label}
    </span>
    <span className="text-xs font-bold text-slate-800 truncate max-w-[60%] text-end">
      {value}
    </span>
  </div>
);

// ── Tracking History Modal ──
const BostaTrackingHistoryModal = ({ open, onClose, shipment }) => {
  const { t } = useTranslation();
  if (!open) return null;

  const history = shipment.trackingHistory || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t("Tracking History")}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {shipment.trackingNumber || shipment.deliveryId}
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

        <div className="p-6 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              {t("No history yet")}
            </p>
          ) : (
            <div className="relative border-l-2 border-slate-100 ps-6 space-y-4">
              {history.map((entry, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -start-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
                  <p className="text-xs font-bold text-slate-800">
                    {entry.status || "—"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {entry.snapshotAt
                      ? new Date(entry.snapshotAt).toLocaleString()
                      : ""}
                  </p>
                  {entry.data?.description && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      {entry.data.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderShippingSection;
