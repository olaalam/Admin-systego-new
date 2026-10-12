import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function DeliveryManEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { putData, loading: updating } = usePut(
    `/api/admin/delivery-man/${id}`,
  );

  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await api.get(`/api/admin/delivery-man/${id}`);
        const dm = res.data?.data?.deliveryMan;

        if (!dm) {
          toast.error(t("DeliveryMannotfound"));
          navigate("/delivery-man");
          return;
        }

        setData({
          name: dm.name || "",
          email: dm.email || "",
          phone_number: dm.phone_number || "",
          status: dm.status || "active",
          password: "",
          photo: dm.photo || "",
        });
      } catch (err) {
        toast.error(t("FailedtofetchDeliveryMan"));
        console.error("❌ Error fetching delivery man:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchOne();
  }, [id, navigate]);

  const fields = useMemo(
    () => [
      { key: "name", label: t("Name"), type: "text", required: true },
      { key: "email", label: t("Email"), type: "email", required: true },
      { key: "password", label: t("password"), type: "password" },
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
        phone_number: formData.phone_number,
        status: formData.status,
      };

      // الباسورد بس لو مكتوب
      if (formData.password) payload.password = formData.password;

      // الصورة تتبعت بس لو اتغيرت (base64)، مش لو هي اللينك القديم
      if (formData.photo && formData.photo.startsWith("data:")) {
        payload.photo = formData.photo;
      }

      await putData(payload);

      toast.success(t("DeliveryManupdatedsuccessfully"));
      navigate("/delivery-man");
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t("FailedtoupdateDeliveryMan"),
      );
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {data && (
        <AddPage
          key="edit-delivery-man"
          title={t("EditDeliveryManTitle", { name: data.name })}
          description={t("EditDeliveryManDescription")}
          submitButtonText={t("UpdateDeliveryMan")}
          fields={fields}
          initialData={data}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/delivery-man")}
          loading={updating}
        />
      )}
    </div>
  );
}
