// src/pages/CustomerGroupAdd.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const CustomerGroupAdd = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { postData, loading: submitting } = usePost(
    "/api/admin/customer/groups",
  );

  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("GroupName"),
        required: true,
      },
      // ✅ الاسم بالعربي (جديد)
      {
        key: "ar_name",
        label: t("GroupNameAr"), // هنضيفها في i18n
        required: true,
      },
      {
        key: "status",
        label: t("Status"),
        type: "switch",
        required: true,
      },
    ],
    [t],
  );

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name, // ✅ الجديد
        status: Boolean(formData.status),
      };

      await postData(payload);

      toast.success(t("customer_group_added_successfully"));
      navigate("/customer-group");
    } catch (err) {
      const msg =
        err.response?.data?.message || t("failed_to_add_customer_group");
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("add_customer_group_title")}
        description={t("add_customer_group_description")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customer-group")}
        loading={submitting}
        initialData={{
          status: true,
        }}
      />
    </div>
  );
};

export default CustomerGroupAdd;
