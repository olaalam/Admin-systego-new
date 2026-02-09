// src/pages/ProductGeneralTab.jsx (Updated with ar_name, ar_description, taxesId)
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

// shadcn/ui imports needed for the Multi-Select Combobox
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// Multi-Select Combobox Component
// ----------------------------------------------------------------------

const CategoryMultiSelect = ({ label, value, options, onChange, required = false }) => {
  const [open, setOpen] = React.useState(false);
  const { t, i18n } = useTranslation();

  const selectedValues = new Set(value);

  const handleSelect = (optionId) => {
    if (selectedValues.has(optionId)) {
      selectedValues.delete(optionId);
    } else {
      selectedValues.add(optionId);
    }

    onChange(Array.from(selectedValues));
  };

  const handleRemove = (optionId) => {
    selectedValues.delete(optionId);
    onChange(Array.from(selectedValues));
  }

  const selectedNames = options
    .filter(option => selectedValues.has(option._id))
    .map(option => option.name);

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {selectedNames.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-w-[90%]">
                {selectedNames.map((name, index) => (
                  <Badge key={index} variant="secondary" className="pl-2">
                    {name}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      const selectedOption = options.find(opt => opt.name === name);
                      if (selectedOption) handleRemove(selectedOption._id);
                    }} />
                  </Badge>
                ))}
              </div>
            ) : (
              t("Select Category")
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option._id}
                  value={option.name}
                  onSelect={() => {
                    handleSelect(option._id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.has(option._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ----------------------------------------------------------------------
// ProductGeneralTab Component (with Arabic fields and Taxes)
// ----------------------------------------------------------------------

const ProductGeneralTab = ({ form, handleChange, categories, brands, taxes, loading, units }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  if (loading) {
    return <Loader />;
  }
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Product Name (English) */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("productss.name_en")} <span className="text-red-500">*</span>
        </Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("productss.name_en_placeholder")}
          className="h-11"
        />
      </div>

      {/* ✅ Product Name (Arabic) */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("productss.name_ar")}
        </Label>
        <Input
          value={form.ar_name}
          onChange={(e) => handleChange("ar_name", e.target.value)}
          placeholder={t("productss.name_ar_placeholder")}
          className="h-11"
          dir="rtl"
        />
      </div>

      {/* Category, Brand, Tax Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Category Multi-Select */}
        <CategoryMultiSelect
          label={t("productss.category")}
          value={form.categoryId || []}
          options={categories}
          onChange={(newIds) => handleChange("categoryId", newIds)}
          required={true}
        />

        {/* Brand Single Select */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.brand")}
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            value={form.brandId}
            onChange={(e) => handleChange("brandId", e.target.value)}
          >
            <option value="">{t("Select Brand")}</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Tax Single Select */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.tax")}
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            value={form.taxesId}
            onChange={(e) => handleChange("taxesId", e.target.value)}
          >
            <option value="">{t("productss.select_tax")}</option>
            {taxes && taxes.map((tax) => (
              <option key={tax._id} value={tax._id}>
                {tax.name} ({tax.percentage}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit & Min Purchase */}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Unit */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.product_unit")} <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none"
            value={form.product_unit}
            onChange={(e) => handleChange("product_unit", e.target.value)}
          >
            <option value="">{t("select unit")}</option>
            {units?.map((u) => (
              <option key={u._id} value={u._id}>
                {isRTL ? u.ar_name : u.name} ({u.code})
              </option>
            ))}
          </select>
        </div>

        {/* Purchase Unit */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.purchase_unit")} <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none"
            value={form.purchase_unit}
            onChange={(e) => handleChange("purchase_unit", e.target.value)}
          >
            <option value="">{t("select unit")}</option>
            {units?.map((u) => (
              <option key={u._id} value={u._id}>
                {isRTL ? u.ar_name : u.name} ({u.code})
              </option>
            ))}
          </select>
        </div>

        {/* Sale Unit */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.sale_unit")} <span className="text-red-500">*</span>
          </Label>
          <select
            className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none"
            value={form.sale_unit}
            onChange={(e) => handleChange("sale_unit", e.target.value)}
          >
            <option value="">{t("select unit")}</option>
            {units?.map((u) => (
              <option key={u._id} value={u._id}>
                {isRTL ? u.ar_name : u.name} ({u.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description (English) */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("productss.description_en")}
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t("productss.description_en_placeholder")}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* ✅ Description (Arabic) */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("productss.description_ar")}
        </Label>
        <Textarea
          value={form.ar_description}
          onChange={(e) => handleChange("ar_description", e.target.value)}
          placeholder={t("productss.description_ar_placeholder")}
          rows={4}
          className="resize-none"
          dir="rtl"
        />
      </div>

      {/* Expiry Ability Checkbox */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={form.exp_ability}
          onChange={(e) => handleChange("exp_ability", e.target.checked)}
        />
        <label className="text-sm text-gray-700">{t("has_expiry_date")}</label>
      </div>

      {/* Expiry Date (Conditional) */}
      {/* {form.exp_ability && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="date"
            value={form.date_of_expiery}
            onChange={(e) => handleChange("date_of_expiery", e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
      )} */}

      {/* Whole Price & Start Quantity */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("productss.start_quantity")}
          </label>
          <input
            type="number"
            value={form.start_quantaty}
            onChange={(e) => handleChange("start_quantaty", parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder={t("productss.start_quantity_placeholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("productss.whole_price")}
          </label>
          <input
            type="number"
            value={form.whole_price}
            onChange={(e) => handleChange("whole_price", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder={t("productss.whole_price_placeholder")}
          />
        </div>
      </div>

      {/* Product has IMEI */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={form.product_has_imei}
          onChange={(e) => handleChange("product_has_imei", e.target.checked)}
        />
        <label className="text-sm text-gray-700">{t("productss.has_imei")}</label>
      </div>

      {/* Is Featured */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={form.is_featured}
          onChange={(e) => handleChange("is_featured", e.target.checked)}
        />
        <label className="text-sm text-gray-700">{t("productss.is_featured")}</label>
      </div>

      {/* Show Quantity */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={form.show_quantity}
          onChange={(e) => handleChange("show_quantity", e.target.checked)}
        />
        <label className="text-sm text-gray-700">{t("productss.show_quantity")}</label>
      </div>

      {/* Maximum to Show (Conditional) */}
      {form.show_quantity && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700">
            {t("productss.maximum_to_show")}
          </label>
          <input
            type="number"
            value={form.maximum_to_show}
            onChange={(e) => handleChange("maximum_to_show", parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder={t("productss.maximum_to_show_placeholder")}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGeneralTab;