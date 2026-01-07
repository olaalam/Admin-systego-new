// src/pages/CashierAdd.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";

const CashierAdd = () => {
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ✅ جلب البنك و المخازن
  const { data, loading } = useGet("/api/admin/cashier/select");
  const bankAccounts = data?.bankAccounts || [];
  const warehouses = data?.warehouse || [];

  // ✅ إضافة كاشير
  const { postData, loading: submitting } = usePost("/api/admin/cashier/");

  // ✅ خيارات المخازن
  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        value: w._id,
        label: w.name,
      })),
    [warehouses]
  );

  // ✅ خيارات الحسابات البنكية
  const bankAccountOptions = useMemo(
    () =>
      bankAccounts.map((b) => ({
        value: b._id,
        label: `${b.name} (${b.balance})`,
      })),
    [bankAccounts]
  );

  // ✅ الحقول
  const fields = useMemo(
    () => [
      { key: "name", label: t("Name"), required: true },
      { key: "ar_name", label: t("ArabicName"), required: true },

      {
        key: "warehouse_id",
        label: t("Warehouse"),
        type: "select",
        required: true,
        options: warehouseOptions,
        disabled: loading,
        placeholder: loading ? "Loading warehouses..." : "Select warehouse",
      },

      {
        key: "balance",
        label: t("InitialBalance"),
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 90000",
      },

      {
        key: "bankAccounts",
        label: t("BankAccounts"),
        type: "multiselect",
        required: false,
        options: bankAccountOptions,
        disabled: loading,
        placeholder: loading ? "Loading bank accounts..." : "Select bank accounts",
      },

      {
        key: "status",
        label: t("Status"),
        type: "switch",
        required: true,
      },
    ],
    [warehouseOptions, bankAccountOptions, loading]
  );

  // ✅ إرسال البيانات
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        status: Boolean(formData.status),
        bankAccounts: Array.isArray(formData.bankAccounts) ? formData.bankAccounts : [],
        balance: String(formData.balance),
      };

      await postData(payload);

      toast.success(t("Cashieraddedsuccessfully"));
      navigate("/cashier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message || err.response?.data?.message || "Failed to add cashier";
      const errorDetails = err.response?.data?.error?.details;

      if (Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddCashier")}
        description={t("Fill in the cashier information")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/cashier")}
        loading={submitting}
        initialData={{
          name: "",
          ar_name: "",
          warehouse_id: "",
          balance: "",
          bankAccounts: [],
          status: true,
        }}
      />
    </div>
  );
};

export default CashierAdd;
