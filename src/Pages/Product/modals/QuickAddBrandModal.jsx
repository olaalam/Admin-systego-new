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
import { toast } from "react-toastify";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { Upload, X, Loader2, Sparkles } from "lucide-react";

const QuickAddBrandModal = ({ open, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ar_name: "",
    name: "",
    logo: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        ar_name: "",
        name: "",
        logo: "",
      });
    }
  }, [open]);

  const handleLogoChange = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("Please select a valid image (JPEG, PNG, WEBP, GIF)"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("Image is too large (max 5MB)"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.ar_name.trim()) {
      toast.error(t("Please enter brand name in Arabic") || "Arabic Name is required");
      return;
    }

    if (!formData.logo) {
      toast.error(t("Please upload a logo") || "Brand logo is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ar_name: formData.ar_name.trim(),
        logo: formData.logo,
        status: true,
      };

      if (formData.name?.trim()) {
        payload.name = formData.name.trim();
      }

      const res = await api.post("/api/admin/brand/", payload);

      toast.success(t("Brand added successfully") || "Brand added successfully");

      const newBrand = res.data?.data?.brand || res.data?.data || res.data;
      if (onSuccess) {
        onSuccess(newBrand);
      }
      onClose();
    } catch (err) {
      console.error("Error adding brand:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("FailedtoaddBrand") ||
        "Failed to add brand";

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
      <DialogContent className="sm:max-w-[480px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            {t("AddBrand") || "Add Brand"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Arabic Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Name(Arabic)") || "Name (Arabic)"} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.ar_name}
              onChange={(e) => setFormData({ ...formData, ar_name: e.target.value })}
              placeholder={isRTL ? "مثال: سامسونج" : "Arabic brand name"}
              dir="rtl"
              className="h-10"
              required
            />
          </div>

          {/* English Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Name(English)") || "Name (English)"}
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Samsung"
              className="h-10"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Logo") || "Brand Logo"} <span className="text-red-500">*</span>
            </Label>
            {formData.logo ? (
              <div className="relative w-28 h-28 border rounded-lg overflow-hidden group">
                <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-2 bg-white" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo: "" })}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">
                    {t("Click to upload logo (max 5MB)") || "Click to upload logo"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => (e.target.value = null)}
                  onChange={(e) => handleLogoChange(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

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

export default QuickAddBrandModal;
