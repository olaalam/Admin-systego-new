import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function CustomerGroupEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(
    `/api/admin/customer/groups/${id}`
  );

  const [groupData, setGroupData] = useState(null);
  const [fetching, setFetching] = useState(true);

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

  // ✅ جلب بيانات الجروب
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setFetching(true);

        const res = await api.get(
          `/api/admin/customer/groups/${id}`
        );

        const group = res.data?.data?.group;

        if (!group) {
          toast.error(t("customer_group_not_found"));
          navigate("/customer-group");
          return;
        }

        setGroupData({
          name: group.name || "",
          status: Boolean(group.status),
        });
      } catch (err) {
        toast.error(t("failed_to_fetch_customer_group"));
        console.error("❌ Error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

  // ✅ إرسال نفس الـ body اللي طلبتيه
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        status: Boolean(formData.status),
      };

      await putData(payload);

      toast.success(t("customer_group_updated_successfully"));
      navigate("/customer-group");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("Failed to update customer group");
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/customer-group");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {groupData && (
        <AddPage
        title={t("edit_group_title", { name: groupData?.name || "..." })}
description={t("edit_group_description")}
          fields={fields}
          initialData={groupData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
