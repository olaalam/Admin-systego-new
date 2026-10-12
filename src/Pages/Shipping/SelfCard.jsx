// src/Pages/Shipping/SelfCard.jsx
import { Truck, Save, MapPin, Check, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelfCard = ({ form, setForm, onSave, saving, onlineWarehouse }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* ═══════ Header ═══════ */}
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {t("Self_Shipping") || "Self Shipping"}
              </h3>
              <p className="text-xs text-gray-500">
                {t("Own_team") || "Own delivery team"}
              </p>
            </div>
          </div>
          <Switch
            dir={isRTL ? "rtl" : "ltr"}
            checked={form.enabled}
            onCheckedChange={(val) => setForm({ ...form, enabled: val })}
          />
        </div>
      </div>

      {/* ═══════ Body ═══════ */}
      <div
        className={`p-5 space-y-4 flex-1 ${
          !form.enabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Delivery Method */}
        <div>
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
            {t("Delivery_Method") || "Delivery Method"} *
          </Label>
          <Select
            value={form.method}
            onValueChange={(val) => setForm({ ...form, method: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zone">
                {t("Area_Shipping") || "Area Shipping"}
              </SelectItem>
              <SelectItem value="flat_rate">
                {t("Flat_Rate") || "Flat Rate"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flat Rate (conditional) */}
        {form.method === "flat_rate" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
              {t("Flat_Rate_Amount") || "Flat Rate Amount"} *
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                value={form.flatRate}
                onChange={(e) =>
                  setForm({ ...form, flatRate: Number(e.target.value) })
                }
                className="pe-12"
                placeholder="0.00"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                EGP
              </span>
            </div>
          </div>
        )}

        {/* ═══════ Pickup Warehouse Info ═══════ */}
        <div className="pt-3 border-t border-gray-100">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin size={12} />
            {t("Pickup_Source") || "Pickup Source"}
          </Label>

          {onlineWarehouse ? (
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-start gap-2">
                <Check
                  size={14}
                  className="text-green-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-green-900 truncate">
                    {onlineWarehouse.name}
                  </p>
                  <p className="text-[10px] text-green-700 truncate mt-0.5">
                    {onlineWarehouse.address}
                  </p>
                </div>
              </div>

              {/* ✅ زرار Change */}
              <button
                onClick={() => navigate("/warehouse")}
                className="mt-2.5 w-full text-[10px] font-bold text-green-700 hover:text-white hover:bg-green-600 border border-green-300 rounded-md py-1.5 transition-colors"
              >
                {t("Change_Warehouse") || "Change Warehouse →"}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={14}
                  className="text-orange-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-semibold text-xs text-orange-900">
                    {t("No_online_warehouse") || "No online warehouse"}
                  </p>
                  <p className="text-[10px] text-orange-700 mt-0.5">
                    {t("Mark_a_warehouse_as_online") ||
                      "Mark a warehouse as online first"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/warehouse")}
                className="mt-2.5 w-full text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md py-1.5 transition-colors"
              >
                {t("Go_to_Warehouses") || "Go to Warehouses →"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Footer ═══════ */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={onSave}
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Save size={15} className="me-2" />
          {saving ? t("Saving") || "Saving..." : t("Save") || "Save"}
        </Button>
      </div>
    </div>
  );
};

export default SelfCard;
