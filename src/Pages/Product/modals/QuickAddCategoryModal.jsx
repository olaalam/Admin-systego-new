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
import { Upload, X, Loader2, FolderPlus } from "lucide-react";

const QuickAddCategoryModal = ({ open, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const [fetchingParents, setFetchingParents] = useState(false);

  const [formData, setFormData] = useState({
    ar_name: "",
    name: "",
    image: "",
    banner: "",
    order: "",
    parentId: "",
  });

  useEffect(() => {
    if (open) {
      const fetchParentCategories = async () => {
        setFetchingParents(true);
        try {
          const res = await api.get("/api/admin/category");
          const parents = res.data?.data?.ParentCategories || [];
          setParentOptions(parents);
        } catch (err) {
          console.error("Error fetching parent categories:", err);
        } finally {
          setFetchingParents(false);
        }
      };
      fetchParentCategories();
    } else {
      // Reset form when closed
      setFormData({
        ar_name: "",
        name: "",
        image: "",
        banner: "",
        order: "",
        parentId: "",
      });
    }
  }, [open]);

  const handleImageChange = (key, file) => {
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
      setFormData((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.ar_name.trim()) {
      toast.error(t("Please enter category name in Arabic") || "Arabic Name is required");
      return;
    }

    if (!formData.image) {
      toast.error(t("Please upload an image") || "Category image is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ar_name: formData.ar_name.trim(),
        image: formData.image,
      };

      if (formData.name?.trim()) {
        payload.name = formData.name.trim();
      }

      if (formData.banner) {
        payload.banner = formData.banner;
      }

      if (formData.order !== "" && formData.order !== null && formData.order !== undefined) {
        payload.order = Number(formData.order);
      }

      if (formData.parentId) {
        payload.parentId = formData.parentId;
      }

      const res = await api.post("/api/admin/category/", payload);

      toast.success(t("category_added_successfully") || "Category added successfully");

      const newCategory = res.data?.data?.category || res.data?.data || res.data;
      if (onSuccess) {
        onSuccess(newCategory);
      }
      onClose();
    } catch (err) {
      console.error("Error adding category:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("failed_to_add_category") ||
        "Failed to add category";

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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            {t("add_category") || "Add Category"}
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
              placeholder={isRTL ? "مثال: الكترونيات" : "Arabic category name"}
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
              placeholder="e.g. Electronics"
              className="h-10"
            />
          </div>

          {/* Parent Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("parent_category") || "Parent Category"}
            </Label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              disabled={fetchingParents}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none disabled:bg-gray-100"
            >
              <option value="">
                {fetchingParents
                  ? t("loading_categories") || "Loading categories..."
                  : t("select_parent_category_optional") || "None (Main Category)"}
              </option>
              {parentOptions.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Order Number */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {isRTL ? "رقم الترتيب (اختياري)" : "Order Number (Optional)"}
            </Label>
            <Input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              placeholder="0"
              className="h-10"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Image") || "Category Image"} <span className="text-red-500">*</span>
            </Label>
            {formData.image ? (
              <div className="relative w-28 h-28 border rounded-lg overflow-hidden group">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">
                    {t("Click to upload category image (max 5MB)") || "Click to upload image"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => (e.target.value = null)}
                  onChange={(e) => handleImageChange("image", e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {/* Banner Upload (Optional) */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {isRTL ? "البانر (اختياري)" : "Banner (Optional)"}
            </Label>
            {formData.banner ? (
              <div className="relative w-full h-20 border rounded-lg overflow-hidden group">
                <img src={formData.banner} alt="Banner Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, banner: "" })}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {isRTL ? "رفع بانر (اختياري)" : "Upload banner image (Optional)"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => (e.target.value = null)}
                  onChange={(e) => handleImageChange("banner", e.target.files?.[0])}
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

export default QuickAddCategoryModal;
