import { useEffect, useState } from "react";
import { X, MapPin, Loader2, CheckCircle2, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "@/api/api";

const SetBostaAddressModal = ({ open, onClose, order, onSaved }) => {
  const { t } = useTranslation();

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    zoneId: "",
    zoneName: "",
    firstLine: "",
    buildingNumber: "",
    floorNumber: "",
    apartmentNumber: "",
  });

  // ═══════════════════════════════════════════════════════════
  // Prefill from order
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open || !order) return;

    const addr = order.shippingAddress || {};

    setForm({
      cityId: addr.bostaCityId || "",
      cityName: addr.bostaCityName || "",
      districtId: addr.bostaDistrictId || "",
      districtName: addr.bostaDistrictName || "",
      zoneId: addr.bostaZoneId || "",
      zoneName: addr.bostaZoneName || "",
      firstLine: addr.details || addr.street || "",
      buildingNumber: String(addr.buildingNumber || ""),
      floorNumber: String(addr.floorNumber || ""),
      apartmentNumber: String(addr.apartmentNumber || ""),
    });

    setDistricts([]);
  }, [open, order]);

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
        toast.error(t("Failed to load cities"));
        setCities([]);
      })
      .finally(() => setLoadingCities(false));
  }, [open, t]);

  // ═══════════════════════════════════════════════════════════
  // Load Districts when city changes
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!form.cityId) {
      setDistricts([]);
      return;
    }

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
        toast.error(t("Failed to load districts"));
        setDistricts([]);
      })
      .finally(() => setLoadingDistricts(false));
  }, [form.cityId, t]);

  // ═══════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════
  const handleCityChange = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    setForm((prev) => ({
      ...prev,
      cityId,
      cityName: city?.name || "",
      districtId: "",
      districtName: "",
      zoneId: "",
      zoneName: "",
    }));
    setDistricts([]);
  };

  const handleDistrictChange = (districtId) => {
    const district = districts.find((d) => d.districtId === districtId);
    setForm((prev) => ({
      ...prev,
      districtId,
      districtName: district?.districtOtherName || district?.districtName || "",
      zoneId: district?.zoneId || "",
      zoneName: district?.zoneOtherName || district?.zoneName || "",
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!form.cityId) return toast.error(t("Please select a city"));
    if (!form.districtId) return toast.error(t("Please select a district"));
    if (!form.firstLine?.trim())
      return toast.error(t("Address line is required"));

    setSaving(true);
    try {
      // ✅ نحدّث الأوردر — نضيف Bosta fields للـ shippingAddress
      const res = await api.patch(
        `/api/admin/online-orders/${order._id}/bosta-address`,
        {
          bostaCityId: form.cityId,
          bostaCityName: form.cityName,
          bostaDistrictId: form.districtId,
          bostaDistrictName: form.districtName,
          bostaZoneId: form.zoneId,
          bostaZoneName: form.zoneName,
          firstLine: form.firstLine.trim(),
          buildingNumber: form.buildingNumber,
          floorNumber: form.floorNumber,
          apartmentNumber: form.apartmentNumber,
        },
      );

      toast.success(res.data?.message || t("Address saved successfully"));
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          t("Failed to save address"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[400] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("Set Bosta Address")}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                #{order?._id?.slice(-6).toUpperCase()} • {order?.reference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
            <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
              {t(
                "This order was created without a Bosta address. Set it now to enable shipment creation.",
              )}
            </p>
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Address Line */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
              {t("Address Line")} *
            </label>
            <input
              type="text"
              value={form.firstLine}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, firstLine: e.target.value }))
              }
              placeholder={t("Street name, area, landmark")}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>

          {/* Building / Floor / Apt */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                {t("Building")}
              </label>
              <input
                type="text"
                value={form.buildingNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    buildingNumber: e.target.value,
                  }))
                }
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                {t("Floor")}
              </label>
              <input
                type="text"
                value={form.floorNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, floorNumber: e.target.value }))
                }
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                {t("Apartment")}
              </label>
              <input
                type="text"
                value={form.apartmentNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    apartmentNumber: e.target.value,
                  }))
                }
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 transition flex items-center gap-1.5 active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {t("Saving...")}
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                {t("Save Address")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetBostaAddressModal;
