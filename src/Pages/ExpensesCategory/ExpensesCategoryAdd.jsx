// src/pages/ExpenseCategoryAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ExpenseCategoryAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

const fields = [
  {
    key: "name",
    label: t("NameEnglish"),
    type: "text",
    required: true,
    placeholder: t("NameEnglishPlaceholder"),
  },
  {
    key: "ar_name",
    label: t("NameArabic"),
    type: "text",
    required: true,
    placeholder: t("NameArabicPlaceholder"),
  },
  {
    key: "status",
    label: t("ActiveStatus"),
    type: "switch",
    required: false,
  },
];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // ✅ إرسال البيانات للـ API
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        status: formData.status,
      };

      await api.post("/api/admin/expenseCategory", payload);

      toast.success(t("Expense category added successfully"));
      navigate("/expense");
    } catch (err) {
      console.error("❌ Error adding expense category:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failedtoaddexpensecategory");

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
       title={t("AddNewExpenseCategory")}
  description={t("AddNewExpenseCategoryDescription")}
  submitButtonText={t("CreateExpenseCategory")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/expense")}
        initialData={{
          status: true, // افتراضيًا active
        }}
        loading={loading}
      />
    </div>
  );
};

export default ExpenseCategoryAdd;