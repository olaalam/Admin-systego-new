// src/pages/currencyAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const CurrencyAdd = () => {
  const navigate = useNavigate();

  const { postData, loading } = usePost("/api/admin/currency");
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ✅ تعديل الحقول لتتوافق مع body الجديد
  const fields = [
    { key: "name", label: t("CurrencyName"), required: true },
    { key: "ar_name", label: t("ArabicName"), required: true },
    { key: "amount", label: t("Amount"), required: true, type: "number" },
  ];

  const handleSubmit = async (data) => {
    try {
      console.log("📤 Submitting data:", data);

      await postData(data);

      toast.success(t("CurrencyAddedSuccessfully"));
      navigate("/currency");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoaddcurrency");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
     title={t("add_currency_title")}
description={t("add_currency_description")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/currency")}
        loading={loading}
        initialData={{ name: "", ar_name: "", amount: "" }}
      />
    </div>
  );
};

export default CurrencyAdd;
