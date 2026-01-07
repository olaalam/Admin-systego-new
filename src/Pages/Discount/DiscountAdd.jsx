// src/pages/DiscountAdd.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const DiscountAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("DiscountName"),
        type: "text",
        required: true,
        placeholder: t("DiscountNamePlaceholder")
      },

      {
        key: "type",
        label: t("DiscountType"),
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: t("Percentage") },
          { value: "fixed", label: t("FixedAmount") },
        ],
      },
      {
        key: "amount",
        label: t("Amount"),
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: "e.g. 15",
        helperText:
          "If percentage, enter 15 for 15%. If fixed, enter amount value.",
      },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
      };

      await api.post("/api/admin/discount", payload);

      toast.success(t("Discountaddedsuccessfully"));
      navigate("/discount");
    } catch (err) {
      console.error("❌ Error adding discount:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failedtoadddiscount");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddNewDiscount")}
  description={t("AddNewDiscountDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/discount")}
        initialData={{
          type: "percentage",
          amount: 15,
        }}
        loading={loading}
        submitButtonText={t("CreateDiscount")}  
      />
    </div>
  );
};

export default DiscountAdd;
