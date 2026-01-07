// src/pages/brandAdd.jsx (النسخة النهائية باستخدام usePost)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const BrandAdd = () => {
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const fields = [
{ key: "ar_name", label: t("Name(Arabic)"), required: true },
{ key: "name", label: t("Name(English)"), required: false },
    { key: "logo", label: t("Logo"), type: "image", required: true },
    // يمكن إضافة حقل الحالة لتفعيل/تعطيل العلامة التجارية عند الإضافة
  ];

  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/brand/");

  const handleSubmit = async (data) => {
    try {
      // ⭐️ استخدام postData بدلاً من api.post
      await postData(data);
      
      toast.success(t("Brand added successfully"));
      navigate("/brand");
    } catch (err) {
      // ✅ التعامل مع الأخطاء (يمكن ترك هذا الجزء داخل المكون أو نقله للـ Hook حسب التصميم)
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        t("FailedtoaddBrand");
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
      
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title={t("AddBrand")}
        description={t("AddBrandDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/brand")}
        // ⭐️ استخدام حالة التحميل من الـ Hook
        loading={loading}
        // إضافة logo كقيمة أولية فارغة إذا كان مطلوبًا في الفورم
        initialData={{ name: "", logo: "", status: true }} 
      />
    </div>
  );
};

export default BrandAdd;