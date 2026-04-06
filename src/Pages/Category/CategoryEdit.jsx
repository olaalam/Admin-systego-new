// src/pages/categoryEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/category/${id}`);

  const [categoryData, setCategoryData] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // ⭐️ استخدام Promise.all لجلب بيانات القسم الحالي وكل الأقسام في نفس الوقت
        const [categoryRes, parentsRes] = await Promise.all([
          api.get(`/api/admin/category/${id}`),
          api.get("/api/admin/category")
        ]);

        console.log("🔍 Category Data:", categoryRes.data.data);

        // 1. إعداد بيانات القسم الحالي
        const category = categoryRes.data.data.category;
        setCategoryData({
          name: category.name || "",
          ar_name: category.ar_name || "",
          image: category.image || "",
          parentId: category.parentId?._id || category.parentId || "", // ضمان أخذ الـ ID
        });

        // 2. إعداد قائمة الأقسام (بنفس طريقة كود الـ Add)
        const parents = parentsRes.data?.data?.ParentCategories || [];
        console.log("🔍 Parents Data:", parents);
        setParentOptions(
          parents
            .filter((cat) => cat._id !== id) // 🔥 منع القسم من أن يكون أب لنفسه لتجنب الأخطاء
            .map((cat) => ({
              value: cat._id,
              label: cat.name,
            }))
        );

      } catch (err) {
        toast.error(t("failed_to_fetch_category_data"));
        console.error("❌ Error fetching data:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const fields = [
    { key: "ar_name", label: t("Name(Arabic)"), required: true },
    { key: "name", label: t("Name(English)"), required: false },
    { key: "image", label: t("Image"), type: "image", required: true },
    {
      key: "parentId",
      label: t("ParentCategory"),
      type: "select",
      options: parentOptions, // تمرير القائمة الكاملة هنا
      placeholder: t("select_parent_category_optional")
    },
  ];

  const handleSubmit = async (formData) => {
    try {
      const payload = { ...formData };

      // لو الصورة string قديمة (URL) → ما نبعتهاش
      if (typeof payload.image === "string" && payload.image === categoryData.image) {
        delete payload.image;
      }

      await putData(payload);

      toast.success(t("category_updated_successfully"));
      navigate("/category");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoupdatecategory");

      toast.error(errorMessage);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/category");

  // عرض Loader أثناء جلب البيانات
  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {categoryData && (
        <AddPage
          title={t("edit_category_title", { name: categoryData?.name || "..." })}
          description={t("edit_category_description")}
          fields={fields}
          initialData={categoryData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}