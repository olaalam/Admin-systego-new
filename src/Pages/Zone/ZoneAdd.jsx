// src/pages/ZoneAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

const ZoneAdd = () => {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  const { postData, loading: submitting } = usePost("/api/admin/zone");

  // 🔹 جلب الدول (والمدن جواها)
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const res = await api.get("/api/admin/zone/countries");

        setCountries(res.data?.data?.countries || []);
      } catch (err) {
        toast.error(t("Failed to load countries and cities"));
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 خيارات الدول
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({
      label: c.name,
      value: c._id,
    }));
  }, [countries]);

  // 🔹 المدن حسب الدولة المختارة
  const cityOptions = useMemo(() => {
    const country = countries.find((c) => c._id === selectedCountryId);
    return (
      country?.cities?.map((city) => ({
        label: city.name,
        value: city._id,
      })) || []
    );
  }, [countries, selectedCountryId]);

  // 🔹 إعداد الحقول
  const fields = useMemo(() => {
    return [
      { key: "name", label: t("ZoneName"), required: true },
       { key: "ar_name", label: t("ZoneName(Arabic)"), required: true },

      {
        key: "countryId",
        label: t("Country"),
        type: "select",
        required: true,
        options: countryOptions,
        disabled: fetching,
        onChange: (value, setFormData) => {
          setSelectedCountryId(value);

          // reset city لما تتغير الدولة
          setFormData((prev) => ({
            ...prev,
            countryId: value,
            cityId: "",
          }));
        },
      },

      {
        key: "cityId",
        label: t("City"),
        type: "select",
        required: true,
        options: cityOptions,
        disabled: !selectedCountryId || fetching,
      },

      { key: "cost", label: t("Cost"), type: "number", required: true },
    ];
  }, [countryOptions, cityOptions, fetching, selectedCountryId]);

  // 🔹 submit
  const handleSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        ar_name: data.ar_name,
        countryId: data.countryId,
        cityId: data.cityId,
        cost: data.cost,
      };

      await postData(payload);

      toast.success(t("Zone added successfully"));
      navigate("/zone");
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add zone");

      toast.error(msg);
      console.error(err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6">
      <AddPage
        title={t("Add Zone")}
        description={t("Select country then city, and enter zone cost")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/zone")}
        loading={submitting}
        initialData={{
          name: "",
          countryId: "",
          cityId: "",
          cost: 0,
        }}
      />
    </div>
  );
};

export default ZoneAdd;
