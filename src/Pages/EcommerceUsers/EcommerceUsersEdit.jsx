import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function EcommerceUsersEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { putData, loading: updating } = usePut(`/api/admin/ecommerce-user/${id}`);

  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const roleOptions = [
    { label: t("Store Manager"), value: "Store Manager" },
    { label: t("Customer Service"), value: "Customer Service" },
    { label: t("Sales Support"), value: "Sales Support" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/admin/ecommerce-user/${id}`);
        const user = res.data?.data?.user || res.data?.user;

        if (!user) {
          toast.error(t("User not found"));
          navigate("/ecommerce-user");
          return;
        }

        setUserData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "Store Manager",
          bio: user.bio || "",
          address: user.address || "",
          image: user.image || "",
          facebook: user.social_links?.facebook || "",
          instagram: user.social_links?.instagram || "",
          whatsapp: user.social_links?.whatsapp || "",
          twitter: user.social_links?.twitter || "",
          tiktok: user.social_links?.tiktok || "",
          status: user.status === "active",
        });
      } catch (err) {
        toast.error(t("Failed to fetch ecommerce user"));
        console.error("Error fetching ecommerce user:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id, navigate, t]);

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
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
        address: formData.address,
        image: formData.image,
        social_links: {
          facebook: formData.facebook || "",
          instagram: formData.instagram || "",
          whatsapp: formData.whatsapp || "",
          twitter: formData.twitter || "",
          tiktok: formData.tiktok || "",
        },
        status: formData.status ? "active" : "inactive",
      };

      await putData(payload);

      toast.success(t("Ecommerce User Updated Successfully"));
      navigate("/ecommerce-user");
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("Failed to update ecommerce user")
      );
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {userData && (
        <AddPage
          key="edit-ecommerce-user"
          title={t("Edit Ecommerce User")}
          description={t("Update administrator details")}
          submitButtonText={t("Save")}
          fields={fields}
          initialData={userData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/ecommerce-user")}
          loading={updating}
        />
      )}
    </div>
  );
}
