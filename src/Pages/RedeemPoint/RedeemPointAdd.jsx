// src/pages/RedeemPointAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const RedeemPointAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  /* =======================
     Fields
  ======================= */
  const fields = [
    {
      key: "amount",
      label: t("Amount"),
      type: "number",
      required: true,
      min: 0,
      placeholder: "e.g. 30",
    },
    {
      key: "points",
      label: t("Points"),
      type: "number",
      required: true,
      min: 0,
      placeholder: "e.g. 30",
    },
  ];

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        amount: Number(formData.amount),
        points: Number(formData.points),
      };

      await api.post("/api/admin/redeem-points", payload);

      toast.success(t("RedeemPointaddedsuccessfully"));
      navigate("/redeem-point");
    } catch (err) {
      console.error("❌ Error adding RedeemPoint:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("FailedtoaddRedeemPoint");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
    title={t("redeemPointt.addTitle")}
description={t("redeemPointt.addDescription")}
submitButtonText={t("redeemPointt.addSubmit")}


        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/redeem-point")}
        initialData={{
          amount: "",
          points: "",
        }}
        loading={loading}
      />
    </div>
  );
};

export default RedeemPointAdd;
