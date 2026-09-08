// src/pages/categoryAdd.jsx (النسخة النهائية باستخدام usePost)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 
import { useTranslation } from "react-i18next";

const CategoryAdd = () => {
  const navigate = useNavigate();
  const [parentOptions, setParentOptions] = useState([]);
  const [fetchingParents, setFetchingParents] = useState(true); // ⭐️ حالة تحميل لجلب الفئات
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading: submitting } = usePost("/api/admin/category/");

  useEffect(() => {
    const fetchParentCategories = async () => {
      setFetchingParents(true);
      try {
        const res = await api.get("/api/admin/category");
        // يجب الانتباه إلى أن الـ API قد يعيد البيانات في res.data.data
        const parents = res.data?.data?.ParentCategories || []; 
        setParentOptions(
          parents.map((cat) => ({
            value: cat._id, // يتبعت للباك
            label: cat.name, // يظهر لليوزر
          }))
        );
      } catch (err) {
toast.error(t("failed_to_load_parent_categories"));
        console.error("Error fetching parent categories:", err);
      } finally {
        setFetchingParents(false);
      }
    };
    fetchParentCategories();
  }, []);

  // ⭐️ استخدام useMemo لتعريف الحقول بناءً على حالة تحميل الفئات
  const fields = useMemo(() => {
    // إذا كنا ما زلنا نحمّل الفئات، نعرض حقل Parent Category معطل
    const parentCategoryField = {
      key: "parentId",
      label: t("parent_category"),
      type: "select",
      options: parentOptions,
      disabled: fetchingParents, // تعطيل حتى يتم تحميل البيانات
placeholder: fetchingParents
    ? t("loading_categories")
    : t("select_parent_category_optional")
}


    return [
      { key: "ar_name", label: t("Name(Arabic)"), required: true },
      { key: "name", label: t("Name(English)"), required: false },
      { key: "image", label: t("Image"), type: "image", required: true },
      { key: "banner", label: isRTL ? "البانر" : "Banner", type: "image", required: false },
      { key: "order", label: isRTL ? "رقم الاوردر " : "Order Number", type: "number", min: 0, required: false, placeholder: isRTL ? "أدخل رقم الاوردر (اختياري)" : "Enter order number (optional)" },
      parentCategoryField,
    ];
  }, [parentOptions, fetchingParents, isRTL, t]); // يعتمد على البيانات وحالة التحميل

  const handleSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (payload.order !== undefined && payload.order !== "" && payload.order !== null) {
        payload.order = Number(payload.order);
      } else {
        delete payload.order;
      }
      if (!payload.banner) {
        delete payload.banner;
      }

      await postData(payload); 
      
      toast.success(t("category_added_successfully"));
      navigate("/category");
    } catch (err) {
      // ✅ التعامل مع الأخطاء (استخدام نفس منطق عرض الأخطاء المفصل)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("failed_to_add_category")

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
        title={t("add_category")}
        description={t("add_category_description")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/category")}
        loading={submitting || fetchingParents} 
        initialData={{ parentId: "", order: "" }}
      />
    </div>
  );
};

export default CategoryAdd;