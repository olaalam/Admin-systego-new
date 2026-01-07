// src/pages/PointsEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function PointsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { putData, loading: updating } = usePut(`/api/admin/point/${id}`);

  const [pointData, setPointData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "amount",
      label: t("Amount"),
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 30",
      },
      {
        key: "points",
      label: t("Points"),
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 30",
      },
    ],
    []
  );

  /* =======================
     Fetch Point
  ======================= */
  useEffect(() => {
    const fetchPoint = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/point/${id}`);
        console.log("🔍 Point Response:", res.data);

        const point =
          res.data?.data?.point ||
          res.data?.data ||
          res.data?.point;

        if (!point) {
          toast.error(t("Pointnotfound"));
          navigate("/point");
          return;
        }

        setPointData({
          amount: Number(point.amount) || 0,
          points: Number(point.points) || 0,
        });
      } catch (err) {
        console.error("❌ Error fetching point:", err);
        toast.error(t("Failedtoloadpointdata"));
        navigate("/point");
      } finally {
        setFetching(false);
      }
    };

    fetchPoint();
  }, [id, navigate]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        amount: Number(formData.amount),
        points: Number(formData.points),
      };

      await putData(payload);

      toast.success(t("Pointupdatedsuccessfully"));
      navigate("/point");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failedtoupdatepoint";

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/point");

  if (fetching) return <Loader />;

  if (!pointData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">{t("Pointnotfound")}</p>
        <button
          onClick={() => navigate("/points")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Points
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
       title={t("EditPoint")}
  description={t("EditPointDescription")}
  submitButtonText={t("UpdatePoint")}
        fields={fields}
        initialData={pointData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}
