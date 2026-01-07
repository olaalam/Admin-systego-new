import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function SupplierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/supplier/${id}`);

  const [supplierData, setSupplierData] = useState(null);
  const [allCountries, setAllCountries] = useState([]); 
  const [allCitiesByCountry, setAllCitiesByCountry] = useState({});
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);

  // نحسب المدن المتاحة بناءً على الدولة المختارة
  const availableCities = useMemo(() => {
    if (!selectedCountryId) return [];
    return allCitiesByCountry[selectedCountryId] || [];
  }, [selectedCountryId, allCitiesByCountry]);

  // تحديث الـ fields ديناميكياً
  const fields = useMemo(() => [
    { key: "username", label: t("Username"), required: true },
    { key: "company_name", label: t("CompanyName"), required: true },
    { key: "email", label: "Email", type: t("email"), required: true },
    { key: "phone_number", label: t("PhoneNumber"), required: true },
    { key: "address", label: t("Address"), required: true },
 {
    key: "countryId",
    label: t("Country"),
    type: "select",
    required: true,
    options: allCountries.map((country) => ({
      value: country._id,
      label: country.name,
    })),
    onChange: (value) => {
      setSelectedCountryId(value);
      setSupplierData(prev => ({ ...prev, cityId: "" })); // امسح المدينة القديمة
    },
  },
{
    key: "cityId",
    label: t("City"),
    type: "select",
    required: true,
    options: availableCities.map((city) => ({
      value: city._id,
      label: city.name,
    })),
      // إذا مفيش مدن للدولة المختارة، نعطل الـ select
    disabled: !selectedCountryId || availableCities.length === 0,
    },
    { key: "image", label: t("Image"), type: "image", required: true },
  ],[allCountries, availableCities, selectedCountryId]);

useEffect(() => {
  const fetchSupplier = async () => {
    try {
      setFetching(true); // تأكد إنه true في البداية

      const res = await api.get(`/api/admin/supplier/${id}`);
      const supplier = res.data?.data?.supplier;
      const countriesList = res.data?.data?.countries || [];

      if (!supplier) {
        toast.error(t("Supplier not found"));
        navigate("/supplier");
        return;
      }

      // فهرسة المدن حسب الدولة
      const citiesByCountry = {};
      countriesList.forEach(country => {
        citiesByCountry[country._id] = country.cities || [];
      });

      setAllCountries(countriesList);
      setAllCitiesByCountry(citiesByCountry);

      const initialData = {
        username: supplier.username || "",
        company_name: supplier.company_name || "",
        email: supplier.email || "",
        phone_number: supplier.phone_number || "",
        address: supplier.address || "",
        countryId: supplier.countryId?._id || "",
        cityId: supplier.cityId?._id || "",
        image: supplier.image || "",
      };

      setSupplierData(initialData);

      // أهم حاجة: نحدث الدولة المختارة أولاً عشان المدن تظهر
      setSelectedCountryId(initialData.countryId);

    } catch (err) {
      toast.error(t("Failed to fetch supplier data"));
      console.error("❌ Error fetching supplier:", err);
    } finally {
      setFetching(false);
    }
  };

  fetchSupplier();
}, [id, navigate]); // أضف navigate لو مش موجود

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success(t("Supplier updated successfully"));
      navigate("/supplier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to update supplier");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/supplier");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {supplierData && (
        <AddPage
          title={`${t("EditSupplier")}: ${supplierData.username || "..."}`}
          description={t("Update supplier details")}
          fields={fields}
          initialData={supplierData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}