// src/pages/BankAccountAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const BankAccountAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { postData, loading: submitting } = usePost("/api/admin/bank_account/");

  const {
    data: warehouseData,
    loading: loadingWarehouses,
    error,
  } = useGet("/api/admin/bank_account/select-warehouses");

  const warehouses =
    warehouseData?.warehouses?.map((w) => ({
      label: w.name,
      value: w._id,
    })) || [];

  const fields = [
    // ⭐️ حقل الاسم بالعربية (مطلوب من الـ Backend)
    {
      key: "ar_name",
      label: isRTL ? "الاسم (بالعربية)" : "Name (Arabic)",
      type: "text",
      required: true,
      placeholder: isRTL ? "أدخل الاسم بالعربية" : "Enter name in Arabic",
    },
    // ⭐️ حقل الاسم بالإنجليزية
    {
      key: "name",
      label: t("BankName"),
      type: "text",
      required: true,
      placeholder: t("Enterbankname"),
    },
    {
      key: "warehouseId",
      label: t("Warehouse"),
      type: "select",
      required: true,
      placeholder: t("Selectwarehouse"),
      options: warehouses,
    },
    {
      key: "balance",
      label: t("InitialBalance"),
      type: "number",
      required: true,
      placeholder: "0",
    },
    {
      key: "description",
      label: t("Description"),
      type: "textarea",
      required: false,
      placeholder: t("Accountdescription"),
    },
    {
      key: "image",
      label: t("Image"),
      type: "image",
      required: false,
    },
    {
      key: "status",
      label: t("Active"),
      type: "switch",
      required: false,
    },
    {
      key: "in_POS",
      label: t("AvailableinPOS"),
      type: "switch",
      required: false,
    },
  ];

  const handleSubmit = async (data) => {
    try {
      const payload = {
        // ⭐️ إرسال ar_name
        ar_name: data.ar_name || "",
        name: data.name || "",
        warehouseId: Array.isArray(data.warehouseId)
          ? data.warehouseId
          : [data.warehouseId],
        // ⭐️ إرسال string فارغ بدلاً من null
        image: data.image || "",
        description: data.description || "",
        balance: String(data.balance),
        status: Boolean(data.status),
        in_POS: Boolean(data.in_POS),
      };

      console.log("📤 Submitting payload:", payload);

      await postData(payload);

      toast.success(t("Bankaccountaddedsuccessfully"));
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error adding bank account:", err);

      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add bank account";

      const errorDetails = err.response?.data?.error?.details;

      if (Array.isArray(errorDetails)) {
        errorDetails.forEach((d) => toast.error(d));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/accounting");

  if (loadingWarehouses) return <Loader />;

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center">
        {t("Failedtoloadwarehouses")}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddBankAccount")}
        description={t("Fillinthebankaccountdetails")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
        initialData={{
          ar_name: "", // ⭐️ إضافة القيمة الابتدائية
          name: "",
          warehouseId: "",
          image: "", // ⭐️ string فارغ بدلاً من null
          description: "",
          balance: "",
          status: true,
          in_POS: true,
        }}
      />
    </div>
  );
};

export default BankAccountAdd;
