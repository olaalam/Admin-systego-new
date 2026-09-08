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
  const {
    data: countriesData,
    loading: countriesLoading,
    error: countriesError,
  } = useGet("/api/admin/customer/countries");

  const { data: groupsData } = useGet("/api/admin/customer/groups");

  const [customerData, setCustomerData] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetchingCustomer, setFetchingCustomer] = useState(true);

  // تنظيم مجموعات العملاء
  const allGroups = useMemo(() => {
    return (
      groupsData?.groups ||
      groupsData?.data?.groups ||
      groupsData?.data?.customerGroups ||
      groupsData?.customerGroups ||
      []
    );
  }, [groupsData]);

  // تنظيم الدول والمدن
  const allCountries = countriesData?.countries || countriesData?.data?.countries || [];
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
        const customer = res.data?.data?.customer || res.data?.customer;

        if (!customer) {
          toast.error(t("Customernotfound"));
          navigate("/customer");
          return;
        }

        const countryVal = customer.country?._id || customer.country || "";
        const cityVal = customer.city?._id || customer.city || "";
        const groupVal =
          customer.customer_group_id?._id || customer.customer_group_id || "";

        setCustomerData({
          name: customer.name || "",
          email: customer.email || "",
          phone_number: customer.phone_number || "",
          address: customer.address || "",
          customer_group_id: groupVal,
          country: countryVal,
          city: cityVal,
          is_Due: Boolean(customer.is_Due),
          amount_Due: customer.amount_Due || 0,
        });

        setSelectedCountryId(countryVal);
      } catch (err) {
        toast.error(t("Failedtofetchcustomerdata"));
        console.error("❌ Error:", err);
      } finally {
        setFetchingCustomer(false);
      }
    };

    fetchCustomer();
  }, [id, navigate, t]);

  // إعداد الحقول
  const fields = useMemo(
    () => [
      { key: "name", label: t("CustomerName"), required: true },
      { key: "email", label: t("Email"), type: "email", required: false },
      { key: "phone_number", label: t("PhoneNumber"), required: true },
      { key: "address", label: t("Address"), required: false },
      {
        key: "customer_group_id",
        label: isRTL ? "مجموعة العملاء" : "Customer Group",
        type: "select",
        required: false,
        options: [
          {
            label: isRTL ? "-- بدون مجموعة (اختياري) --" : "-- None (Optional) --",
            value: "",
          },
          ...allGroups.map((g) => ({
            value: g._id,
            label: g.name,
          })),
        ],
      },
      {
        key: "country",
        label: t("Country"),
        type: "select",
        required: false,
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
        required: false,
        options: availableCities.map((c) => ({ value: c._id, label: c.name })),
        disabled: !selectedCountryId || availableCities.length === 0,
      },
      { key: "is_Due", label: t("HasDue"), type: "switch", required: false },
      {
        key: "amount_Due",
        label: t("AmountDue"),
        type: "number",
        required: false,
      },
    ],
    [allCountries, availableCities, allGroups, selectedCountryId, isRTL, t]
  );

  // إرسال البيانات بعد التعديل
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        customer_group_id: formData.customer_group_id ? formData.customer_group_id : null,
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
