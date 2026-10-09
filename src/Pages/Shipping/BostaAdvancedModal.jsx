// src/Pages/Shipping/BostaAdvancedModal.jsx
import { useState, useEffect } from "react";
import {
  MapPin,
  Package,
  Save,
  Loader2,
  Building2,
  RefreshCw,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api/api";

const BostaAdvancedModal = ({
  open,
  onOpenChange,
  form,
  setForm,
  onSave,
  saving,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // ✅ Cities + Districts
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // 🆕 Pickup Locations
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // 🆕 Sync state
  const [syncing, setSyncing] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // Load Cities
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!open || !form.apiKey) return;

    setLoadingCities(true);
    api
      .get("/api/admin/shipping/bosta/cities")
      .then((res) => {
        if (res.data?.success) {
          setCities(res.data.data.cities || []);
        }
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [open, form.apiKey]);

  // ═══════════════════════════════════════════════════════════
  // Load Districts
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const cityId = form.pickup.cityId;
    if (!cityId || !open) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    api
      .get(`/api/admin/shipping/bosta/districts/${cityId}`)
      .then((res) => {
        if (res.data?.success) {
          setDistricts(res.data.data.districts || []);
        }
      })
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [form.pickup.cityId, open]);

  // ═══════════════════════════════════════════════════════════
  // 🆕 Load Pickup Locations
  // ═══════════════════════════════════════════════════════════
  const fetchPickupLocations = () => {
    if (!open) return;
    setLoadingLocations(true);
    api
      .get("/api/admin/shipping/bosta/pickup-locations")
      .then((res) => {
        const list = res.data?.data?.locations || res.data?.locations || [];
        setPickupLocations(list);
      })
      .catch(() => setPickupLocations([]))
      .finally(() => setLoadingLocations(false));
  };

  // ✅ Auto-load when modal opens
  useEffect(() => {
    if (!open || !form.apiKey) return;
    fetchPickupLocations();
  }, [open, form.apiKey]);

  // ═══════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════
  const updatePickup = (field, value) =>
    setForm({
      ...form,
      pickup: { ...form.pickup, [field]: value },
    });

  const updateDefaults = (field, value) =>
    setForm({
      ...form,
      defaults: { ...form.defaults, [field]: value },
    });

  const handleCityChange = (cityId) => {
    const selectedCity = cities.find((c) => c._id === cityId);
    setForm({
      ...form,
      pickup: {
        ...form.pickup,
        cityId,
        city: selectedCity?.name || "",
        districtId: "",
        zoneId: "",
      },
    });
    setDistricts([]);
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = districts.find((d) => d.districtId === districtId);
    setForm({
      ...form,
      pickup: {
        ...form.pickup,
        districtId,
        zoneId: selectedDistrict?.zoneId || "",
      },
    });
  };

  // 🆕 Select Location
  const handleSelectLocation = (locationId) => {
    updatePickup("businessLocationId", locationId);
  };

  // ═══════════════════════════════════════════════════════════
  // 🆕 Save + Sync Pickup Location
  // ═══════════════════════════════════════════════════════════
  const handleSaveAndSync = async () => {
    setSyncing(true);
    try {
      // 1️⃣ احفظ الإعدادات
      await onSave();

      // 2️⃣ استنى شوية عشان الإعدادات تتحدّث في الـ DB
      await new Promise((r) => setTimeout(r, 500));

      // 3️⃣ Sync الـ Pickup Location في Bosta
      const res = await api.post(
        "/api/admin/shipping/bosta/pickup-locations/sync",
      );

      if (res.data?.success) {
        toast.success(
          res.data.data.message || "✅ Pickup location synced with Bosta",
        );
        fetchPickupLocations();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t("Failed to sync pickup location with Bosta"),
      );
    } finally {
      setSyncing(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("Bosta_Advanced_Settings") || "Bosta Advanced Settings"}
          </DialogTitle>
          <DialogDescription>
            {t("Configure_pickup_and_defaults") ||
              "Configure pickup address and package defaults"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ═══════════════════════════════════════════════════════
              📍 Business Pickup Location
          ═══════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} />
                {t("Business Pickup Location") || "Business Pickup Location"}
              </h3>
              <button
                type="button"
                onClick={fetchPickupLocations}
                disabled={loadingLocations}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition disabled:opacity-50"
              >
                <RefreshCw
                  size={11}
                  className={loadingLocations ? "animate-spin" : ""}
                />
                {t("Refresh") || "Refresh"}
              </button>
            </div>

            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              {t(
                "Select which pickup location Bosta drivers should come to. This is where all shipments will be collected from.",
              ) ||
                "Select which pickup location Bosta drivers should come to. This is where all shipments will be collected from."}
            </p>

            {loadingLocations ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
            ) : pickupLocations.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <p className="text-xs font-bold text-amber-900 mb-1">
                  {t("No pickup locations found") ||
                    "No pickup locations found"}
                </p>
                <p className="text-[10px] text-amber-700">
                  {t(
                    "Add your address below and click 'Save & Set as Default' to create one automatically.",
                  ) ||
                    "Add your address below and click 'Save & Set as Default' to create one automatically."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pickupLocations.map((loc) => {
                  const isSelected = form.pickup.businessLocationId === loc._id;

                  return (
                    <button
                      key={loc._id}
                      type="button"
                      onClick={() => handleSelectLocation(loc._id)}
                      className={`w-full p-4 rounded-xl border-2 text-start transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 size={12} className="text-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-900">
                                {loc.locationName}
                              </p>
                              {loc.isDefault && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  DEFAULT
                                </span>
                              )}
                            </div>

                            {loc.address && (
                              <p className="text-[11px] text-gray-500 mt-1 truncate">
                                {loc.address.city?.name || ""}
                                {loc.address.zone?.name
                                  ? ` — ${loc.address.zone.name}`
                                  : ""}
                                {loc.address.district?.name
                                  ? ` — ${loc.address.district.name}`
                                  : ""}
                              </p>
                            )}

                            {loc.address?.firstLine && (
                              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                {loc.address.firstLine}
                              </p>
                            )}

                            {loc.contactPerson?.phone && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1.5">
                                <Phone size={10} />
                                <span dir="ltr">{loc.contactPerson.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
              📍 Pickup Address
          ═══════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} />
              {t("Pickup_Address") || "Pickup Address"}
            </h3>

            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("First_Name") || "First Name"}
                </Label>
                <Input
                  value={form.pickup.firstName}
                  onChange={(e) => updatePickup("firstName", e.target.value)}
                  placeholder="Store"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Last_Name") || "Last Name"}
                </Label>
                <Input
                  value={form.pickup.lastName}
                  onChange={(e) => updatePickup("lastName", e.target.value)}
                />
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Phone") || "Phone"}
                </Label>
                <Input
                  value={form.pickup.phone}
                  onChange={(e) => updatePickup("phone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Email") || "Email"}
                </Label>
                <Input
                  type="email"
                  value={form.pickup.email}
                  onChange={(e) => updatePickup("email", e.target.value)}
                />
              </div>
            </div>

            {/* City + District */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("City") || "City"} *
                </Label>
                <Select
                  value={form.pickup.cityId}
                  onValueChange={handleCityChange}
                  disabled={loadingCities}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingCities
                          ? t("Loading") || "Loading..."
                          : t("Select_City") || "Select City"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city._id} value={city._id}>
                        {city.name} — {city.nameAr || city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("District") || "District"} *
                </Label>
                <Select
                  value={form.pickup.districtId}
                  onValueChange={handleDistrictChange}
                  disabled={!form.pickup.cityId || loadingDistricts}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !form.pickup.cityId
                          ? t("Select_City_First") || "Select city first"
                          : loadingDistricts
                            ? t("Loading") || "Loading..."
                            : t("Select_District") || "Select District"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {districts.map((d, idx) => (
                      <SelectItem
                        key={`${d.districtId}-${idx}`}
                        value={d.districtId}
                        textValue={`${d.districtOtherName || d.districtName} — ${d.zoneOtherName || d.zoneName}`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium text-sm">
                            {d.districtOtherName || d.districtName}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {d.zoneOtherName || d.zoneName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Line */}
            <div className="mb-3">
              <Label className="text-xs mb-1.5 block">
                {t("Address_Line") || "Address Line"}
              </Label>
              <Input
                value={form.pickup.firstLine}
                onChange={(e) => updatePickup("firstLine", e.target.value)}
                placeholder="Street name"
              />
            </div>

            {/* Building / Floor / Apartment */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Building") || "Building"}
                </Label>
                <Input
                  value={form.pickup.buildingNumber}
                  onChange={(e) =>
                    updatePickup("buildingNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Floor") || "Floor"}
                </Label>
                <Input
                  value={form.pickup.floor}
                  onChange={(e) => updatePickup("floor", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Apartment") || "Apt"}
                </Label>
                <Input
                  value={form.pickup.apartment}
                  onChange={(e) => updatePickup("apartment", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              📦 Package Defaults
          ═══════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={14} />
              {t("Package_Defaults") || "Package Defaults"}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Package_Type") || "Package Type"}
                </Label>
                <Select
                  value={form.defaults.packageType}
                  onValueChange={(val) => updateDefaults("packageType", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parcel">Parcel</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothes">Clothes</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Size") || "Size"}
                </Label>
                <Select
                  value={form.defaults.size}
                  onValueChange={(val) => updateDefaults("size", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">Small</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LARGE">Large</SelectItem>
                    <SelectItem value="XLARGE">X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Weight_kg") || "Weight (kg)"}
                </Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.defaults.weight}
                  onChange={(e) =>
                    updateDefaults("weight", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t("Items_Count") || "Items Count"}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={form.defaults.itemsCount}
                  onChange={(e) =>
                    updateDefaults("itemsCount", Number(e.target.value))
                  }
                />
              </div>
            </div>

            {/* COD */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t("Enable_COD") || "Enable Cash on Delivery"}
                </p>
                <p className="text-xs text-gray-500">
                  {t("Allow_COD") || "Allow COD for orders"}
                </p>
              </div>
              <Switch
                dir={isRTL ? "rtl" : "ltr"}
                checked={form.codEnabled}
                onCheckedChange={(val) => setForm({ ...form, codEnabled: val })}
              />
            </div>
          </div>

          {/* 🆕 Info banner */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
            <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
              {t(
                "When you click 'Save & Set as Default', the system will automatically create or update this pickup location in Bosta and mark it as default.",
              ) ||
                "When you click 'Save & Set as Default', the system will automatically create or update this pickup location in Bosta and mark it as default."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving || syncing}
          >
            {t("Cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSaveAndSync}
            disabled={saving || syncing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving || syncing ? (
              <>
                <Loader2 size={15} className="me-2 animate-spin" />
                {syncing
                  ? t("Syncing...") || "Syncing..."
                  : t("Saving...") || "Saving..."}
              </>
            ) : (
              <>
                <Save size={15} className="me-2" />
                {t("Save_And_Set_Default") || "Save & Set as Default"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BostaAdvancedModal;
