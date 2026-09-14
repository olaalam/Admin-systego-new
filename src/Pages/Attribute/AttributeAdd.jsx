// src/pages/VariationAdd.jsx (النسخة النهائية والمحسّنة)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import usePost from "@/hooks/usePost"; // ✅ يتم استخدام usePost بشكل صحيح
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// ⭐️ تم تغيير اسم المكون ليعكس اسم الملف (VariationAdd)
const VariationAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

const fields = [
  { key: "ar_name", label: t("NameArabic"), required: true },
  { key: "name", label: t("NameEnglish"), required: false },
  {
    key: "options",
    label: t("Options"),
    type: "array", // Array input
    uniqueSubKey: "name",
    subFields: [
      { key: "name", label: t("OptionName"), required: true },
      // ✅ type: "switch" بدل checkbox
      { key: "status", label: t("Status"), type: "switch", initialValue: true },
    ],
  },
];

  // ✅ استخدام Hook: جلب الدالة postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/variation");

  const handleSubmit = async (data) => {
    try {
      // 1. تصفية الخيارات الفارغة تماماً
      const validOptions = (data.options || []).filter((opt) => opt.name && opt.name.trim() !== "");

      // 2. التحقق من تكرار أسماء الخيارات في نفس الفاريشن
      const rawOptions = validOptions.map((opt) => opt.name.trim());
      const lowerOptions = rawOptions.map((n) => n.toLowerCase());
      const duplicateIndex = lowerOptions.findIndex((name, idx) => lowerOptions.indexOf(name) !== idx);

      if (duplicateIndex !== -1) {
        const duplicateName = rawOptions[duplicateIndex];
        toast.error(`مينفعش، خيار "${duplicateName}" متسجل وموجود قبل كده في نفس الفاريشن!`);
        return;
      }

      // تجهيز الـ payload بالخيارات الصالحة فقط
      const payload = {
        name: data.name,
        ar_name: data.ar_name,
        options: validOptions.map((opt) => ({
          name: opt.name.trim(),
          status: opt.status ?? false, 
        })),
      };

      console.log("🚀 Sending payload:", payload);

      // ⭐️ يتم إرسال البيانات وإدارة التحميل والأخطاء بواسطة Hook usePost
      await postData(payload); 

      toast.success(t("Variationaddedsuccessfully"));
      // ✅ تعديل مسار التنقل ليكون مطابقًا لـ Variations (افتراضًا)
      navigate("/attribute"); 
    } catch (err) {
      // ✅ التعامل مع الأخطاء كما هو معتاد (يُفترض أن usePost يعيد الخطأ بعد معالجته)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoaddvariation");

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
        title={t("AddVariation")}
  description={t("AddVariationDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        // ✅ تعديل مسار الإلغاء ليكون مطابقًا لـ Variations (افتراضًا)
        onCancel={() => navigate("/attribute")}
        // ✅ استخدام حالة التحميل من الـ Hook
        loading={loading}
      />
    </div>
  );
};

// ⭐️ تم تغيير اسم التصدير ليتطابق مع اسم المكون الجديد
export default VariationAdd;