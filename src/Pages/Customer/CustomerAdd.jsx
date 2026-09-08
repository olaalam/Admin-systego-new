// src/pages/CustomerAdd.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const CustomerAdd = () => {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);

  const { postData, loading: submitting } = usePost("/api/admin/customer");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // 🔹 جلب الدول + مجموعات العملاء مرة واحدة
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [countriesRes, groupsRes] = await Promise.all([
          api.get("/api/admin/customer/countries"),
          api.get("/api/admin/customer/groups"),
        ]);

        setCountries(countriesRes.data?.data?.countries || []);

        const rawGroups =
          groupsRes.data?.data?.groups ||
          groupsRes.data?.data?.customerGroups ||
          groupsRes.data?.groups ||
          groupsRes.data?.customerGroups ||
          [];
        setCustomerGroups(rawGroups);
      } catch (err) {
        toast.error(t("Failedtoloadcountriesandcities"));
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 خيارات الدول
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({ label: c.name, value: c._id }));
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

  // 🔹 خيارات مجموعات العملاء (اختياري)
  const customerGroupOptions = useMemo(() => {
    return [
      { label: isRTL ? "-- بدون مجموعة (اختياري) --" : "-- None (Optional) --", value: "" },
      ...customerGroups.map((g) => ({
        label: g.name,
        value: g._id,
      })),
    ];
  }, [customerGroups, isRTL]);

  // ✅ إعداد الحقول
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
        options: customerGroupOptions,
      },
      {
        key: "countryId",
        label: t("Country"),
        type: "select",
        required: false,
        options: countryOptions,
        disabled: fetching,
        onChange: (value, setFormData) => {
          setSelectedCountryId(value);
          setFormData((prev) => ({ ...prev, countryId: value, cityId: "" }));
        },
      },
      {
        key: "cityId",
        label: t("City"),
        type: "select",
        required: false,
        options: cityOptions,
        disabled: !selectedCountryId || fetching,
      },
      { key: "is_Due", label: t("HasDue"), type: "switch", required: false },
      { key: "amount_Due", label: t("AmountDue"), type: "number", required: false },
    ],
    [countryOptions, cityOptions, customerGroupOptions, selectedCountryId, fetching, isRTL, t]
  );

  // ✅ إرسال البيانات
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone_number: formData.phone_number,
        address: formData.address || undefined,
        country: formData.country || formData.countryId || null,
        city: formData.city || formData.cityId || null,
        customer_group_id: formData.customer_group_id ? formData.customer_group_id : null,
        is_Due: Boolean(formData.is_Due),
        amount_Due: Number(formData.amount_Due || 0),
      };

      await postData(payload);
      toast.success(t("Customer added successfully"));
      navigate("/customer");
    } catch (err) {
      const msg = err.response?.data?.message || t("Failedtoaddcustomer");
      toast.error(msg);
      console.error(err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("add_customer_title")}
        description={t("add_customer_description")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customer")}
        loading={submitting}
        initialData={{
          is_Due: false,
          amount_Due: 0,
          countryId: "",
          cityId: "",
          customer_group_id: "",
        }}
      />
    </div>
  );
};

export default CustomerAdd;
