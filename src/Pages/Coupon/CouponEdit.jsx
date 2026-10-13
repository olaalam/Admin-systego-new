// src/pages/CouponEdit.jsx
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

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
        placeholder: t("CouponCodePlaceholder"),
        helperText: t("CouponCodeHelper"),
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
        helperText: t("AmountHelper"),
      },
      {
        key: "minimum_amount_for_use",
        label: t("MinimumAmount"),
        type: "number",
        required: false,
        min: 0,
        step: "any",
        placeholder: "e.g. 200",
        helperText: t("MinimumAmountHelper"),
      },
      {
        key: "quantity",
        label: t("TotalQuantity"),
        type: "number",
        required: true,
        min: 1,
        placeholder: "e.g. 100",
        helperText: t("QuantityHelper"),
      },
      {
        key: "expired_date",
        label: t("ExpiryDate"),
        type: "date",
        required: true,
        helperText: t("ExpiryDateHelper"),
      },

      // ✅ حقل الصورة (base64)
      {
        key: "image",
        label: isRTL ? "صورة الكوبون" : "Coupon Image",
        type: "image",
        required: false,
        helperText: t("CouponImageHelper"),
      },
    ],
    [t],
  );

  /* =======================
     Fetch Coupon
  ======================= */
  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/coupon/${id}`);
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
          minimum_amount_for_use: Number(coupon.minimum_amount_for_use) || "",
          quantity: Number(coupon.quantity) || 1,
          expired_date: coupon.expired_date
            ? new Date(coupon.expired_date).toISOString().split("T")[0]
            : "",
          image: coupon.image || "", // ✅ الصورة الحالية
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
        coupon_code: formData.coupon_code.trim().toUpperCase(),
        type: formData.type,
        amount: Number(formData.amount),
        minimum_amount_for_use: formData.minimum_amount_for_use
          ? Number(formData.minimum_amount_for_use)
          : undefined,
        quantity: Number(formData.quantity),
        expired_date: formData.expired_date,
        image: formData.image || undefined, // ✅ base64 (جديدة) أو URL (قديمة)
      };

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key],
      );

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
