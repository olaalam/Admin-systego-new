// src/pages/ProductAdd.jsx (النسخة النهائية بعد تصحيح الـ boolean)
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import ProductForm from "./ProductForm";
import { useTranslation } from "react-i18next";

const ProductAdd = () => {
  const navigate = useNavigate();

  // ✅ استخدام usePost لإدارة الإرسال والتحميل
  const { postData, loading } = usePost("/api/admin/product");
  const { t ,i18n } = useTranslation();

  // ----------------------------------------------------------------------
  // ✅ handleAdd — ترسل البيانات للـ API وتتعامل مع الأخطاء
  // ----------------------------------------------------------------------
  const handleAdd = async (data) => {
    try {
      // ✅ تجهيز الـ payload بدون أي تحويل للقيم المنطقية
      const payload = {
        ...data,
        exp_ability: !!data.exp_ability,        // تأكيد أنها boolean
        product_has_imei: !!data.product_has_imei,
        show_quantity: !!data.show_quantity,
        is_featured: !!data.is_featured,
      };

      console.log("📦 Payload sent to backend:", payload);

      // ✅ إرسال البيانات للـ API
      await postData(payload);

      toast.success(t("Productaddedsuccessfully"));
      navigate("/product");
    } catch (err) {
      // ⭐️ التعامل مع الأخطاء التفصيلية من الـ API
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add product");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error adding product:", err.response?.data || err);
    }
  };

  // ----------------------------------------------------------------------
  // ✅ عرض الفورم وتمرير حالة التحميل ووظيفة الإرسال
  // ----------------------------------------------------------------------
  return (
    <ProductForm 
      mode="add" 
      onSubmit={handleAdd} 
      loading={loading} 
    />
  );
};

export default ProductAdd;
