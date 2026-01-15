// src/pages/TaxesAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const TaxesAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
    const fields = [
      {
        key: "name",
        label: t("Name(English)"),
        type: "text",
        required: true,
    placeholder: t("e.g. Tax (10%)"), // مثال: ضريبة (10%)
      },
      {
        key: "ar_name",
        label: t("Name(Arabic)"),
        type: "text",
        required: true,
    placeholder: t("e.g. Tax (10%)"), // مثال: ضريبة (10%)
      },
      {
        key: "type",
    label: t("Tax Type"), // نوع الضريبة
        type: "select",
        required: true,
        options: [
         { value: "percentage", label: t("Percentage (%)") }, // نسبة مئوية (%)
      { value: "fixed", label: t("Fixed Amount") },        // قيمة ثابتة
    ],
    placeholder: t("Select tax type"), // اختر نوع الضريبة
      },
      {
        key: "amount",
    label: t("Amount"), // القيمة
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: t("e.g. 10"), // مثال: 10
    helperText: t("For percentage, enter 10 for 10%"), // بالنسبة للنسبة المئوية، أدخل 10 لـ 10%
      },
      {
        key: "status",
    label: t("Active Status"), // الحالة النشطة
        type: "switch",
        required: false,
      },
    ];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        type: formData.type,
        status: formData.status ?? true,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
      };

      await api.post("/api/admin/taxes", payload);

      toast.success(t("Tax added successfully"));
      navigate("/taxes");
    } catch (err) {
      console.error("❌ Error adding tax:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failed to add tax");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("Add New Tax")}
        description={t("Create a new tax")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/taxes")}
        initialData={{
          status: true,
          type: "percentage",
          amount: 10,
        }}
        loading={loading}
        submitButtonText={t("Create Tax")}
      />
    </div>
  );
};

export default TaxesAdd;
