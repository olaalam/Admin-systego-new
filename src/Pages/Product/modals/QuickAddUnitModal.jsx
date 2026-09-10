import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { Scale, Loader2 } from "lucide-react";

const QuickAddUnitModal = ({ open, onClose, onSuccess, existingUnits = [], targetField = null }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ar_name: "",
    code: "",
    base_unit: "",
    operator: "*",
    operator_value: 1,
    is_base_unit: true,
    status: true,
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        ar_name: "",
        code: "",
        base_unit: "",
        operator: "*",
        operator_value: 1,
        is_base_unit: true,
        status: true,
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("Please fill in") + " " + (t("Name(English)") || "English Name"));
      return;
    }

    if (!formData.ar_name.trim()) {
      toast.error(t("Please fill in") + " " + (t("Name(Arabic)") || "Arabic Name"));
      return;
    }

    if (!formData.code.trim()) {
      toast.error(t("Please fill in") + " " + (t("Code") || "Code"));
      return;
    }

    if (!formData.operator_value || Number(formData.operator_value) <= 0) {
      toast.error(t("Please enter a valid operator value") || "Invalid operator value");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        ar_name: formData.ar_name.trim(),
        code: formData.code.trim().toUpperCase(),
        base_unit: formData.is_base_unit ? null : formData.base_unit || null,
        operator: formData.operator || "*",
        operator_value: Number(formData.operator_value) || 1,
        is_base_unit: !!formData.is_base_unit,
        status: formData.status !== undefined ? formData.status : true,
      };

      const res = await api.post("/api/admin/units", payload);

      toast.success(t("Unit added successfully") || "Unit added successfully");

      const newUnit = res.data?.data?.unit || res.data?.data || res.data;
      if (onSuccess) {
        onSuccess(newUnit, targetField);
      }
      onClose();
    } catch (err) {
      console.error("Error adding unit:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failed to add unit") ||
        "Failed to add unit";

      const errorDetails = err.response?.data?.error?.details;
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Scale className="w-5 h-5" />
            </div>
            {t("Add New Unit") || "Add New Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Arabic & English Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("Name(Arabic)") || "Name (Arabic)"} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.ar_name}
                onChange={(e) => setFormData({ ...formData, ar_name: e.target.value })}
                placeholder={isRTL ? "مثال: قطعة" : "Arabic name"}
                dir="rtl"
                className="h-10"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("Name(English)") || "Name (English)"} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Piece"
                className="h-10"
                required
              />
            </div>
          </div>

          {/* Code */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Code") || "Code"} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. PC, KG, G"
              className="h-10 uppercase"
              required
            />
          </div>

          {/* Is Base Unit Switch */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div>
              <Label className="text-sm font-medium text-gray-800 block cursor-pointer">
                {t("Is this a Base Unit?") || "Is this a Base Unit?"}
              </Label>
              <span className="text-xs text-gray-500">
                {formData.is_base_unit
                  ? isRTL ? "هذه وحدة أساسية لا تعتمد على وحدة أخرى" : "This is a primary unit"
                  : isRTL ? "وحدة فرعية تعتمد على وحدة أساسية" : "This unit converts to a base unit"}
              </span>
            </div>
            <Switch
              checked={formData.is_base_unit}
              onCheckedChange={(val) =>
                setFormData({
                  ...formData,
                  is_base_unit: val,
                  base_unit: val ? "" : formData.base_unit,
                })
              }
            />
          </div>

          {/* Conditional: Base Unit, Operator, Operator Value */}
          {!formData.is_base_unit && (
            <div className="space-y-4 p-3 border rounded-lg bg-amber-50/50 border-amber-200">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {t("BaseUnit") || "Base Unit"}
                </Label>
                <select
                  value={formData.base_unit}
                  onChange={(e) => setFormData({ ...formData, base_unit: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-secondary outline-none"
                >
                  <option value="">{t("Select base unit (optional)") || "Select base unit"}</option>
                  {existingUnits.map((u) => (
                    <option key={u._id} value={u._id}>
                      {isRTL ? u.ar_name || u.name : u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {t("Operator") || "Operator"}
                  </Label>
                  <select
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-secondary outline-none"
                  >
                    <option value="*">{t("Multiply (*)") || "Multiply (*)"}</option>
                    <option value="/">{t("Divide (/)") || "Divide (/)"}</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    {t("OperatorValue") || "Operator Value"}
                  </Label>
                  <Input
                    type="number"
                    min="0.0001"
                    step="any"
                    value={formData.operator_value}
                    onChange={(e) => setFormData({ ...formData, operator_value: e.target.value })}
                    placeholder="e.g. 1000"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-10"
            >
              {t("Cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 bg-secondary hover:bg-secondary/90 px-6 font-medium text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("Saving...") || "Saving..."}
                </>
              ) : (
                t("Save") || "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddUnitModal;
