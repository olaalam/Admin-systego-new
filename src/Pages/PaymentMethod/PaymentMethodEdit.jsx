import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function PaymentMethodEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { putData, loading: updating } = usePut(
    `/api/admin/payment_method/${id}`
  );

  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ تعديل: استخدام أسماء الحقول حسب JSON (icon, discription, isActive)
  const fields = useMemo(() => [
    { key: "name", label: t("Name"), required: true },
    {key:"ar_name",label:t("ArabicName"),required:true},

    { key: "discription", label: t("Description"), required: true }, // تغيير إلى discription
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
  ], []);

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const res = await api.get(`/api/admin/payment_method/${id}`);

        console.log("🔍 Full API Response:", res.data.data.paymentMethod);

        // يتم استخراج البيانات من المسار الصحيح: res.data.data.paymentMethod
        const paymentMethod = res.data.data.paymentMethod;

        console.log("🎯 Extracted paymentMethod:", paymentMethod);

        // ✅ تعديل: مطابقة أسماء الخصائص عند إعداد البيانات الأولية
        setPaymentMethodData({
          name: paymentMethod.name || "",
          ar_name:paymentMethod.ar_name||"",
          discription: paymentMethod.discription || "", // استخدام discription
          icon: paymentMethod.icon || "", // استخدام icon
           type: paymentMethod.type || "manual",
        });
      } catch (err) {
        toast.error(t("Failedtofetchpaymentmethoddata"));
        console.error("❌ Error fetching payment method:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchPaymentMethod();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // putData يتوقع formData تحتوي على المفاتيح الجديدة (icon, discription, isActive)
      await putData(formData);
      toast.success(t("Paymentmethodupdatedsuccessfully"));
      navigate("/payment_method");
    } catch (err) {
      // عرض الأخطاء من الـ API
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update payment method";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/payment_method");

  if (fetching) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {paymentMethodData && (
        <AddPage
         title={t("EditPaymentMethodTitle", { name: paymentMethodData?.name || "..." })}
  description={t("EditPaymentMethodDescription")}
          fields={fields}
          initialData={paymentMethodData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}