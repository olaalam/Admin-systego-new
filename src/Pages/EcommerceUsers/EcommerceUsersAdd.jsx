import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const EcommerceUsersAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { postData, loading: submitting } = usePost("/api/admin/ecommerce-user");

  const roleOptions = [
    { label: t("Store Manager"), value: "Store Manager" },
    { label: t("Customer Service"), value: "Customer Service" },
    { label: t("Sales Support"), value: "Sales Support" },
  ];

  const fields = useMemo(
    () => [
      {
        key: "image",
        label: t("Image"),
        type: "image",
        required: false,
      },
      {
        key: "name",
        label: t("name"),
        type: "text",
        required: true,
      },
      {
        key: "email",
        label: t("Email"),
        type: "email",
        required: false,
      },
      {
        key: "phone",
        label: t("Phone"),
        type: "text",
        required: false,
      },
      {
        key: "role",
        label: t("Role"),
        type: "select",
        required: true,
        options: roleOptions,
      },
      {
        key: "address",
        label: t("Address"),
        type: "text",
        required: false,
      },
      {
        key: "bio",
        label: t("Bio"),
        type: "textarea",
        required: false,
      },
      {
        key: "facebook",
        label: t("Facebook URL"),
        type: "text",
        required: false,
      },
      {
        key: "instagram",
        label: t("Instagram URL"),
        type: "text",
        required: false,
      },
      {
        key: "whatsapp",
        label: t("WhatsApp Number"),
        type: "text",
        required: false,
      },
      {
        key: "twitter",
        label: t("Twitter URL"),
        type: "text",
        required: false,
      },
      {
        key: "tiktok",
        label: t("TikTok URL"),
        type: "text",
        required: false,
      },
      {
        key: "status",
        label: t("Active"),
        type: "switch",
        required: false,
      },
    ],
    [t]
  );

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        role: formData.role || "Store Manager",
        bio: formData.bio || "",
        address: formData.address || "",
        image: formData.image || undefined,
        social_links: {
          facebook: formData.facebook || "",
          instagram: formData.instagram || "",
          whatsapp: formData.whatsapp || "",
          twitter: formData.twitter || "",
          tiktok: formData.tiktok || "",
        },
        status: formData.status ? "active" : "inactive",
      };

      await postData(payload);

      toast.success(t("Ecommerce User Added Successfully"));
      navigate("/ecommerce-user");
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to add ecommerce user")
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <AddPage
        title={t("Add Ecommerce User")}
        description={t("Fill in the details below to add a new record.")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/ecommerce-user")}
        loading={submitting}
        initialData={{
          role: "Store Manager",
          status: true,
        }}
      />
    </div>
  );
};

export default EcommerceUsersAdd;
