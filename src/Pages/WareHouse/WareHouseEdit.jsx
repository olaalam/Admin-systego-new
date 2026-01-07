// src/pages/WareHouseEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function WareHouseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/warehouse/${id}`);
  const [warehouseData, setWarehouseData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const fields = useMemo(() => [
      { key: "name", label: t("Name"), required: true },
    { key: "address", label: t("Address"), required: true },
    { key: "phone", label: t("Phone"), required: true },
    { key: "email", label: t("Email"), type: "email", required: true },
  ], []);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const res = await api.get(`/api/admin/warehouse/${id}`);
        const warehouse = res.data?.data?.warehouse;

        if (!warehouse) {
          toast.error(t("Warehouse not found"));
          return;
        }

        setWarehouseData({
          name: warehouse.name || "",
          address: warehouse.address || "",
          phone: warehouse.phone || "",
          email: warehouse.email || "",
          stock_Quantity: warehouse.stock_Quantity ?? 0,
        });
      } catch (err) {
        toast.error(t("Failed to fetch warehouse data"));
        console.error("❌ Error fetching warehouse:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchWarehouse();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success(t("Warehouse updated successfully"));
      navigate("/warehouse");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to update warehouse");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/warehouse");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {warehouseData && (
        <AddPage
          title={`${t("Edit Warehouse")}: ${warehouseData.name}`}
          description={t("Update warehouse details")}
          fields={fields}
          initialData={warehouseData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
