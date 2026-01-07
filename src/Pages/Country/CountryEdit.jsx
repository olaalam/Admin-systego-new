import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CountryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/country/${id}`);

  const [countryData, setcountryData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات المدينة والدول
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/country/${id}`);
        const country = res.data?.data?.country || {};
        const allCountries = res.data?.data?.countries || [];

        setCountries(allCountries);

        setcountryData({
          name: country.name || "",
          countryId: country.country?._id || "",
        });
      } catch (err) {
        toast.error(t("Failedtofetchcountrydata"));
        console.error("❌ Error fetching country:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(() => [
    { key: "name", label: t("Name"), required: true },

  ], [countries]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success(t("country_updated_successfully"));
      navigate("/country");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoupdatecountry");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/country");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {countryData && (
        <AddPage
       title={t("edit_country_title", { name: countryData?.name || "..." })}
description={t("edit_country_description")}
          fields={fields}
          initialData={countryData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
