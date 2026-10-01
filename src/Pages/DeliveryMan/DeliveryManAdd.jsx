import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const DeliveryManAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { postData, loading: submitting } = usePost("/api/admin/delivery-man");

  const fields = useMemo(
    () => [
      { key: "name", label: t("Name"), type: "text", required: true },
      { key: "email", label: t("Email"), type: "email", required: true },
      {
        key: "password",
        label: t("password"),
        type: "password",
        required: true,
      },
      { key: "phone_number", label: t("phone"), type: "text", required: true },
      {
        key: "status",
        label: t("Status"),
        type: "select",
        required: true,
        options: [
          { label: t("Active"), value: "active" },
          { label: t("Inactive"), value: "inactive" },
        ],
      },
      { key: "photo", label: t("Photo"), type: "image" },
    ],
    [t],
  );

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        status: formData.status || "active",
      };
      if (formData.photo) payload.photo = formData.photo;

      await postData(payload);

      toast.success(t("DeliveryManaddedsuccessfully"));
      navigate("/delivery-man");
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t("FailedtoaddDeliveryMan"),
      );
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title={t("AddDeliveryMan")}
        description={t("AddDeliveryManDescription")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/delivery-man")}
        loading={submitting}
      />
    </div>
  );
};

export default DeliveryManAdd;
