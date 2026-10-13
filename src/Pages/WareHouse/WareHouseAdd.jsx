// src/pages/warehouseAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const WareHouseAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { postData, loading } = usePost("/api/admin/warehouse/");

  const fields = [
    {
      key: "ar_name",
      label: isRTL ? "الاسم (بالعربية)" : "Name (Arabic)",
      required: true,
    },
    {
      key: "name",
      label: isRTL ? "الاسم (بالإنجليزية)" : "Name (English)",
      required: true,
    },
    // ⭐️ العنوان بالإنجليزي
    {
      key: "address",
      label: isRTL ? "العنوان (بالإنجليزية)" : "Address (English)",
      required: true,
    },
    // ⭐️ العنوان بالعربي
    {
      key: "ar_address",
      label: isRTL ? "العنوان (بالعربية)" : "Address (Arabic)",
      required: true,
    },
    { key: "phone", label: t("Phone"), required: true },
    { key: "email", label: t("Email"), type: "email", required: true },
    {
      key: "Is_Online",
      label: t("Is Online"),
      type: "checkbox",
      required: false,
    },
  ];

  const handleSubmit = async (data) => {
    try {
      const payload = {
        ar_name: data.ar_name,
        name: data.name,
        address: data.address,
        ar_address: data.ar_address,
        phone: data.phone,
        email: data.email,
        Is_Online: data.Is_Online ?? false,
      };

      await postData(payload);
      toast.success(t("Warehouse added successfully"));
      navigate("/warehouse");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add warehouse");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("Add Branch")}
        description={t("Fill in the Branch details")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/warehouse")}
        loading={loading}
        initialData={{
          ar_name: "",
          name: "",
          address: "",
          ar_address: "",
          phone: "",
          email: "",
          Is_Online: false,
        }}
      />
    </div>
  );
};

export default WareHouseAdd;
