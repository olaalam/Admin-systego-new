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
        {/* ═══════ Header ═══════ */}
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

        {/* ═══════ Body ═══════ */}
        <div
          className={`p-5 space-y-4 flex-1 ${
            !form.enabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* API Key */}
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

          {/* Base URL */}
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

          {/* Environment */}
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

          {/* Test Connection */}
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

          {/* Advanced Button */}
          <button
            onClick={() => setShowAdvanced(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200"
          >
            <Settings2 size={14} />
            {t("Advanced_Settings") || "Advanced Settings"}
          </button>
        </div>

        {/* ═══════ Footer ═══════ */}
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

      {/* ═══════ Advanced Modal ═══════ */}
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
