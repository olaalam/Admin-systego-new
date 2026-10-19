import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import PickupPointForm from "./PickupPointForm";

const num = (v) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

const PickupPointEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, loading: fetching } = useGet(`/api/admin/pickup-point/${id}`);
  const { putData, loading: updating } = usePut(`/api/admin/pickup-point/${id}`);

  const pickupPoint = data?.pickupPoint;

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        branch_id: formData.branch_id || null,
        name: formData.name,
        ar_name: formData.ar_name,
        phone: formData.phone,
        address: formData.address,
        ar_address: formData.ar_address,
        lat: num(formData.lat),
        lng: num(formData.lng),
        is_active: !!formData.is_active,
      };

      await putData(payload);
      toast.success(t("Pickup point updated successfully"));
      navigate("/pickup-point");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to update pickup point");
      toast.error(message);
    }
  };

  if (fetching) return <Loader />;
  if (!pickupPoint) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-xl shadow p-6 text-gray-600">
          {t("Pickup point not found")}
        </div>
      </div>
    );
  }

  const initialData = {
    branch_id: pickupPoint.branch_id?._id || "",
    name: pickupPoint.name || "",
    ar_name: pickupPoint.ar_name || "",
    phone: pickupPoint.phone || "",
    address: pickupPoint.address || "",
    ar_address: pickupPoint.ar_address || "",
    lat: pickupPoint.lat ?? "",
    lng: pickupPoint.lng ?? "",
    is_active: pickupPoint.is_active !== false,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <PickupPointForm
        title={`${t("Edit Pickup Point")}: ${pickupPoint.name}`}
        description={t("Update the pickup point details and location.")}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pickup-point")}
        loading={updating}
        showBranchSelect={true}
      />
    </div>
  );
};

export default PickupPointEdit;
