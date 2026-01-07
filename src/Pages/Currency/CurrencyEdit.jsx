import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CurrencyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/currency/${id}`);

  const [currencyData, setcurrencyData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات البلد
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/currency/${id}`);
        const currency = res.data?.data?.currency || {};

        setcurrencyData({
          name: currency.name || "",
          ar_name: currency.ar_name || "",
          amount: currency.amount || "",
        });
      } catch (err) {
        toast.error(t("failed_to_fetch_currency"));
        console.error("❌ Error fetching currency:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(
    () => [
      { key: "name", label:t("CurrencyName"), required: true },
      { key: "ar_name", label:t("ArabicName"), required: true },
    { key: "amount", label: t("Amount"), required: true, type: "number" },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success(t("currency_updated_successfully"));
      navigate("/currency");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoupdatecurrency");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/currency");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {currencyData && (
        <AddPage
     title={t("edit_currency_title", { name: currencyData?.name || "..." })}
description={t("edit_currency_description")}

          fields={fields}
          initialData={currencyData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
