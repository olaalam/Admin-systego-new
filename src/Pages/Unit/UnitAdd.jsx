// src/pages/UnitAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet"; // ✅ استيراد useGet
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const UnitAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  // ✅ جلب قائمة الـ Units لاستخدامها في الـ select
  const { data: unitsData, loading: unitsLoading, error: unitsError } = useGet("/api/admin/units");

  // استخراج الـ units كـ array
  const unitsList = unitsData?.units || [];


  // ✅ تحويل الـ units إلى options للـ select: { value: _id, label: name (ar_name) }
const baseUnitOptions = unitsList.map((unit) => ({
    value: unit._id, // الـ backend يستقبل الـ code (مثل "G", "KG")
    label: `${unit.name}${unit.ar_name ? ` (${unit.ar_name})` : ""}`, // عرض نظيف: Gram (جرام)
  }));

  const fields = [
    {
      key: "name",
      label: t("Name(English)"),
      type: "text",
      required: true,
      placeholder: "e.g. Gram",
    },
    {
      key: "ar_name",
      label: t("Name(Arabic)"),
      type: "text",
      required: true,
      placeholder: "مثال: جرام",
    },
    {
      key: "code",
      label: t("Code"),
      type: "text",
      required: true,
      placeholder: "e.g. G, KG, PC",
      // نصيحة: ممكن نضيف .toUpperCase() في onChange لو عايزة دايمًا uppercase
    },
{
      key: "base_unit",
      label: t("BaseUnit"),
      type: "select",
      required: false,
      placeholder: unitsLoading ? t("Loading units...") : t("Select base unit (optional)"),
      options: [
        { value: "", label: t("— No base unit (this is a base unit) —") },
        ...baseUnitOptions,
      ],
      disabled: unitsLoading,
    },
    {
      key: "operator",
      label: t("Operator"),
      type: "select",
      required: true,
      placeholder: t("Select operator"),
      options: [
        { value: "*", label:t("Multiply (*)") },
        { value: "/", label: t("Divide (/)") },
      ],
    },
    {
      key: "operator_value",
      label: t("OperatorValue"),
      type: "number",
      required: true,
      min: 0.001,
      step: "any",
      placeholder: "e.g. 1000 (1 KG = 1000 G)",
    },
    {
      key: "is_base_unit",
      label: t("Is this a Base Unit?"),
      type: "switch",
      required: false,
    },
    {
      key: "status",
      label: t("Active Status"),
      type: "switch",
      required: false,
    },
  ];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // ✅ لو الـ base_unit فارغ، نبعت null صراحة (أفضل للـ backend)
      const payload = {
        ...formData,
        base_unit: formData.base_unit || null,
        operator_value: Number(formData.operator_value), // تأكيد إنه رقم
      };

      await api.post("/api/admin/units", payload);

      toast.success(t("Unit added successfully"));
      navigate("/unit");
    } catch (err) {
      console.error("❌ Error adding unit:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
      t("Failed to add unit");

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

  // ✅ لو الـ units لسة بتحمل، نعرض loader
  if (unitsLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // لو في خطأ في جلب الـ units
  if (unitsError) {
    toast.error("Failed to load units for selection");
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("Add New Unit")}
        description={t("Create a new unit of measurement")}
        submitButtonText={t("Create Unit")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/unit")}
        initialData={{
          status: true,
          is_base_unit: true, // افتراضيًا الوحدة الجديدة base
          operator: "*",
          operator_value: 1,
        }}
        loading={loading}
      />
    </div>
  );
};

export default UnitAdd;