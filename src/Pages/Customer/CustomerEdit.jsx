// src/pages/CustomerEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import useGet from "@/hooks/useGet";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { useTranslation } from "react-i18next";

export default function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/customer/${id}`);
  const { data: countriesData, loading: countriesLoading, error: countriesError } = useGet("/api/admin/customer/countries");

  const [customerData, setCustomerData] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetchingCustomer, setFetchingCustomer] = useState(true);

  // تنظيم الدول والمدن
  const allCountries = countriesData?.countries || [];
  const allCitiesByCountry = useMemo(() => {
    const map = {};
    allCountries.forEach((country) => {
      map[country._id] = country.cities || [];
    });
    return map;
  }, [allCountries]);

  const availableCities = useMemo(() => {
    return selectedCountryId ? allCitiesByCountry[selectedCountryId] || [] : [];
  }, [allCitiesByCountry, selectedCountryId]);

  // جلب بيانات العميل
  useEffect(() => {
    const fetchCustomer = async () => {
      setFetchingCustomer(true);
      try {
        const res = await api.get(`/api/admin/customer/${id}`);
        const customer = res.data?.data?.customer;

        if (!customer) {
          toast.error(t("Customernotfound"));
          navigate("/customers");
          return;
        }

        setCustomerData({
          name: customer.name || "",
          email: customer.email || "",
          phone_number: customer.phone_number || "",
          address: customer.address || "",
          country: customer.country || "",
          city: customer.city || "",
          is_Due: Boolean(customer.is_Due),
          amount_Due: customer.amount_Due || 0,
        });

        setSelectedCountryId(customer.country || "");
      } catch (err) {
        toast.error(t("Failedtofetchcustomerdata"));
        console.error("❌ Error:", err);
      } finally {
        setFetchingCustomer(false);
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  // إعداد الحقول
  const fields = useMemo(() => [
    { key: "name", label: t("CustomerName"), required: true },
    { key: "email", label: t("Email"), type: "email", required: true },
    { key: "phone_number", label: t("PhoneNumber"), required: true },
    { key: "address", label: t("Address"), required: true },
    {
      key: "country",
      label: t("Country"),
      type: "select",
      required: true,
      options: allCountries.map((country) => ({
        value: country._id,
        label: country.name,
      })),
      onChange: (value, setFormData) => {
        setSelectedCountryId(value);
        setFormData((prev) => ({ ...prev, city: "" }));
      },
    },
    {
      key: "city",
      label: t("City"),
      type: "select",
      required: true,
      options: availableCities.map((c) => ({ value: c._id, label: c.name })),
      disabled: !selectedCountryId || availableCities.length === 0,
    },
   { key: "is_Due", label: t("HasDue"), type: "switch", required: true },
    { key: "amount_Due", label: t("AmountDue"), type: "number", required: false },
  ], [allCountries, availableCities, selectedCountryId]);

  // إرسال البيانات بعد التعديل
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        is_Due: Boolean(formData.is_Due),
        amount_Due: Number(formData.amount_Due || 0),
      };

      await putData(payload);

      toast.success(t("Customer updated successfully"));
      navigate("/customer");
    } catch (err) {
      const msg = err.response?.data?.message || t("Failedtoupdatecustomer");
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/customer");

  if (fetchingCustomer || countriesLoading) return <Loader />;

  if (countriesError) {
    toast.error("Failed to load countries");
    return null;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {customerData && (
        <AddPage
         title={t("edit_customer_title", { name: customerData?.name || "..." })}
description={t("edit_customer_description")}
          fields={fields}
          initialData={customerData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
