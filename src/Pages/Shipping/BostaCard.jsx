// src/Pages/Shipping/BostaCard.jsx
import { useState } from "react";
import {
  Package,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings2,
  DollarSign,
  Percent,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
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
import usePost from "@/hooks/usePost";
import BostaAdvancedModal from "./BostaAdvancedModal";

const BostaCard = ({ form, setForm, onSave, saving }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { postData, loading: testing } = usePost(
    "/api/admin/shipping/bosta/test",
  );

  const handleTestConnection = async () => {
    if (!form.apiKey) {
      toast.error(t("API_Key_is_required") || "API Key is required");
      return;
    }
    setTestResult(null);
    try {
      const res = await postData({});
      if (res?.success) {
        setTestResult("success");
        toast.success(
          `✅ Connected! Found ${res.data?.citiesCount || 0} cities`,
        );
      } else {
        setTestResult("failed");
      }
    } catch (err) {
      setTestResult("failed");
    }
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                <Package size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Bosta_Shipping") || "Bosta Shipping"}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("Bosta_API") || "Bosta API Integration"}
                </p>
              </div>
            </div>
            <Switch
              dir={isRTL ? "rtl" : "ltr"}
              checked={form.enabled}
              onCheckedChange={(val) => updateField("enabled", val)}
            />
          </div>
        </div>

        <div
          className={`p-5 space-y-4 flex-1 ${
            !form.enabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div>
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
              {t("API_Key") || "API Key"} *
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) => updateField("apiKey", e.target.value)}
                className="pe-10 font-mono text-xs"
                placeholder="Enter Bosta API Key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
              {t("Base_URL") || "Base URL"} *
            </Label>
            <Input
              type="text"
              value={form.baseUrl}
              onChange={(e) => updateField("baseUrl", e.target.value)}
              className="font-mono text-xs"
              placeholder="https://app.bosta.co/api/v2"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
              {t("Environment") || "Environment"} *
            </Label>
            <Select
              value={form.environment}
              onValueChange={(val) => updateField("environment", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 💵 SHIPPING MARKUP */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <DollarSign size={14} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-emerald-900">
                  {t("Shipping_Markup") || "Shipping Markup"}
                </p>
                <p className="text-[10px] text-emerald-700">
                  {t("Markup_desc") || "Your profit added on top of Bosta cost"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => updateField("shippingMarkupType", "fixed")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  form.shippingMarkupType === "fixed"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                <DollarSign size={12} />
                {t("Fixed") || "Fixed"}
              </button>
              <button
                type="button"
                onClick={() => updateField("shippingMarkupType", "percentage")}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  form.shippingMarkupType === "percentage"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                <Percent size={12} />
                {t("Percentage") || "Percentage"}
              </button>
            </div>

            <div className="relative">
              <Input
                type="number"
                min="0"
                step={form.shippingMarkupType === "percentage" ? "1" : "0.5"}
                value={form.shippingMarkup}
                onChange={(e) =>
                  updateField("shippingMarkup", Number(e.target.value) || 0)
                }
                placeholder="0"
                className="pe-14 font-bold text-emerald-900"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600">
                {form.shippingMarkupType === "percentage" ? "%" : "EGP"}
              </span>
            </div>

            {form.shippingMarkup > 0 && (
              <div className="mt-3 p-2.5 bg-white rounded-lg border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5">
                  {t("Example") || "Example"}
                </p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("Bosta_Cost") || "Bosta cost"}:
                    </span>
                    <span className="font-bold text-gray-900">35.00 EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("Markup") || "Markup"}:
                    </span>
                    <span className="font-bold text-emerald-700">
                      {form.shippingMarkupType === "percentage"
                        ? `${form.shippingMarkup}% = ${(
                            35 *
                            (form.shippingMarkup / 100)
                          ).toFixed(2)} EGP`
                        : `${Number(form.shippingMarkup).toFixed(2)} EGP`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-100">
                    <span className="font-bold text-gray-900">
                      {t("Customer_Pays") || "Customer pays"}:
                    </span>
                    <span className="font-black text-emerald-700">
                      {(
                        35 +
                        (form.shippingMarkupType === "percentage"
                          ? 35 * (form.shippingMarkup / 100)
                          : Number(form.shippingMarkup))
                      ).toFixed(2)}{" "}
                      EGP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !form.apiKey}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {testing ? (
              <>
                <Loader2 size={14} className="me-2 animate-spin" />
                {t("Testing") || "Testing..."}
              </>
            ) : testResult === "success" ? (
              <>
                <CheckCircle2 size={14} className="me-2 text-green-600" />
                {t("Connected") || "Connected"}
              </>
            ) : testResult === "failed" ? (
              <>
                <XCircle size={14} className="me-2 text-red-600" />
                {t("Failed") || "Failed"}
              </>
            ) : (
              t("Test_Connection") || "Test Connection"
            )}
          </Button>

          <button
            onClick={() => setShowAdvanced(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200"
          >
            <Settings2 size={14} />
            {t("Advanced_Settings") || "Advanced Settings"}
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save size={15} className="me-2" />
            {saving ? t("Saving") || "Saving..." : t("Save") || "Save"}
          </Button>
        </div>
      </div>

      <BostaAdvancedModal
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        form={form}
        setForm={setForm}
        onSave={() => {
          onSave();
          setShowAdvanced(false);
        }}
        saving={saving}
      />
    </>
  );
};

export default BostaCard;
