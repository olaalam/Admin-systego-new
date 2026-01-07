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
  // ✅ endpoint الإضافة
  const { postData, loading: submitting } = usePost(
    "/api/admin/customer/group"
  );

  // ✅ الحقول الخاصة بالـ customer group
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("GroupName"),
        required: true,
      },
      {
        key: "status",
        label: t("Status"),
        type: "switch",
        required: true,
      },
    ],
    []
  );

  // ✅ إرسال البيانات بنفس الـ body المطلوب
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        status: Boolean(formData.status),
      };

      await postData(payload);

      toast.success(t("customer_group_added_successfully"));
      navigate("/customer-group");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("failed_to_add_customer_group");
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
          status: true, // default active
        }}
      />
    </div>
  );
};

export default CustomerGroupAdd;
