// src/pages/CityAdd.jsx (النسخة النهائية باستخدام usePost)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 
import Loader from "@/components/Loader"; // نحتاج Loader إذا أردنا إظهار التحميل قبل ظهور الفورم
import { useTranslation } from "react-i18next";

const CityAdd = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [fetchingCountries, setFetchingCountries] = useState(true); // ⭐️ حالة تحميل لجلب الدول
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading: submitting } = usePost("/api/admin/city");

  // جلب الدول من API
  useEffect(() => {
    const fetchCountries = async () => {
      setFetchingCountries(true);
      try {
        const response = await api.get("/api/admin/city");
        const countryList = response.data?.data?.countries || [];
        setCountries(countryList);
      } catch (err) {
        toast.error(t("Failedtoloadcountries"));
        console.error("Error fetching countries:", err);
      } finally {
        setFetchingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // ⭐️ استخدام useMemo لتعريف الحقول بناءً على حالة تحميل الدول
  const fields = useMemo(() => {
    const countryOptions = countries.map((country) => ({
      label: country.name,
      value: country._id,
    }));
    
    return [
{ key: "ar_name", label: t("Name(Arabic)"), required: true },
{ key: "name", label: t("Name(English)"), required: false },
{key:"shipingCost",label:t("ShippingCost"),type:"number",required:false},
{
        key: "country", // ⭐️ تغيير key إلى countryId ليتوافق مع متطلبات الـ API الشائعة
        label: t("Country"),
        type: "select",
        required: true,
        options: countryOptions,
        disabled: fetchingCountries, // تعطيل حتى يتم تحميل البيانات
        placeholder: fetchingCountries  ? t("loading_countries")
    : t("select_country")
      },
    ];
  }, [countries, fetchingCountries]);

  // الإرسال
  const handleSubmit = async (data) => {
    try {
      // ⭐️ التأكد من أن payload يحوي countryId وليس country
      const payload = {
        name: data.name,
        ar_name: data.ar_name,
        shipingCost: data.shipingCost,
        country: data.country, // نستخدم countryId بدلاً من country في الـ key
      };

      // ⭐️ استخدام postData بدلاً من api.post
      await postData(payload); 

      toast.success(t("City added successfully"));
      navigate("/city");
    } catch (err) {
      // ✅ التعامل مع الأخطاء (استخدام نفس منطق عرض الأخطاء المفصل)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoaddcity");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  // إذا كنا نحمّل الدول، يمكن عرض Loader بدلاً من الفورم
  // if (fetchingCountries && countries.length === 0) {
  //    return <Loader />;
  // }

  return (
    <div className="p-6">
      <AddPage
        title={t("AddCity")}
        description={t("Select country and enter city name")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/city")}
        // ⭐️ دمج حالة التحميل: الإرسال أو جلب الدول
        loading={submitting || fetchingCountries} 
        initialData={{ name: "", countryId: "" }}
      />
    </div>
  );
};

export default CityAdd;