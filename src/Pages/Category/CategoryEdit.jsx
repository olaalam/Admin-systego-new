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
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/api/admin/category/${id}`);

        console.log("🔍 Full API Response:", res.data.data);

        const category = res.data.data.category;
        const parent = res.data.data.Parent;

        // إعداد الـ parent options
        const parents = parent
          ? [{ value: parent._id, label: parent.name }]
          : [];

        setParentOptions(parents);

        setCategoryData({
          name: category.name || "",
          ar_name: category.ar_name || "",
          image: category.image || "",
          parentId: category.parentId?._id || "", // نخزن id فقط
        });
      } catch (err) {
toast.error(t("failed_to_fetch_category_data"));
        console.error("❌ Error fetching category:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id]);

  const fields = [
    { key: "ar_name", label: t("Name(Arabic)"), required: true },
{ key: "name", label: t("Name(English)"), required: false },

    { key: "image", label: t("Image"), type: "image", required: true },
    {
      key: "parentId",
      label: t("ParentCategory"),
      type: "select",
      options: parentOptions, // هنا هنمرر القايمة
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
