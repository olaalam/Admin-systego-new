// src/pages/warehouseAdd.jsx (النسخة النهائية باستخدام usePost)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const WareHouseAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/warehouse/");

  const fields = [
    { key: "name", label: t("Name"), required: true },
    { key: "address", label: t("Address"), required: true },
    { key: "phone", label: t("Phone"), required: true },
    { key: "email", label: t("Email"), type: "email", required: true },
    { key: "Is_Online", label: t("Is Online"), type: "checkbox", required: true },
    // إضافة حقل اختياري لتحديد ما إذا كان المستودع هو المستودع الافتراضي
  ];

  const handleSubmit = async (data) => {
    try {
      // ⭐️ استخدام postData بدلاً من api.post
      await postData(data);

      toast.success(t("Warehouse added successfully"));
      navigate("/warehouse");
    } catch (err) {
      // ✅ التعامل مع الأخطاء التفصيلية (مطابقة لـ AdminAdd.jsx)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add warehouse");

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("Add Branch")}
        description={t("Fill in the Branch details")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/warehouse")}
        // ⭐️ استخدام حالة التحميل من الـ Hook
        loading={loading}
        initialData={{
          name: "",
          address: "",
          phone: "",
          email: "",
          Is_Online: false,
          // stock_Quantity: 0, // 💡 هذا الحقل قد يكون غير ضروري في initialData لصفحة الإضافة
        }}
      />
    </div>
  );
};

export default WareHouseAdd;