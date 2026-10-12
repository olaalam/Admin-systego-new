import { useEffect, useState } from "react";
import {
  X,
  Truck,
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  DollarSign,
  Weight,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

const CreateBostaShipmentModal = ({ open, onClose, order, onCreated }) => {
  const { t } = useTranslation();

  // ─── Bosta lookup ───
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // ─── Settings ───
  const [settings, setSettings] = useState(null);

  // ─── Form ───
  const [form, setForm] = useState({
    cityId: "",
    cityName: "",
    districtId: "",
    zoneId: "",
    firstLine: "",
    secondLine: "",
    buildingNumber: "",
    floor: "",
    apartment: "",
    cod: 0,
    weight: 1,
    notes: "",
    allowToOpenPackage: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // Load Shipping Settings
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open) return;
    api
      .get("/api/admin/shipping/settings")
      .then((res) => {
        const s = res.data?.data?.settings || res.data?.settings;
        setSettings(s);
      })
      .catch(() => setSettings(null));
  }, [open]);

  // ═══════════════════════════════════════════════════════════
  // Prefill from order + settings
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open || !order) return;

    const addr = order.shippingAddress || {};
    const total =
      (order.totalOrderPrice || 0) +
      (order.shippingPrice || 0) +
      (order.serviceFee || 0) +
      (order.taxAmount || 0) -
      (order.couponDiscount || 0);

    const isPaid = order.paymentStatus === "paid";
    const codAmount = isPaid ? 0 : Math.max(0, total);

    const hasBostaAddress = !!(
      addr.bostaCityId &&
      addr.bostaZoneId &&
      addr.bostaDistrictId
    );

    setForm({
      cityId: addr.bostaCityId || "",
      cityName: addr.bostaCityName || "",
      districtId: addr.bostaDistrictId || "",
      zoneId: addr.bostaZoneId || "",
      firstLine: addr.details || addr.street || "",
      secondLine: "",
      buildingNumber: String(addr.buildingNumber || ""),
      floor: String(addr.floorNumber || ""),
      apartment: String(addr.apartmentNumber || ""),
      cod: codAmount,
      weight: settings?.bosta?.defaults?.weight || 1,
      notes: `Order #${order.reference || order._id?.slice(-6)}`,
      allowToOpenPackage: true,
    });

    if (hasBostaAddress && addr.bostaCityId) {
      setLoadingDistricts(true);
      api
        .get(`/api/admin/shipping/bosta/districts/${addr.bostaCityId}`)
        .then((res) => {
          const list =
            res.data?.data?.districts ||
            res.data?.districts ||
            res.data?.data ||
            [];
          setDistricts(list);
        })
        .catch(() => setDistricts([]))
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
    }
  }, [open, order, settings]);

  // ═══════════════════════════════════════════════════════════
  // Load Cities
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open) return;
    setLoadingCities(true);
    api
      .get("/api/admin/shipping/bosta/cities")
      .then((res) => {
        const list =
          res.data?.data?.cities || res.data?.cities || res.data?.data || [];
        setCities(list);
      })
      .catch(() => {
        toast.error(t("Failed to load Bosta cities"));
        setCities([]);
      })
      .finally(() => setLoadingCities(false));
  }, [open]);

  // ═══════════════════════════════════════════════════════════
  // Load Districts when city changes
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!form.cityId || districts.length > 0) return;
    setLoadingDistricts(true);
    api
      .get(`/api/admin/shipping/bosta/districts/${form.cityId}`)
      .then((res) => {
        const list =
          res.data?.data?.districts ||
          res.data?.districts ||
          res.data?.data ||
          [];
        setDistricts(list);
      })
      .catch(() => {
        toast.error(t("Failed to load Bosta districts"));
        setDistricts([]);
      })
      .finally(() => setLoadingDistricts(false));
  }, [form.cityId]);

  // ═══════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════
  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleCityChange = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    setForm((prev) => ({
      ...prev,
      cityId,
      cityName: city?.name || "",
      districtId: cityId !== prev.cityId ? "" : prev.districtId,
      zoneId: cityId !== prev.cityId ? "" : prev.zoneId,
    }));
    if (cityId !== form.cityId) {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (districtId) => {
    const district = districts.find((d) => d.districtId === districtId);
    setForm((prev) => ({
      ...prev,
      districtId,
      zoneId: district?.zoneId || "",
    }));
  };

  // ═══════════════════════════════════════════════════════════
  // Submit — Delivery Only
  // ═══════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    if (!form.cityId) return toast.error(t("Please select a city"));
    if (!form.districtId) return toast.error(t("Please select a district"));
    if (!form.firstLine?.trim())
      return toast.error(t("Address line is required"));

    setSubmitting(true);
    try {
      const payload = {
        order_id: order._id,
        dropOffAddress: {
          city:
            form.cityName || cities.find((c) => c._id === form.cityId)?.name,
          zoneId: form.zoneId,
          districtId: form.districtId,
          firstLine: form.firstLine.trim(),
          secondLine: form.secondLine?.trim() || "",
          buildingNumber: String(form.buildingNumber || ""),
          floor: String(form.floor || ""),
          apartment: String(form.apartment || ""),
        },
        cod: Number(form.cod) || 0,
        weight: Number(form.weight) || 1,
        notes: form.notes?.trim() || undefined,
        allowToOpenPackage: form.allowToOpenPackage,
      };

      const shipRes = await api.post(
        "/api/admin/shipping/bosta/deliveries/from-order",
        payload,
      );

      const trackingNumber =
        shipRes.data?.data?.shipment?.trackingNumber || "—";

      toast.success(
        t("Shipment created successfully") + " • AWB: " + trackingNumber,
      );

      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          t("Failed to create shipment"),
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
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("Create Bosta Shipment")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("Order")} #{order?._id?.slice(-6).toUpperCase()} •{" "}
                {order?.reference}
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
          {/* Receiver */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
              {t("Receiver")}
            </p>
            <p className="text-sm font-bold text-slate-900">
              {order?.user?.name || order?.customer?.name || "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5" dir="ltr">
              {order?.user?.phone_number ||
                order?.customer?.phone_number ||
                "—"}
            </p>
          </div>

          {/* Drop-off Address */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} />
              {t("Drop-off Address")}
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t("City")} *
                </label>
                <select
                  value={form.cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={loadingCities}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 cursor-pointer disabled:opacity-50"
                >
                  <option value="">
                    {loadingCities ? t("Loading...") : t("Select City")}
                  </option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.nameAr ? `— ${c.nameAr}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t("District")} *
                </label>
                <select
                  value={form.districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!form.cityId || loadingDistricts}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 cursor-pointer disabled:opacity-50"
                >
                  <option value="">
                    {!form.cityId
                      ? t("Select city first")
                      : loadingDistricts
                        ? t("Loading...")
                        : t("Select District")}
                  </option>
                  {districts.map((d, idx) => (
                    <option key={`${d.districtId}-${idx}`} value={d.districtId}>
                      {d.districtOtherName || d.districtName} —{" "}
                      {d.zoneOtherName || d.zoneName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                {t("Address Line")} *
              </label>
              <input
                type="text"
                value={form.firstLine}
                onChange={(e) => update("firstLine", e.target.value)}
                placeholder={t("Street name, area, landmark")}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t("Building")}
                </label>
                <input
                  type="text"
                  value={form.buildingNumber}
                  onChange={(e) => update("buildingNumber", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t("Floor")}
                </label>
                <input
                  type="text"
                  value={form.floor}
                  onChange={(e) => update("floor", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t("Apartment")}
                </label>
                <input
                  type="text"
                  value={form.apartment}
                  onChange={(e) => update("apartment", e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={14} />
              {t("Package Details")}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <DollarSign size={11} />
                  {t("COD Amount")} ({t("EGP")})
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.cod}
                  onChange={(e) => update("cod", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {t("0 = no cash collection")}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Weight size={11} />
                  {t("Weight (kg)")}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => update("weight", Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 mt-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t("Allow opening the package")}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {t("Customer can inspect before paying")}
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.allowToOpenPackage}
                onChange={(e) => update("allowToOpenPackage", e.target.checked)}
                className="w-5 h-5 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
              <FileText size={11} />
              {t("Notes")}
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>

          {/* Info — Pickup Auto Notice */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-[11px] text-emerald-900 font-bold mb-0.5">
                {t("Auto Pickup Enabled")}
              </p>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                {t(
                  "Pickup is handled automatically. Your shipment will be collected at the scheduled daily pickup. No manual pickup needed for each order.",
                )}
              </p>
            </div>
          </div>
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
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition flex items-center gap-1.5 active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("Creating...")}
              </>
            ) : (
              <>
                <Truck size={13} />
                {t("Create Shipment")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBostaShipmentModal;
