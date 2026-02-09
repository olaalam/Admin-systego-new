"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import useGet from "@/hooks/useGet";
import { toast } from "react-toastify";
import ProductGeneralTab from "./ProductGeneralTab";
import ProductMediaTab from "./ProductMediaTab";
import ProductPriceTab from "./ProductPriceTab";

const ProductForm = ({
  mode = "add",
  initialData = {},
  onSubmit,
  submitLoading = false,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // fetch categories / brands / variations / taxes
  const { data, loading: metaLoading } = useGet("/api/admin/product/select");

  // local states
  const [activeTab, setActiveTab] = useState("general");
  const [allVariations, setAllVariations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [taxes, setTaxes] = useState([]); // ✅ إضافة taxes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    name: "",
    ar_name: "", // ✅ إضافة ar_name
    ar_description: "", // ✅ إضافة ar_description
    categoryId: [],
    brandId: "",
    taxesId: "", // ✅ إضافة taxesId
    product_unit: "",
    purchase_unit: "",
    sale_unit: "",
    description: "",
    minimum_quantity_sale: 1,
    image: "",
    gallery_product: [],
    price: 0,
    different_price: false,
    prices: [],
    // discount: 0,
    quantity: 0,
    low_stock: 0,
    exp_ability: false,
    whole_price: 0,
    start_quantaty: 0,
    cost: 0, // ✅ إضافة cost للمنتج الأساسي
    product_has_imei: false,
    show_quantity: false,
    maximum_to_show: 0,
    is_featured: false,
    code: "",
  });

  const [selectedVariationIds, setSelectedVariationIds] = useState([]);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState({});

  // helper: generateCombinations (same logic you used)
  const generateCombinations = (optionsMap, allVariationsLocal) => {
    const activeOptions = Object.entries(optionsMap)
      .filter(([id, options]) => options && options.length > 0)
      .map(([id, options]) => {
        const variation = allVariationsLocal.find((v) => v._id == id);
        return {
          variationId: id,
          variationName: variation ? variation.name : `ID ${id}`,
          options: options.map((optionName) => {
            const originalVariation = allVariationsLocal.find(
              (v) => v._id == id
            );
            const originalOption = originalVariation?.options.find(
              (opt) => opt.name === optionName
            );
            return {
              name: optionName,
              id: originalOption?._id || `${id}-${optionName}`,
            };
          }),
        };
      });

    if (activeOptions.length === 0) return [];

    const initialCombinations = [
      ...activeOptions[0].options.map((option) => ({
        name: option.name,
        options_ids: [option.id],
      })),
    ];

    const finalCombinations = activeOptions
      .slice(1)
      .reduce((combinations, currentVariation) => {
        const newCombinations = [];
        currentVariation.options.forEach((option) => {
          combinations.forEach((combo) => {
            newCombinations.push({
              name: `${combo.name} / ${option.name}`,
              options_ids: [...combo.options_ids, option.id],
            });
          });
        });
        return newCombinations;
      }, initialCombinations);

    return finalCombinations.map((combo) => ({
      name: combo.name,
      options: combo.options_ids,
      price: 0,
      low_stock: 0,
      code: "",
      image: "",
    }));
  };

  // fill meta data (categories, brands, variations, taxes)
  useEffect(() => {
    if (data) {
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setAllVariations(data.variations || []);
      setTaxes(data.taxes || []);
      setUnits(data.units || []);
    }
  }, [data]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((prev) => {
        const newForm = {
          ...prev,
          name: initialData.name || "",
          ar_name: initialData.ar_name || "", // ✅ إضافة ar_name
          ar_description: initialData.ar_description || "", // ✅ إضافة ar_description
          categoryId: initialData.categoryId
            ? initialData.categoryId.map((c) => (c._id ? c._id : c))
            : initialData.categoryId || [],
          brandId: initialData.brandId?._id || initialData.brandId || "",
          taxesId: initialData.taxesId?._id || initialData.taxesId || "", // ✅ إضافة taxesId
          product_unit: initialData.product_unit?._id || initialData.product_unit || "",
          purchase_unit: initialData.purchase_unit?._id || initialData.purchase_unit || "",
          sale_unit: initialData.sale_unit?._id || initialData.sale_unit || "",
          description: initialData.description || "",
          image: initialData.image || "",
          gallery_product: initialData.gallery_product || initialData.gallery || [],
          minimum_quantity_sale:
            initialData.minimum_quantity_sale || prev.minimum_quantity_sale,
          price: initialData.price ?? prev.price,
          different_price: initialData.different_price ?? prev.different_price,
          prices: initialData.prices?.map((p) => {
            const optionIds = [];
            p.variations?.forEach((variation) => {
              variation.options?.forEach((opt) => optionIds.push(opt._id));
            });
            if (p.options && Array.isArray(p.options) && p.options.length) {
              optionIds.push(...p.options);
            }

            const optionNames = optionIds
              .map((optionId) => {
                const variation = allVariations.find((v) =>
                  v.options.some((opt) => opt._id === optionId)
                );
                const option = variation?.options.find(
                  (opt) => opt._id === optionId
                );
                return option ? option.name : null;
              })
              .filter((name) => name !== null);

            return {
              _id: p._id,
              price: p.price,
              quantity: p.quantity || 0,
              cost: p.cost || 0,
              start_quantity: p.start_quantity || 0,
              code: p.code || "",
              image: p.gallery?.[0] || p.image || "",
              options: optionIds.length ? optionIds : p.options || [],
              name: optionNames.length ? optionNames.join(" / ") : p.name || "Unnamed Variant",
            };
          }) || [],
          quantity: initialData.quantity || 0,
          low_stock: initialData.low_stock || 0,
          exp_ability: initialData.exp_ability || false,
          // date_of_expiery: initialData.date_of_expiery
          //   ? new Date(initialData.date_of_expiery).toISOString().split("T")[0]
          //   : "",
          whole_price: initialData.whole_price || 0,
          start_quantaty: initialData.start_quantaty || 0,
          product_has_imei: initialData.product_has_imei || false,
          show_quantity: initialData.show_quantity || false,
          maximum_to_show: initialData.maximum_to_show || 0,
          is_featured: initialData.is_featured || false,
        };

        console.log("Initial prices:", newForm.prices);
        return newForm;
      });

      if (
        initialData.different_price &&
        initialData.prices?.length > 0 &&
        data?.variations
      ) {
        const allOptionIds = new Set();
        initialData.prices.forEach((p) => {
          p.variations?.forEach((variation) =>
            variation.options?.forEach((opt) => allOptionIds.add(opt._id))
          );
          if (p.options && Array.isArray(p.options))
            p.options.forEach((opt) => allOptionIds.add(opt));
        });

        const newSelected = {};
        const newSelectedVarIds = [];
        (data.variations || []).forEach((variation) => {
          const selected = variation.options
            .filter((opt) => allOptionIds.has(opt._id))
            .map((opt) => opt.name);
          if (selected.length) {
            newSelected[variation._id] = selected;
            newSelectedVarIds.push(variation._id);
          }
        });

        setSelectedOptionsMap(newSelected);
        setSelectedVariationIds(newSelectedVarIds);
      }
    }
  }, [mode, initialData, data, allVariations]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (e, multiple = false) => {
    const files = e.target.files;
    if (!files.length) return;
    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (multiple) {
          setForm((prev) => ({
            ...prev,
            gallery_product: [...prev.gallery_product, reader.result],
          }));
        } else {
          setForm((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      gallery_product: prev.gallery_product.filter((_, i) => i !== index),
    }));
  };

  const handleVariationChange = (ids) => {
    setSelectedVariationIds(ids);
    setSelectedOptionsMap((prev) => {
      const newMap = {};
      ids.forEach((id) => {
        newMap[id] = prev[id] || [];
      });
      return newMap;
    });
  };

  const handleOptionsChange = useCallback((variationId, options) => {
    setSelectedOptionsMap((prev) => ({ ...prev, [variationId]: options }));
  }, []);

  const handleVariantFieldChange = useCallback((index, key, value) => {
    setForm((prevForm) => {
      const newPrices = [...prevForm.prices];
      newPrices[index] = { ...newPrices[index], [key]: value };
      return { ...prevForm, prices: newPrices };
    });
  }, []);

  useEffect(() => {
    if (form.different_price) {
      const newVariants = generateCombinations(selectedOptionsMap, allVariations);
      setForm((prevForm) => {
        const updatedPrices = newVariants.map((newVariant) => {
          const oldVariant = prevForm.prices.find((p) => {
            if (!p.options) return false;
            if (p.options.length !== newVariant.options.length) return false;
            const oldOptionsStr = [...p.options].sort().join(",");
            const newOptionsStr = [...newVariant.options].sort().join(",");
            return oldOptionsStr === newOptionsStr;
          });
          const optionNames = newVariant.options
            .map((optionId) => {
              const variation = allVariations.find((v) =>
                v.options.some((opt) => opt._id === optionId)
              );
              const option = variation?.options.find(
                (opt) => opt._id === optionId
              );
              return option ? option.name : null;
            })
            .filter((name) => name !== null);
          const derivedName = optionNames.length
            ? optionNames.join(" / ")
            : "Unnamed Variant";

          return oldVariant
            ? { ...newVariant, ...oldVariant, name: oldVariant.name || derivedName }
            : { ...newVariant, name: derivedName };
        });
        return { ...prevForm, prices: updatedPrices };
      });
    } else {
      setForm((prevForm) => ({ ...prevForm, prices: [] }));
    }
  }, [selectedOptionsMap, form.different_price, allVariations]);

  const cleanBase64 = (dataUri) =>
    typeof dataUri === "string" && dataUri.startsWith("data:")
      ? dataUri.split(",")[1]
      : dataUri;

  const isFormValid = () => {
    if (!form.name || form.name.trim() === "") return false;
    if (!form.categoryId || form.categoryId.length === 0) return false;
    if (!form.product_unit || !form.purchase_unit || !form.sale_unit) return false;
    if (!form.price || Number(form.price) <= 0) return false;
    if (!form.image) return false;

    if (form.different_price) {
      if (!form.prices || form.prices.length === 0) return false;
      const allVariantsValid = form.prices.every(
        (variant) =>
          variant.price > 0 && (variant.stock ?? variant.low_stock) >= 0
      );
      if (!allVariantsValid) return false;
      const allOptionsSelected = selectedVariationIds.every(
        (id) => selectedOptionsMap[id] && selectedOptionsMap[id].length > 0
      );
      if (!allOptionsSelected) return false;
    } else {
      if ((form.quantity ?? 0) < 0 || (form.low_stock ?? 0) < 0) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error(t("Please fill in all required fields and correct the errors"));
      return;
    }

    setIsSubmitting(true);
    try {
      let finalForm = {
        name: form.name,
        ar_name: form.ar_name, // ✅ إضافة ar_name
        ar_description: form.ar_description, // ✅ إضافة ar_description
        categoryId: form.categoryId,
        brandId: form.brandId || "",
        taxesId: form.taxesId || "", // ✅ إضافة taxesId
        product_unit: form.product_unit,
        purchase_unit: form.purchase_unit,
        sale_unit: form.sale_unit,
        price: form.price,
        description: form.description,
        image: cleanBase64(form.image),
        gallery_product: form.gallery_product.map((img) => cleanBase64(img)),
        different_price: form.different_price,
        is_featured: form.is_featured,
        low_stock: form.low_stock || 0,
        code: form.code,
      };

      finalForm.exp_ability = form.exp_ability;
      // if (form.exp_ability) finalForm.date_of_expiery = form.date_of_expiery;
      finalForm.whole_price = form.whole_price || 0;
      finalForm.start_quantaty = form.start_quantaty || 0;
      finalForm.product_has_imei = form.product_has_imei;
      finalForm.show_quantity = form.show_quantity;
      if (form.show_quantity)
        finalForm.maximum_to_show = form.maximum_to_show || 0;

      if (finalForm.different_price) {
        finalForm.prices = form.prices.map((variant) => ({
          price: variant.price,
          cost: variant.cost || 0,
          start_quantity: variant.start_quantity || 0,
          code: variant.code,
          quantity: variant.quantity ?? 0,
          gallery: variant.image
            ? [cleanBase64(variant.image)]
            : (variant.gallery || []).map((img) => cleanBase64(img)),
          options: variant.options,
        }));
      } else {
        finalForm = {
          ...finalForm,
          quantity: form.quantity || 0,
          low_stock: form.low_stock || 0,
          minimum_quantity_sale: form.minimum_quantity_sale,
          // discount: form.discount,
        };
        delete finalForm.different_price;
        delete finalForm.prices;
      }

      if (!finalForm.categoryId || finalForm.categoryId.length === 0)
        delete finalForm.categoryId;
      if (!finalForm.brandId) delete finalForm.brandId;
      if (!finalForm.taxesId) delete finalForm.taxesId; // ✅ حذف taxesId إذا كان فارغ

      console.log("📦 Final form submitted:", finalForm);
      await onSubmit(finalForm);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formProps = {
    form,
    handleChange,
    categories,
    brands,
    taxes,
    units,
    handleImageUpload,
    removeGalleryImage,
    loading: metaLoading,
    allVariations,
    selectedVariationIds,
    handleVariationChange,
    selectedOptionsMap,
    handleOptionsChange,
    handleVariantFieldChange,
  };

  const headerTitle = mode === "add" ? t("Add New Product") : t("Edit Product");
  const headerSubtitle =
    mode === "add"
      ? t("productForm.subtitle_add")
      : t("productForm.subtitle_edit");
  const submitLabel =
    submitLoading || isSubmitting
      ? mode === "add"
        ? t("productForm.saving")
        : t("productForm.updating")
      : mode === "add"
        ? t("productForm.save")
        : t("productForm.update");

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto">
        <div className="mb-6">
          <div className="flex flex-col gap-3 mb-2 ml-9">
            <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
            <p className="text-gray-600">{headerSubtitle}</p>
          </div>
        </div>

        <div

          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-24">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                <div className="flex w-full" dir={isRTL ? "rtl" : "ltr"}>
                  <TabsTrigger
                    value="general"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("GeneralInfo")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="media"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {t("Media")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="price"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("Pricing")}
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="general" className="p-6 mt-0">
              <ProductGeneralTab {...formProps} />
            </TabsContent>

            <TabsContent value="media" className="p-6 mt-0">
              <ProductMediaTab {...formProps} />
            </TabsContent>

            <TabsContent value="price" className="p-6 mt-0">
              <ProductPriceTab {...formProps} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/product")}
            className="px-6"
          >
            {t("Cancel")}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || submitLoading || !isFormValid()}
            className="px-8 bg-secondary hover:bg-secondary/90"
          >
            {submitLabel === "Saving..." || submitLabel === "Updating..." ? (
              submitLabel
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;