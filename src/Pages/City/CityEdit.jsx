import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/city/${id}`);
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [cityData, setCityData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات المدينة والدول
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/city/${id}`);
        const city = res.data?.data?.city || {};
        const allCountries = res.data?.data?.countries || [];

        setCountries(allCountries);

        setCityData({
          name: city.name || "",
          ar_name: city.ar_name || "",
          shipingCost: city.shipingCost || 0,
          country: city.country?._id || "",
        });
      } catch (err) {
        toast.error(t("Failed to fetch city data"));
        console.error("❌ Error fetching city:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(() => [
    { key: "name", label: t("Name(Arabic)"), required: true },
    { key: "ar_name", label: t("Name(Arabic)"), required: true },
    { key: "shipingCost", label: t("ShippingCost"), type: "number", required: false },
    {
      key: "country",
        label: t("Country"),
      type: "select",
      required: true,
      options: countries.map((c) => ({ label: c.name, value: c._id })),
    },
  ], [countries]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success(t("City updated successfully!"));
      navigate("/city");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoupdatecity");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/city");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {cityData && (
        <AddPage
       title={t("edit_city_title", { name: cityData?.name || "..." })}
description={t("edit_city_description")}
          fields={fields}
          initialData={cityData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
