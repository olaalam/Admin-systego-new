// src/pages/SupplierAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const SupplierAdd = () => {
  const navigate = useNavigate();
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  // ⭐️ نفس المتغيرات المستخدمة في Edit
  const [allCountries, setAllCountries] = useState([]); // كل الدول
  const [allCitiesByCountry, setAllCitiesByCountry] = useState({}); // مدن مفهرسة حسب الدولة
  const [selectedCountryId, setSelectedCountryId] = useState(""); // الدولة المختارة
  const [fetchingLists, setFetchingLists] = useState(true);

  // ⭐️ استخدام usePost للإضافة
  const { postData, loading: submitting } = usePost("/api/admin/supplier/");

  // ✅ حساب المدن المتاحة بناءً على الدولة المختارة (نفس Edit)
  const availableCities = useMemo(() => {
    if (!selectedCountryId) return [];
    return allCitiesByCountry[selectedCountryId] || [];
  }, [selectedCountryId, allCitiesByCountry]);

  // ✅ الحقول (متطابقة مع Edit)
  const fields = useMemo(
    () => [
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
          // امسح المدينة القديمة (مهم للـ Add)
          // setSupplierData(prev => ({ ...prev, cityId: "" })); // مش ضروري هنا لأن initialData فاضي، لكن ممكن نضيفه لو عندك state للـ formData
        },
      },
      {
        key: "cityId",
        label:t("City"),
        type: "select",
        required: true,
        options: availableCities.map((city) => ({
          value: city._id,
          label: city.name,
        })),
        disabled: !selectedCountryId || availableCities.length === 0 || fetchingLists,
        placeholder: fetchingLists ? t("Loading cities...") : t("Select city"),
      },
      { key: "image", label: t("Image"), type: "image", required: true },
    ],
    [allCountries, availableCities, selectedCountryId, fetchingLists]
  );

  // ✅ جلب الدول والمدن عند التحميل (نفس الطريقة في Edit)
  useEffect(() => {
    const fetchLists = async () => {
      setFetchingLists(true);
      try {
        // افترض إن الـ endpoint ده بيرجع countries مع cities داخل كل country
        const res = await api.get("/api/admin/supplier"); // أو أي endpoint مناسب، لو مختلف غيّره
        const countriesList = res.data?.data?.countries || []; // تأكد من الهيكل

        if (!Array.isArray(countriesList)) {
          throw new Error("Invalid countries data");
        }

        // فهرسة المدن حسب الدولة
        const citiesByCountry = {};
        countriesList.forEach((country) => {
          citiesByCountry[country._id] = country.cities || [];
        });

        setAllCountries(countriesList);
        setAllCitiesByCountry(citiesByCountry);
      } catch (err) {
        toast.error(t("Failed to load countries and cities"));
        console.error("❌ Error loading lists:", err);
      } finally {
        setFetchingLists(false);
      }
    };

    fetchLists();
  }, []);

  // ✅ إرسال البيانات
  const handleSubmit = async (formData) => {
    try {
      await postData(formData);
      toast.success(t("Supplier added successfully"));
      navigate("/supplier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add supplier");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  // ⭐️ عرض Loader أثناء جلب القوائم
  if (fetchingLists) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("Add Supplier")}
        description={t("Fill in the supplier information and upload image")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/supplier")}
        loading={submitting}
        initialData={{}} // فاضي لأنها إضافة جديدة
      />
    </div>
  );
};

export default SupplierAdd;