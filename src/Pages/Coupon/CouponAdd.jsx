// src/pages/CouponAdd.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CouponAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
        key: "minimum_amount",
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
        key: "available",
        label: t("InitialAvailable"),
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 100",
        helperText: t("InitialAvailableHelper"), // "Initial number of available uses. For new coupons, usually set equal to total quantity."
      },
      {
        key: "expired_date",
        label: t("ExpiryDate"),
        type: "date",
        required: true,
        helperText: t("ExpiryDateHelper"),
      },
    ],
    [t]
  );

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        coupon_code: formData.coupon_code.trim().toUpperCase(),
        type: formData.type,
        amount: Number(formData.amount),
        minimum_amount: formData.minimum_amount ? Number(formData.minimum_amount) : undefined,
        quantity: Number(formData.quantity),
        available: Number(formData.available),
        expired_date: formData.expired_date,
      };

      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      await api.post("/api/admin/coupon", payload);

      toast.success(t("CouponAddedSuccessfully"));
      navigate("/coupon");
    } catch (err) {
      console.error("❌ Error adding coupon:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedToAddCoupon");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddNewCoupon")}
        description={t("AddNewCouponDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/coupon")}
        initialData={{
          type: "percentage",
          amount: 50,
          quantity: 100,
          available: 100, // افتراضي يساوي الـ quantity
        }}
        loading={loading}
        submitButtonText={t("CreateCoupon")}
      />
    </div>
  );
};

export default CouponAdd;