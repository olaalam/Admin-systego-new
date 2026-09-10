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
import { Tag, Loader2 } from "lucide-react";
import WarehouseMultiSelect from "@/Pages/Pandels/WarehouseMultiSelect";

const QuickAddDiscountModal = ({ open, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    applyIn: "POS",
    all_warehouses: true,
    warehouse_ids: [],
    type: "percentage",
    amount: 15,
  });

  useEffect(() => {
    if (open) {
      const fetchWarehouses = async () => {
        try {
          const res = await api.get("/api/admin/warehouse");
          setWarehouses(res.data?.data?.warehouses || res.data?.warehouses || []);
        } catch (err) {
          console.error("Error fetching warehouses:", err);
        }
      };
      fetchWarehouses();
    } else {
      setFormData({
        name: "",
        applyIn: "POS",
        all_warehouses: true,
        warehouse_ids: [],
        type: "percentage",
        amount: 15,
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("Please fill in") + " " + t("DiscountName"));
      return;
    }

    if (!formData.applyIn) {
      toast.error(t("Please fill in") + " " + t("ApplyIn"));
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error(t("Please enter a valid amount"));
      return;
    }

    if (!formData.all_warehouses && (!formData.warehouse_ids || formData.warehouse_ids.length === 0)) {
      toast.error(t("PleaseSelectWarehousesOrEnableAllWarehouses") || "Please select at least one warehouse");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
        applyIn: formData.applyIn,
        all_warehouses: !!formData.all_warehouses,
        warehouse_ids: formData.all_warehouses ? [] : formData.warehouse_ids || [],
      };

      const res = await api.post("/api/admin/discount", payload);

      toast.success(t("Discountaddedsuccessfully") || "Discount added successfully");

      const newDiscount = res.data?.data?.discount || res.data?.data || res.data;
      if (onSuccess) {
        onSuccess(newDiscount);
      }
      onClose();
    } catch (err) {
      console.error("Error adding discount:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoadddiscount") ||
        "Failed to add discount";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Tag className="w-5 h-5" />
            </div>
            {t("AddNewDiscount") || "Add New Discount"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Discount Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("DiscountName") || "Discount Name"} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("DiscountNamePlaceholder") || "e.g. Summer Sale"}
              className="h-10"
              required
            />
          </div>

          {/* Apply In & Discount Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("ApplyIn") || "Apply In"} <span className="text-red-500">*</span>
              </Label>
              <select
                value={formData.applyIn}
                onChange={(e) => setFormData({ ...formData, applyIn: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-secondary outline-none"
              >
                <option value="POS">POS</option>
                <option value="E-commerce">E-commerce</option>
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("DiscountType") || "Discount Type"} <span className="text-red-500">*</span>
              </Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-secondary outline-none"
              >
                <option value="percentage">{t("Percentage") || "Percentage (%)"}</option>
                <option value="fixed">{t("FixedAmount") || "Fixed Amount"}</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Amount") || "Amount"} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="any"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder={formData.type === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 50"}
              className="h-10"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === "percentage"
                ? isRTL ? "أدخل 15 لخصم 15%" : "Enter 15 for 15% discount."
                : isRTL ? "أدخل القيمة الثابتة للخصم" : "Enter fixed discount value."}
            </p>
          </div>

          {/* All Warehouses Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div>
              <Label className="text-sm font-medium text-gray-800 block cursor-pointer">
                {t("AllWarehouses") || "Apply to All Warehouses"}
              </Label>
              <span className="text-xs text-gray-500">
                {formData.all_warehouses
                  ? t("AppliesToAllWarehouses") || "Discount applies to all branches"
                  : isRTL ? "اختر المخازن المحددة أدناه" : "Select specific warehouses below"}
              </span>
            </div>
            <Switch
              checked={formData.all_warehouses}
              onCheckedChange={(val) => setFormData({ ...formData, all_warehouses: val })}
            />
          </div>

          {/* Specific Warehouses Multi-select (if not all warehouses) */}
          {!formData.all_warehouses && (
            <div className="pt-1">
              <WarehouseMultiSelect
                label={t("Warehouses") || "Warehouses"}
                options={warehouses}
                value={formData.warehouse_ids || []}
                onChange={(val) => setFormData({ ...formData, warehouse_ids: val })}
                t={t}
              />
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

export default QuickAddDiscountModal;
