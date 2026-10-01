import { useState, useMemo, useEffect } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import {
  CheckCircle2,
  X,
  Clock,
  Eye,
  CreditCard,
  Info,
  Package,
  Truck,
  RotateCcw,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Filter,
  Check,
  Loader2,
  ChevronDown,
  ShoppingBag,
  MapPin,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Helper row component for financial summary
const Row = ({ label, value, valueClass = "text-slate-800" }) => (
  <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <span className={`text-xs font-bold ${valueClass}`}>{value}</span>
  </div>
);

// Modal Component to show full Order Details (Products + Variants + Address + Financials + Status Update)
const FinancialsModal = ({
  order,
  onCancel,
  statusOptions,
  onUpdateStatus,
  updating,
  refetch,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [bostaActionLoading, setBostaActionLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // BOSTA ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handleBostaAction = async (actionType) => {
    try {
      setBostaActionLoading(true);
      let res;
      
      switch (actionType) {
        case "create":
          res = await api.post(`/api/admin/shipping/bosta/deliveries/from-order/${order._id}`);
          toast.success(res.data?.message || t("Shipment created successfully"));
          break;
        case "refresh":
          res = await api.patch(`/api/admin/shipping/bosta/tracking/${order.bostaShipment._id}/refresh`);
          toast.success(res.data?.message || t("Tracking refreshed"));
          break;
        case "cancel":
          if (!window.confirm(t("Are you sure you want to cancel this shipment?"))) return;
          res = await api.put(`/api/admin/shipping/bosta/deliveries/${order.bostaShipment._id}/cancel`);
          toast.success(res.data?.message || t("Shipment cancelled"));
          break;
        case "label":
          res = await api.get(`/api/admin/shipping/bosta/label/${order.bostaShipment._id}`);
          if (res.data?.labelUrl) {
            window.open(res.data.labelUrl, "_blank");
            return;
          }
          break;
      }
      
      // Refresh the main table after a successful action to see the updated bostaShipment
      if (refetch) refetch();
      
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t("Action failed"));
    } finally {
      setBostaActionLoading(false);
    }
  };

  // Reset local state whenever the order changes
  useEffect(() => {
    if (order?._id) {
      setSelectedStatus(order.status || "pending");
      setStatusDescription("");
    }
  }, [order?._id]);

  if (!order) return null;

  const items = order.cartItems || [];
  const addr = order.shippingAddress;
  const isDelivery = order.orderType === "delivery";

  const statusStyles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    out_for_delivery: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    returned: "bg-orange-50 text-orange-700 border-orange-200",
    failed_to_deliver: "bg-rose-50 text-rose-700 border-rose-200",
    canceled: "bg-red-50 text-red-700 border-red-200",
    scheduled: "bg-teal-50 text-teal-700 border-teal-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const currentStatusStyle =
    statusStyles[order.status] || "bg-slate-50 text-slate-600 border-slate-200";

  // Total after all calculations (subtotal + shipping + service + tax - coupon)
  const totalAfterAll =
    (order.totalOrderPrice || 0) +
    (order.shippingPrice || 0) +
    (order.serviceFee || 0) +
    (order.taxAmount || 0) -
    (order.couponDiscount || 0);

  const selectOptions = (statusOptions || []).filter((opt) => opt.id !== "all");

  const hasStatusChanged = selectedStatus && selectedStatus !== order.status;

  const handleSaveStatus = () => {
    if (!hasStatusChanged) return;
    onUpdateStatus(order._id, selectedStatus, statusDescription.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <Package className="text-indigo-400" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  {t("Order Details")}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">
                  #{order._id?.slice(-6).toUpperCase()} •{" "}
                  {order.reference || "---"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status + Meta Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                {t("Status")}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${currentStatusStyle}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {t(order.status)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                {t("Order Type")}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 capitalize">
                <Truck size={13} className="text-indigo-500" />
                {t(order.orderType || "N/A")}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                {t("Payment Status")}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold capitalize ${
                  order.paymentStatus === "paid"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                <CreditCard size={13} />
                {t(order.paymentStatus || "N/A")}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                {t("Date")}
              </p>
              <span className="text-xs font-bold text-slate-800">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "---"}
              </span>
            </div>
          </div>

          {/* New Shipping Method block */}
          {(order.shippingMethod || order.shipmentType) && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm mt-4">
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <Truck size={15} className="text-slate-500" />
                {t("Shipping Information")}
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Method")}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${
                    (order.shippingMethod || order.shipmentType) === 'bosta' 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  }`}>
                    {(order.shippingMethod || order.shipmentType) === 'bosta' ? <Truck size={13} /> : <User size={13} />}
                    {t(order.shippingMethod || order.shipmentType)}
                  </span>
                </div>
                {(order.shippingMethod || order.shipmentType) === 'bosta' && order.bostaShipment && (
                  <>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{t("AWB / Tracking")}</span>
                      <span className="text-xs font-bold text-slate-800">{order.bostaShipment.awb || order.bostaShipment.trackingNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Courier Status")}</span>
                      <span className="text-xs font-bold text-slate-800">{order.bostaShipment.status || "N/A"}</span>
                    </div>
                    
                    {/* Bosta Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleBostaAction("refresh")}
                        disabled={bostaActionLoading}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={bostaActionLoading ? "animate-spin" : ""} />
                        {t("Sync Tracking")}
                      </button>
                      
                      <button 
                        onClick={() => handleBostaAction("label")}
                        disabled={bostaActionLoading || !order.bostaShipment.trackingNumber}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        <Package size={12} />
                        {t("Print Label")}
                      </button>
                      
                      <button 
                        onClick={() => handleBostaAction("cancel")}
                        disabled={bostaActionLoading || order.bostaShipment.status === "Cancelled"}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 sm:col-span-1 col-span-2"
                      >
                        <X size={12} />
                        {t("Cancel Shipment")}
                      </button>
                    </div>
                  </>
                )}
                
                {/* Create Shipment Button if Bosta method but no shipment yet */}
                {(order.shippingMethod || order.shipmentType) === 'bosta' && !order.bostaShipment && (
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <button 
                      onClick={() => handleBostaAction("create")}
                      disabled={bostaActionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50"
                    >
                      {bostaActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                      {t("Create Shipment in Bosta")}
                    </button>
                  </div>
                )}
                {(order.shippingMethod || order.shipmentType) === 'self' && order.selfShipment && (
                  <>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Delivery Man")}</span>
                      <span className="text-xs font-bold text-slate-800">{order.selfShipment.deliveryManId?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Phone")}</span>
                      <span className="text-xs font-bold text-slate-800" dir="ltr">{order.selfShipment.deliveryManId?.phone_number || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Status")}</span>
                      <span className="text-xs font-bold text-slate-800 capitalize">{t(order.selfShipment.status || "N/A")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status Update Section */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100">
            <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <RefreshCw size={15} className="text-indigo-500" />
              {t("Update Status")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  {t("Status")}
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  >
                    {selectOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  {t("Status Description")}{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    ({t("Optional")})
                  </span>
                </label>
                <input
                  type="text"
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  placeholder={t("e.g. Your Order is Processing")}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={!hasStatusChanged || updating}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                {updating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    {t("Updating...")}
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    {t("Save Changes")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Description (current) */}
          {order.statusDescription && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-indigo-900 leading-relaxed">
                {order.statusDescription}
              </p>
            </div>
          )}

          {/* Shipping Address (only for delivery) */}
          {isDelivery && addr && (
            <div>
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-indigo-500" />
                {t("Shipping Address")}
              </h4>

              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
                {/* Top row: City / Zone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-100">
                  <div className="p-4 flex items-start gap-3 border-b sm:border-b-0 sm:border-e border-slate-100">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        {t("City")}
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {addr.city || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <Package size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        {t("Zone")}
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {addr.zone || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                {(addr.details || addr.street) && (
                  <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <Info size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        {t("Address")}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                        {[addr.details, addr.street]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Building / Floor / Apartment / Identifier */}
                {(addr.buildingNumber ||
                  addr.floorNumber ||
                  addr.apartmentNumber ||
                  addr.uniqueIdentifier) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 rtl:divide-x-reverse">
                    {addr.buildingNumber != null && (
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t("Building")}
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {addr.buildingNumber}
                        </p>
                      </div>
                    )}
                    {addr.floorNumber != null && (
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t("Floor")}
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {addr.floorNumber}
                        </p>
                      </div>
                    )}
                    {addr.apartmentNumber != null && (
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t("Apartment")}
                        </p>
                        <p className="text-sm font-black text-slate-800">
                          {addr.apartmentNumber}
                        </p>
                      </div>
                    )}
                    {addr.uniqueIdentifier && (
                      <div className="p-3 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {t("Identifier")}
                        </p>
                        <p className="text-sm font-black text-slate-800 truncate">
                          {addr.uniqueIdentifier}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pickup Warehouse */}
          {!isDelivery && order.warehouse && (
            <div>
              <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <Package size={15} className="text-indigo-500" />
                {t("Pickup Warehouse")}
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-700">
                {typeof order.warehouse === "object"
                  ? order.warehouse.name
                  : order.warehouse}
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingBag size={15} className="text-indigo-500" />
              {t("Order Items")}{" "}
              <span className="text-xs font-bold text-slate-400">
                ({items.length})
              </span>
            </h4>

            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const product =
                    typeof item.product === "object" ? item.product : null;
                  const qty = item.quantity || 0;
                  const price = item.price || 0;

                  return (
                    <div
                      key={item._id || idx}
                      className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center justify-between transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200/60 bg-white p-1 shrink-0">
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
                              <Package size={20} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {product?.fullName ||
                              product?.name ||
                              t("Unnamed Product")}
                          </p>
                          {/* Variations */}
                          {item.options?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {t("Variants")}:
                              </span>
                              {item.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-500 font-medium mt-1.5">
                            {t("Qty")}:{" "}
                            <span className="font-bold text-slate-800">
                              {qty}
                            </span>{" "}
                            × {price.toLocaleString()} {t("EGP")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                          {t("Total")}
                        </p>
                        <p className="text-base font-black text-indigo-600">
                          {(price * qty).toLocaleString()}{" "}
                          <span className="text-[10px] text-slate-500 font-normal">
                            {t("EGP")}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <Info className="text-slate-300" size={28} />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">
                  {t("No items found")}
                </h4>
              </div>
            )}
          </div>

          {/* Payment Method + Proof */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                {t("Payment Method")}
              </p>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                  <CreditCard size={14} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {isArabic
                    ? order.paymentMethod?.ar_name || order.paymentMethod?.name
                    : order.paymentMethod?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  ({order.paymentGateway})
                </span>
              </div>
            </div>

            {order.proofImage && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                  {t("Payment Proof")}
                </p>
                <a
                  href={order.proofImage}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 hover:scale-105 transition-transform"
                >
                  <img
                    src={order.proofImage}
                    alt="proof"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </a>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard size={15} className="text-indigo-500" />
              {t("Financial Summary")}
            </h4>
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <Row
                label={t("Subtotal")}
                value={`${(order.totalOrderPrice || 0).toLocaleString()} ${t("EGP")}`}
              />
              <Row
                label={t("Shipping Price")}
                value={`${(order.shippingPrice || 0).toLocaleString()} ${t("EGP")}`}
              />
              <Row
                label={t("Service Fee")}
                value={`${(order.serviceFee || 0).toLocaleString()} ${t("EGP")}`}
              />
              <Row
                label={t("Tax Amount")}
                value={`${(order.taxAmount || 0).toLocaleString()} ${t("EGP")}`}
              />
              {order.couponDiscount > 0 && (
                <Row
                  label={t("Coupon Discount")}
                  value={`- ${(order.couponDiscount || 0).toLocaleString()} ${t("EGP")}`}
                  valueClass="text-emerald-600"
                />
              )}
              <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t("Total")}
                </span>
                <span className="text-base font-black">
                  {totalAfterAll.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal opacity-70">
                    {t("EGP")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs shadow-lg shadow-slate-900/10 active:scale-95"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentEco = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    data: responseData,
    loading,
    refetch,
  } = useGet("/api/admin/online-orders");
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Keep selectedOrder in sync with the fresh data from the list
  // This ensures that after a status update (PATCH), we use the FULL order
  // from GET response, not the minimal order returned by PATCH
  useEffect(() => {
    if (!selectedOrder?._id) return;
    if (!responseData?.orders) return;

    const freshOrder = responseData.orders.find(
      (o) => o._id === selectedOrder._id,
    );

    if (freshOrder) {
      setSelectedOrder(freshOrder);
    }
  }, [responseData]);

  // قائمة الحالات الكاملة من الصورة
  const statusOptions = [
    {
      id: "all",
      label: t("All Statuses"),
      icon: Filter,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      id: "pending",
      label: t("Pending"),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "confirmed",
      label: t("Confirmed"),
      icon: Check,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "processing",
      label: t("Processing"),
      icon: Loader2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "out_for_delivery",
      label: t("Out for Delivery"),
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      id: "delivered",
      label: t("Delivered"),
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "returned",
      label: t("Returned"),
      icon: RotateCcw,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      id: "failed_to_deliver",
      label: t("Failed to Deliver"),
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      id: "canceled",
      label: t("Canceled"),
      icon: X,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      id: "scheduled",
      label: t("Scheduled"),
      icon: Calendar,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      id: "rejected",
      label: t("Rejected"),
      icon: X,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const displayData = useMemo(() => {
    if (!responseData?.orders) return [];
    if (activeTab === "all") return responseData.orders;
    return responseData.orders.filter((order) => order.status === activeTab);
  }, [responseData, activeTab]);

  const getStatusCount = (status) => {
    if (!responseData?.orders) return 0;
    if (status === "all") return responseData.orders.length;
    return responseData.orders.filter((order) => order.status === status)
      .length;
  };

  const updateOrderStatus = async (id, newStatus, statusDescription = "") => {
    try {
      setUpdating(true);
      const res = await api.patch(`/api/admin/online-orders/${id}/status`, {
        status: newStatus,
        statusDescription,
      });
      if (res.data?.success) {
        toast.success(res.data?.message || t("Status updated successfully"));
        // Just refetch — the useEffect above will pick up the fresh FULL order
        // and update selectedOrder from the list (keeping products/warehouse/etc.)
        refetch();
      } else {
        toast.error(res.data?.message || t("Failed to update status"));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || t("Request failed"),
      );
    } finally {
      setUpdating(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "_id",
        header: t("Order ID"),
        render: (val) => (
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">
            #{val?.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        key: "totalPriceAfterDiscount",
        header: t("Amount"),
        render: (_, item) => {
          // Total with all calculations applied
          const total =
            (item.totalOrderPrice || 0) +
            (item.shippingPrice || 0) +
            (item.serviceFee || 0) +
            (item.taxAmount || 0) -
            (item.couponDiscount || 0);

          return (
            <span className="font-black text-slate-900 text-sm">
              {total.toLocaleString()}{" "}
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                {t("EGP")}
              </span>
            </span>
          );
        },
      },
      {
        key: "orderType",
        header: t("Order Type"),
        render: (_, item) => {
          const isDelivery = item.orderType === "delivery";
          const addr = item.shippingAddress;
          const fullAddress = [addr?.details, addr?.zone, addr?.city]
            .filter(Boolean)
            .join(", ");

          return (
            <div className="flex flex-col gap-1 max-w-[200px]">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold w-fit capitalize ${
                  isDelivery
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Truck size={12} />
                {t(item.orderType || "N/A")}
              </span>

              {isDelivery && fullAddress && (
                <div className="flex items-start gap-1 text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                  <MapPin
                    size={12}
                    className="text-slate-400 shrink-0 mt-0.5"
                  />
                  <span className="truncate" title={fullAddress}>
                    {fullAddress}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "shippingMethod",
        header: t("Shipping"),
        render: (_, item) => {
          const method = item.shippingMethod || item.shipmentType;
          if (method === "bosta") {
            return (
              <div className="flex flex-col gap-1 w-fit">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-200/60 shadow-sm">
                  <Truck size={11} className="text-orange-500" />
                  Bosta
                </span>
                {item.bostaShipment && (
                  <span className="text-[9px] text-slate-500 font-bold tracking-tight px-1 truncate max-w-[120px]" title={item.bostaShipment.awb || item.bostaShipment.trackingNumber}>
                    {t("AWB")}: {item.bostaShipment.awb || item.bostaShipment.trackingNumber || "N/A"}
                  </span>
                )}
              </div>
            );
          }
          if (method === "self") {
            return (
              <div className="flex flex-col gap-1 w-fit">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-sm">
                  <User size={11} className="text-indigo-500" />
                  Self Delivery
                </span>
                {item.selfShipment?.deliveryManId && (
                  <span className="text-[9px] text-slate-500 font-bold tracking-tight px-1 truncate max-w-[120px]" title={item.selfShipment.deliveryManId.name}>
                    {item.selfShipment.deliveryManId.name}
                  </span>
                )}
              </div>
            );
          }
          
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200/50 shadow-sm">
              {t("Pending")}
            </span>
          );
        },
      },
      {
        key: "paymentMethod",
        header: t("Payment Method"),
        render: (method) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50/80 text-indigo-600 rounded-lg border border-indigo-100">
              <CreditCard size={14} />
            </div>
            <span className="text-xs text-slate-700 font-semibold truncate max-w-[130px]">
              {isArabic ? method?.ar_name || method?.name : method?.name}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: t("Status"),
        render: (status) => {
          const styles = {
            pending:
              "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10",
            confirmed:
              "bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10",
            processing:
              "bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10",
            out_for_delivery:
              "bg-purple-50 text-purple-700 border-purple-200/60 ring-purple-500/10",
            delivered:
              "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10",
            returned:
              "bg-orange-50 text-orange-700 border-orange-200/60 ring-orange-500/10",
            failed_to_deliver:
              "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10",
            canceled:
              "bg-red-50 text-red-700 border-red-200/60 ring-red-500/10",
            scheduled:
              "bg-teal-50 text-teal-700 border-teal-200/60 ring-teal-500/10",
            refund:
              "bg-cyan-50 text-cyan-700 border-cyan-200/60 ring-cyan-500/10",
            rejected:
              "bg-red-50 text-red-700 border-red-200/60 ring-red-500/10",
          };

          const currentStyle =
            styles[status] || "bg-slate-50 text-slate-600 border-slate-200";

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold capitalize tracking-wide border ring-1 ${currentStyle}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {t(status)}
            </span>
          );
        },
      },
      {
        key: "cartItems",
        header: t("Details"),
        render: (_, item) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(item);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-sm active:scale-95 group"
          >
            <Eye
              size={13}
              className="group-hover:scale-110 transition-transform text-indigo-300"
            />
            {t("View Details")}
          </button>
        ),
      },
      {
        key: "createdAt",
        header: t("Date"),
        render: (date) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">
              {date ? new Date(date).toLocaleDateString() : "---"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {date
                ? new Date(date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        ),
      },
    ],
    [t, isArabic],
  );

  return (
    <div className="p-6 md:p-8 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & KPI Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 ">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {t("Online Orders")}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              {t("Track, filter, and manage your web store orders effectively")}
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  {t("Total")}
                </p>
                <p className="text-base font-black text-slate-900">
                  {getStatusCount("all")}
                </p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  {t("Pending")}
                </p>
                <p className="text-base font-black text-slate-900">
                  {getStatusCount("pending")}
                </p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  {t("Delivered")}
                </p>
                <p className="text-base font-black text-slate-900">
                  {getStatusCount("delivered")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Dropdown Filter Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {t("Filter Status:")}
            </span>

            <div className="relative w-full md:w-64">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({getStatusCount(opt.id)})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Quick Filter Buttons for Fast Access */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
            {statusOptions.slice(0, 5).map((opt) => {
              const Icon = opt.icon;
              const isActive = activeTab === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveTab(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={13}
                    className={isActive ? "text-indigo-400" : opt.color}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Data Container */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200/60 shadow-sm flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-3">
            <DataTable
              data={displayData}
              columns={columns}
              title={`${t(statusOptions.find((o) => o.id === activeTab)?.label || "Orders")}`}
              showActions={false}
              moduleName={AppModules.PAYMENT}
            />
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <FinancialsModal
        order={selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        statusOptions={statusOptions}
        onUpdateStatus={updateOrderStatus}
        updating={updating}
        refetch={refetch}
      />
    </div>
  );
};

export default PaymentEco;
