// src/Pages/Shipping/BostaAdvancedModal.jsx
import { useState, useEffect } from "react";
import { MapPin, Package, Save, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
          {/* ═══════════════ Pickup Address ═══════════════ */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} />
              {t("Pickup_Address") || "Pickup Address"}
            </h3>

            {/* Name Row */}
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

          {/* ═══════════════ Package Defaults ═══════════════ */}
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
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("Cancel") || "Cancel"}
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="me-2 animate-spin" />
                {t("Saving") || "Saving..."}
              </>
            ) : (
              <>
                <Save size={15} className="me-2" />
                {t("Save_Advanced") || "Save Advanced"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BostaAdvancedModal;
