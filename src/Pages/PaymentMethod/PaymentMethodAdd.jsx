import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const PaymentMethodAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل
  const { t, i18n } = useTranslation();

  const fields = [
    { key: "name", label: t("Name"), required: true },
    {key:"ar_name",label:t("ArabicName"),required:true},
    { key: "discription", label: t("Description"), required: true },
    { key: "icon", label: t("Icon / Logo"), type: "image", required: true },
          {
        key: "type",
        label: t("PaymentType"),
        type: "select",
        required: true,
        options: [
          { value: "manual", label: t("Manual") },
          { value: "automatic", label: t("Automatic") },
        ],
      },
  ];

  const handleSubmit = async (data) => {
    setLoading(true); // ✅ تعطيل الزر
    try {
      await api.post("/api/admin/payment_method/", data);
      toast.success(t("PaymentMethodAddedSuccessfully"));
      navigate("/payment_method");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoaddpaymentmethod");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    } finally {
      setLoading(false); // ✅ إعادة التمكين بعد الانتهاء
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title={t("AddPaymentMethodTitle")}
  description={t("AddPaymentMethodDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/payment_method")}
        initialData={{ status: true }}
        loading={loading} // ✅ تمرير الحالة إلى AddPage
      />
    </div>
  );
};

export default PaymentMethodAdd;
