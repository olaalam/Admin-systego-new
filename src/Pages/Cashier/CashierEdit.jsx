import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import usePut from "@/hooks/usePut";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";

export default function CashierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/cashier/${id}`);
  const { data: selectData, loading: loadingSelect } = useGet(
    "/api/admin/cashier/select"
  );

  const [cashierData, setCashierData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const warehouses = selectData?.warehouse || [];
  const bankAccounts = selectData?.bankAccounts || [];

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ value: w._id, label: w.name })),
    [warehouses]
  );

  const bankAccountOptions = useMemo(
    () => bankAccounts.map((b) => ({ value: b._id, label: `${b.name} (${b.balance})` })),
    [bankAccounts]
  );

  const fields = useMemo(
    () => [
      { key: "name", label: "Name", required: true },
      { key: "ar_name", label: "Arabic Name", required: true },
      {
        key: "warehouse_id",
        label: "Warehouse",
        type: "select",
        required: true,
        options: warehouseOptions,
        disabled: loadingSelect,
      },
      {
        key: "bankAccounts",
        label: "Bank Accounts",
        type: "multiselect",
        required: false,
        options: bankAccountOptions,
        disabled: loadingSelect,
      },
      {
        key: "status",
        label: "Status",
        type: "switch",
        required: true,
      },
    ],
    [warehouseOptions, bankAccountOptions, loadingSelect]
  );

  useEffect(() => {
    const fetchCashier = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/api/admin/cashier/${id}`);
        const cashier = res.data?.data?.cashier;

        if (!cashier) {
          toast.error("Cashier not found.");
          navigate("/cashier");
          return;
        }

        setCashierData({
          name: cashier.name || "",
          ar_name: cashier.ar_name || "",
          warehouse_id: cashier.warehouse_id?._id || "",
          bankAccounts: cashier.bankAccounts?.map((b) => b._id) || [],
          status: cashier.status ?? true,
        });
      } catch (err) {
        toast.error("Failed to fetch cashier data");
        console.error("❌ Error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchCashier();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        status: formData.status === true || formData.status === "true",
        bankAccounts: Array.isArray(formData.bankAccounts) ? formData.bankAccounts : [],
      };

      await putData(payload);
      toast.success("Cashier updated successfully!");
      navigate("/cashier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message || err.response?.data?.message || "Failed to update cashier";
      const errorDetails = err.response?.data?.error?.details;

      if (Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  if (fetching || loadingSelect) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {cashierData && (
        <AddPage
          title={`Edit Cashier: ${cashierData.name || "..."}`}
          description="Update cashier details"
          fields={fields}
          initialData={cashierData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/cashier")}
          loading={updating}
        />
      )}
    </div>
  );
}
