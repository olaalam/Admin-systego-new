// src/components/AddPage.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import { ComboboxMultiSelect } from "@/components/ui/combobox-multi-select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const AddPage = ({
  title = "Add Item",
  description = "Fill in the details below to add a new record.",
  fields = [],
  onSubmit = () => {},
  onCancel = () => {},
  initialData = {},
  loading = false,
  className = "",
  submitButtonText = "Save"
}) => {
  const [formData, setFormData] = useState({});
const { t ,i18n } = useTranslation();
const isArabic = i18n.language === "ar";
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const filteredData = fields.reduce((acc, field) => {
        if (field.type === "array" || field.type === "multiselect") {
          acc[field.key] = Array.isArray(initialData[field.key])
            ? initialData[field.key]
            : [];
        } else {
          acc[field.key] =
            initialData[field.key] !== undefined
              ? initialData[field.key]
              : field.type === "checkbox" || field.type === "switch"
              ? false
              : "";
        }
        return acc;
      }, {});
      setFormData(filteredData);
    } else {
      const defaults = fields.reduce((acc, field) => {
        if (field.type === "array" || field.type === "multiselect") {
          acc[field.key] = [];
        } else {
          acc[field.key] = field.type === "checkbox" || field.type === "switch" ? false : "";
        }
        return acc;
      }, {});
      setFormData(defaults);
    }
  }, [JSON.stringify(initialData), fields]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    const fieldDef = fields.find((f) => f.key === key);
    if (fieldDef && fieldDef.onChange) {
      fieldDef.onChange(value);
    }
  };

  const handleArrayChange = (key, index, subKey, value) => {
    const newArray = [...(formData[key] || [])];
    newArray[index] = { ...newArray[index], [subKey]: value };
    setFormData((prev) => ({ ...prev, [key]: newArray }));
  };

  const addArrayItem = (key, subFields) => {
    const newItem = {};
    subFields.forEach((f) => {
      newItem[f.key] =
        f.type === "checkbox" || f.type === "switch" ? false : "";
    });
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem],
    }));
  };

  const removeArrayItem = (key, index) => {
    const newArray = [...(formData[key] || [])];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [key]: newArray }));
  };

  const handleImageChange = async (key, file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to read image file", error);
    }
  };

  const handleSubmit = () => {
    for (let field of fields) {
      if (field.required && !formData[field.key]?.length && field.type === "multiselect") {
        toast.error(`Please select at least one ${field.label}`);
        return;
      }
      if (
        field.required &&
        field.type === "image" &&
        (!formData[field.key] || typeof formData[field.key] !== "string")
      ) {
        toast.error(`Please upload ${field.label}`);
        return;
      }
      if (
        field.required &&
        field.type !== "image" &&
        field.type !== "checkbox" &&
        field.type !== "switch" &&
        field.type !== "custom" &&
        !formData[field.key]
      ) {
        toast.error(`${t("Please fill in")} ${field.label}`);
        return;
      }
    }

    if (formData.from && formData.to) {
      const fromDate = new Date(formData.from);
      const toDate = new Date(formData.to);
      if (fromDate > toDate) {
        toast.error("Valid From date cannot be later than Valid To date");
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
          <UserPlus size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div 
              key={field.key} 
              className={`space-y-2 ${field.type === 'custom' ? 'md:col-span-2' : ''}`}
            >
              <label className="block text-sm font-medium text-gray-700">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Custom Field Type */}
              {field.type === "custom" ? (
                <div className="w-full">
                  {field.render && field.render(formData, setFormData)}
                </div>
              ) : field.type === "array" ? (
                <div className="space-y-3">
                  {(formData[field.key] || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap gap-3 items-end border p-3 rounded-lg bg-gray-50"
                    >
                      {field.subFields.map((sub) => (
                        <div key={sub.key} className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            {sub.label}
                          </label>
                          {sub.type === "switch" ? (
                            <Switch
                            dir={isArabic ? "rtl" : "ltr"}
                              checked={item[sub.key] ?? false}
                              onCheckedChange={(val) =>
                                handleArrayChange(field.key, idx, sub.key, val)
                              }
                            />
                          ) : sub.type === "checkbox" ? (
                            <input
                              type="checkbox"
                              checked={item[sub.key] || false}
                              onChange={(e) =>
                                handleArrayChange(field.key, idx, sub.key, e.target.checked)
                              }
                            />
                          ) : (
                            <input
                              type="text"
                              className="w-full px-2 py-1 border rounded"
                              value={item[sub.key] || ""}
                              onChange={(e) =>
                                handleArrayChange(field.key, idx, sub.key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => removeArrayItem(field.key, idx)}
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(field.key, field.subFields)}
                    className="mt-2 px-3 py-1 bg-purple-500 text-white rounded"
                  >
                    + {t("add")} {field.label}
                  </button>
                </div>
              ) : field.type === "multiselect" ? (
                <ComboboxMultiSelect
                  options={field.options || []}
                  selected={formData[field.key] || []}
                  onChange={(val) => handleChange(field.key, val)}
                  placeholder={`${t("Select")} ${field.label}`}
                  creatable={field.creatable}
                />
              ) : field.type === "select" ? (
                <select
                  value={formData[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">{field.placeholder || `${t("Select")} ${field.label}`}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "image" ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(field.key, e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {formData[field.key] && typeof formData[field.key] === "string" && (
                    <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={formData[field.key]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : field.type === "switch" ? (
                <div className="flex items-center space-x-3">
                  <Switch
                            dir={isArabic ? "rtl" : "ltr"}
                    checked={!!formData[field.key]}
                    onCheckedChange={(checked) => handleChange(field.key, checked)}
                  />
                  <span className="text-sm text-gray-600">
                    {formData[field.key] ? t("On") : t("Off")}
                  </span>
                </div>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
) : field.type === "date" ? (
  <input
    type="date"
    value={formData[field.key] ?? ""}
    onChange={(e) => {
      const value = e.target.value;
      handleChange(field.key, value);

      // Validation ديناميكي للـ start / end date
      if (field.key === "enddate" && formData.startdate) {
        if (new Date(value) < new Date(formData.startdate)) {
          toast.error("End Date cannot be earlier than Start Date");
          handleChange(field.key, ""); // يمسح القيمة غير الصحيحة
        }
      }
      if (field.key === "startdate" && formData.enddate) {
        if (new Date(value) > new Date(formData.enddate)) {
          toast.error("Start Date cannot be later than End Date");
          handleChange(field.key, ""); // يمسح القيمة غير الصحيحة
        }
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
    min={field.min}
    max={field.max}
  />

              ) : (
                <input
                  type={field.type || "text"}
                  value={formData[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `${t("Enter")} ${field.label}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                />
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium disabled:bg-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400"
          >
            {loading ?  t("Saving...") : t(submitButtonText)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPage;