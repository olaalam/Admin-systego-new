import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const ExpensesAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  /* =========================
     Get Select Data
  ========================= */
  const { data, loading } = useGet("/api/admin/expense/selection");

  const categories = data?.categories || [];
  const accounts = data?.accounts || [];

  const categoryOptions = categories.map((cat) => ({
    label: `${cat.name} - ${cat.ar_name}`,
    value: cat._id,
  }));

  const accountOptions = accounts.map((acc) => ({
    label: acc.name,
    value: acc._id,
  }));

  /* =========================
     Form Fields
  ========================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("ExpensesName"),
        type: "text",
        required: true,
    placeholder: t("ExpenseNamePlaceholder"),
      },
      {
        key: "amount",
        label: t("Amount"),
        type: "number",
        required: true,
    placeholder: t("AmountPlaceholder"),
      },
      {
        key: "Category_id",
        label: t("Category"),
        type: "select",
        required: true,
        options: categoryOptions,
    placeholder: t("SelectCategory"),
      },
      {
        key: "financial_accountId",
        label: t("FinancialAccount"),
        type: "select",
        required: true,
        options: accountOptions,
    placeholder: t("SelectAccount"),
      },
      {
        key: "note",
        label: t("Note"),
        type: "textarea",
        required: false,
    placeholder: t("NotePlaceholder"),
      },
    ],
    [categoryOptions, accountOptions]
  );

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        Category_id: formData.Category_id,
        financial_accountId: formData.financial_accountId,
        note: formData.note,
      };

      await api.post("/api/admin/expense", payload);

      toast.success(t("expenseaddedsuccessfully"));
      navigate("/expense");
    } catch (err) {
      console.error("❌ Error adding expense:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
       t( "Failedtoaddexpense");

      toast.error(message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
         title={t("AddNewExpense")}
  description={t("AddNewExpenseDescription")}
  submitButtonText={t("CreateExpense")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/expense")}
        initialData={{
          name: "",
          amount: "",
          Category_id: "",
          financial_accountId: "",
          note: "",
        }}
      />
    </div>
  );
};

export default ExpensesAdd;
