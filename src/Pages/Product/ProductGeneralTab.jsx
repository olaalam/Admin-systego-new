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
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import QuickAddCategoryModal from "./modals/QuickAddCategoryModal";
import QuickAddBrandModal from "./modals/QuickAddBrandModal";
import QuickAddDiscountModal from "./modals/QuickAddDiscountModal";
import QuickAddUnitModal from "./modals/QuickAddUnitModal";

// ----------------------------------------------------------------------
// Multi-Select Combobox Component
// ----------------------------------------------------------------------

const CategoryMultiSelect = ({ label, value, options, onChange, required = false }) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  // Ensure options have unique IDs
  const uniqueOptions = React.useMemo(() => {
    const seen = new Set();
    return (options || []).filter((opt) => {
      if (!opt?._id) return false;
      const idStr = String(opt._id);
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  }, [options]);

  // Normalize selected IDs as Strings
  const selectedValues = React.useMemo(() => {
    const set = new Set();
    (value || []).forEach((v) => {
      if (typeof v === "object" && v?._id) {
        set.add(String(v._id));
      } else if (v) {
        set.add(String(v));
      }
    });
    return set;
  }, [value]);

  const handleSelect = (optionId) => {
    const idStr = String(optionId);
    const newSet = new Set(selectedValues);
    if (newSet.has(idStr)) {
      newSet.delete(idStr);
    } else {
      newSet.add(idStr);
    }
    onChange(Array.from(newSet));
  };

  const handleRemove = (optionId) => {
    const idStr = String(optionId);
    const newSet = new Set(selectedValues);
    newSet.delete(idStr);
    onChange(Array.from(newSet));
  };

  const selectedOptions = React.useMemo(() => {
    return uniqueOptions.filter((opt) => selectedValues.has(String(opt._id)));
  }, [uniqueOptions, selectedValues]);

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
            className="w-full justify-between h-auto min-h-11 py-1.5 px-3 font-normal"
          >
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                {selectedOptions.map((opt) => (
                  <span
                    key={opt._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <span>{opt.name}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-blue-200 hover:text-red-600 rounded-full p-0.5 transition-colors pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemove(opt._id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">{t("Select Category")}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {uniqueOptions.map((option) => (
                <CommandItem
                  key={option._id}
                  value={`${option.name}___${option._id}`}
                  onSelect={() => {
                    handleSelect(option._id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.has(String(option._id)) ? "opacity-100" : "opacity-0"
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
// Single-Select Combobox Component
// ----------------------------------------------------------------------
const BrandSelect = ({ label, value, options, onChange, t }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 font-normal"
          >
            {value
              ? options.find((option) => option._id === value)?.name
              : t("Select Brand")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t("Search Brand...")} />
            <CommandEmpty>{t("No brand found.")}</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {options.map((brand) => (
                <CommandItem
                  key={brand._id}
                  value={`${brand.name}___${brand._id}`}
                  onSelect={() => {
                    onChange(brand._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === brand._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {brand.name}
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

const ProductGeneralTab = ({
  form,
  handleChange,
  categories = [],
  brands = [],
  loading,
  units = [],
  discounts = [],
  refetchMeta,
  refetchDiscounts,
  setCategories,
  setBrands,
  setUnits,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = React.useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = React.useState(false);

  const handleCategoryCreated = async (newCategory) => {
    if (!newCategory) return;
    const catId = newCategory._id || newCategory.id;
    if (catId) {
      if (setCategories) {
        setCategories((prev) => {
          if (prev.some((c) => String(c._id) === String(catId))) return prev;
          return [...prev, newCategory];
        });
      }
      const currentIds = Array.isArray(form.categoryId)
        ? form.categoryId.map((id) => (typeof id === "object" ? id._id : id))
        : [];
      if (!currentIds.includes(catId)) {
        handleChange("categoryId", [...currentIds, catId]);
      }
    }
    if (refetchMeta) {
      await refetchMeta();
    }
  };

  const handleBrandCreated = async (newBrand) => {
    if (!newBrand) return;
    const brandId = newBrand._id || newBrand.id;
    if (brandId) {
      if (setBrands) {
        setBrands((prev) => {
          if (prev.some((b) => String(b._id) === String(brandId))) return prev;
          return [...prev, newBrand];
        });
      }
      handleChange("brandId", brandId);
    }
    if (refetchMeta) {
      await refetchMeta();
    }
  };

  const handleDiscountCreated = async (newDiscount) => {
    if (!newDiscount) return;
    const discountId = newDiscount._id || newDiscount.id;
    if (discountId) {
      handleChange("discountId", discountId);
    }
    if (refetchDiscounts) {
      await refetchDiscounts();
    }
  };

  const handleUnitCreated = async (newUnit) => {
    if (!newUnit) return;
    const unitId = newUnit._id || newUnit.id;
    if (unitId) {
      if (setUnits) {
        setUnits((prev) => {
          if (prev.some((u) => String(u._id) === String(unitId))) return prev;
          return [...prev, newUnit];
        });
      }
      // إضافة الوحدة في الثلاثة حقول مباشرة
      handleChange("product_unit", unitId);
      handleChange("purchase_unit", unitId);
      handleChange("sale_unit", unitId);
    }
    if (refetchMeta) {
      await refetchMeta();
    }
  };

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
        <div className="flex flex-col">
          <CategoryMultiSelect
            label={t("productss.category")}
            value={form.categoryId || []}
            options={categories}
            onChange={(newIds) => handleChange("categoryId", newIds)}
            required={true}
          />
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="mt-1.5 self-start inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-blue-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة فئة جديدة" : "Add Category"}</span>
          </button>
        </div>

        {/* Brand Single Select */}
        <div className="flex flex-col">
          <BrandSelect
            label={t("productss.brand")}
            value={form.brandId}
            options={brands}
            onChange={(newId) => handleChange("brandId", newId)}
            t={t}
          />
          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="mt-1.5 self-start inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-blue-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة علامة تجارية جديدة" : "Add Brand"}</span>
          </button>
        </div>

        {/* ✅ Tax Single Select */}
        {/* <div>
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
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="flex flex-col">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            {t("productss.discount")}
          </Label>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none bg-white"
              value={form.discountId || ""}
              onChange={(e) => handleChange("discountId", e.target.value)}
            >
              <option value="">{t("productss.select_discount")}</option>
              {discounts.map((discount) => (
                <option key={discount._id} value={discount._id}>
                  {discount.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setIsDiscountModalOpen(true)}
            className="mt-1.5 self-start inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-blue-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRTL ? "إضافة خصم جديد" : "Add Discount"}</span>
          </button>
        </div>
      </div>

      {/* Unit & Min Purchase */}


      {/* Unit & Min Purchase */}
      <div className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Unit */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              {t("productss.product_unit")} <span className="text-red-500">*</span>
            </Label>
            <select
              className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none bg-white"
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
              className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none bg-white"
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
              className="w-full h-11 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-secondary outline-none bg-white"
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

        {/* زر واحد لإضافة الوحدة يضيف في الثلاثة مباشرة */}
        <button
          type="button"
          onClick={() => setIsUnitModalOpen(true)}
          className="mt-2 self-start inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-blue-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRTL ? "إضافة وحدة جديدة" : "Add Unit"}</span>
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("productss.start_quantity")}
          </label>
          <input
            type="number"
            value={form.start_quantaty ?? 0}
            onChange={(e) => handleChange("start_quantaty", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder={t("productss.start_quantity_placeholder")}
            min="0"
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
            min="0"
            step="0.01"
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

      {/* Quick Add Modals */}
      <QuickAddCategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      <QuickAddBrandModal
        open={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSuccess={handleBrandCreated}
      />

      <QuickAddDiscountModal
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onSuccess={handleDiscountCreated}
      />

      <QuickAddUnitModal
        open={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onSuccess={handleUnitCreated}
        existingUnits={units}
      />
    </div>
  );
};

export default ProductGeneralTab;