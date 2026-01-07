// src/pages/CouponEdit.jsx (اقترح تغيير اسم الملف إلى CouponEdit.jsx)
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CouponEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { putData, loading: updating } = usePut(`/api/admin/coupon/${id}`);

  const [couponData, setCouponData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "coupon_code",
        label: t("CouponCode"),
        type: "text",
        required: true,
        placeholder: t("CouponCodePlaceholder"), // e.g. "WELCOME50"
        helperText: t("CouponCodeHelper"), // "Enter a unique coupon code (uppercase recommended)"
      },
      {
        key: "type",
        label: t("CouponType"),
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: t("Percentage") },
          { value: "flat", label: t("Flat") },
        ],
      },
      {
        key: "amount",
        label: t("Amount"),
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: "e.g. 50",
        helperText: t("AmountHelper"), // "For percentage: enter value like 50 for 50%. For flat: enter fixed amount."
      },
      {
        key: "minimum_amount",
        label: t("MinimumAmount"),
        type: "number",
        required: false,
        min: 0,
        step: "any",
        placeholder: "e.g. 200",
        helperText: t("MinimumAmountHelper"), // "Minimum order amount to apply coupon (optional)"
      },
      {
        key: "quantity",
        label: t("TotalQuantity"),
        type: "number",
        required: true,
        min: 1,
        placeholder: "e.g. 100",
        helperText: t("QuantityHelper"), // "Total number of times this coupon can be used"
      },
      {
        key: "expired_date",
        label: t("ExpiryDate"),
        type: "date",
        required: true,
        helperText: t("ExpiryDateHelper"), // "Coupon will expire at the end of this date"
      },
    ],
    [t]
  );

  /* =======================
     Fetch Coupon
  ======================= */
  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/coupon/${id}`);
        // افترض نفس هيكل الـ response السابق: res.data.data.coupon
        const coupon = res.data?.data?.coupon || res.data?.data;

        if (!coupon) {
          toast.error(t("CouponNotFound"));
          navigate("/coupon");
          return;
        }

        setCouponData({
          coupon_code: coupon.coupon_code || "",
          type: coupon.type || "percentage",
          amount: Number(coupon.amount) || 0,
          minimum_amount: Number(coupon.minimum_amount) || "",
          quantity: Number(coupon.quantity) || 1,
          // تنسيق التاريخ لـ input type="date" (YYYY-MM-DD)
          expired_date: coupon.expired_date
            ? new Date(coupon.expired_date).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        console.error("❌ Error fetching coupon:", err);
        toast.error(t("FailedToLoadCouponData"));
        navigate("/coupon");
      } finally {
        setFetching(false);
      }
    };

    fetchCoupon();
  }, [id, navigate, t]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        coupon_code: formData.coupon_code.trim().toUpperCase(), // اختياري: تحويل إلى uppercase
        type: formData.type,
        amount: Number(formData.amount),
        minimum_amount: formData.minimum_amount ? Number(formData.minimum_amount) : undefined,
        quantity: Number(formData.quantity),
        expired_date: formData.expired_date,
      };

      // إزالة الحقول الفارغة إذا كان الـ backend لا يقبل undefined
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      await putData(payload);

      toast.success(t("CouponUpdatedSuccessfully"));
      navigate("/coupon");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedToUpdateCoupon");

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/coupon");

  if (fetching) return <Loader />;

  if (!couponData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">{t("CouponNotFound")}</p>
        <button
          onClick={() => navigate("/coupon")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          {t("BackToCoupons")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("EditCouponTitle", { code: couponData.coupon_code })}
        description={t("EditCouponDescription")}
        submitButtonText={t("UpdateCoupon")}
        fields={fields}
        initialData={couponData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}