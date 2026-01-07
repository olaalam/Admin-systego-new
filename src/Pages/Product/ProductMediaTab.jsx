// src/pages/ProductMediaTab.jsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const ProductMediaTab = ({
  form,
  handleChange,
  handleImageUpload,
  removeGalleryImage,
}) => {
    const { t ,i18n } = useTranslation();
   const isRTL = i18n.language === "ar";
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Main Image */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("MainProductImage")} <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
            {form.image ? (
              <div className="relative w-full h-full">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleChange("image", "");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">
                  {t("Click to upload or drag and drop")}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
            <Input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e)}
            />
          </label>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("ProductGallery")}
        </Label>
        <div className="mt-2">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center py-4">
              <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm text-gray-600">{t("Addmoreimages")}</p>
            </div>
            <Input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
            />
          </label>
        </div>

        {/* Gallery Preview */}
        {form.gallery_product.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {form.gallery_product.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`gallery-${idx}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMediaTab;