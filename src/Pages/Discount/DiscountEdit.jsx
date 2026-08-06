// src/pages/DiscountEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import WarehouseMultiSelect from "@/Pages/Pandels/WarehouseMultiSelect";
import { useTranslation } from "react-i18next";

export default function DiscountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const { putData, loading: updating } = usePut(
    `/api/admin/discount/${id}`
  );
  const { data: warehousesData } = useGet("/api/admin/warehouse");
  const warehouses = warehousesData?.warehouses || [];

  const [discountData, setDiscountData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("DiscountName"),
        type: "text",
        required: true,
        placeholder: t("DiscountNamePlaceholder")
      },
      {
        key: "applyIn",
        label: t("ApplyIn"),
        type: "select",
        required: true,
        options: [
          { value: "POS", label: "POS" },
          { value: "E-commerce", label: "E-commerce" },
        ],
        placeholder: t("SelectApplyIn"),
      },
      {
        key: "all_warehouses",
        label: t("AllWarehouses"),
        type: "checkbox",
      },
      {
        key: "warehouse_ids",
        label: t("Warehouses"),
        type: "custom",
        render: (formData, setFormData) =>
          formData.all_warehouses ? (
            <div className="text-sm text-slate-500">
              {t("AppliesToAllWarehouses")}
            </div>
          ) : (
            <WarehouseMultiSelect
              label={t("Warehouses")}
              options={warehouses}
              value={formData.warehouse_ids || []}
              onChange={(val) => setFormData({ ...formData, warehouse_ids: val })}
              t={t}
            />
          ),
      },
      {
        key: "type",
        label: t("DiscountType"),
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: t("Percentage") },
          { value: "fixed", label: t("FixedAmount") },
        ],
      },
      {
        key: "amount",
        label: t("Amount"),
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: "e.g. 15",
        helperText:
          "If percentage, enter 15 for 15%. If fixed, enter amount value.",
      },
    ],
    [t, warehouses]
  );

  /* =======================
     Fetch Discount
  ======================= */
  useEffect(() => {
    const fetchDiscount = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/discount/${id}`);
        const discount = res.data?.data?.discount || res.data?.data;

        if (!discount) {
          toast.error(t("Discountnotfound"));
          navigate("/discount");
          return;
        }

        setDiscountData({
          name: discount.name || "",
          type: discount.type || "percentage",
          amount:
            discount.type === "percentage"
              ? Number(discount.amount) * 100
              : Number(discount.amount),
          applyIn: discount.applyIn || "POS",
          all_warehouses: discount.all_warehouses !== undefined ? discount.all_warehouses : true,
          warehouse_ids: discount.warehouse_ids || [],
        });
      } catch (err) {
        console.error("❌ Error fetching discount:", err);
        toast.error(t("Failedtoloaddiscountdata"));
        navigate("/discount");
      } finally {
        setFetching(false);
      }
    };

    fetchDiscount();
  }, [id, navigate]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      if (!formData.all_warehouses && (!formData.warehouse_ids || formData.warehouse_ids.length === 0)) {
        toast.error(t("PleaseSelectWarehousesOrEnableAllWarehouses"));
        return;
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
        applyIn: formData.applyIn,
        all_warehouses: !!formData.all_warehouses,
        warehouse_ids: formData.all_warehouses ? [] : formData.warehouse_ids || [],
      };

      await putData(payload);

      toast.success(t("Discountupdatedsuccessfully"));
      navigate("/discount");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failedtoupdatediscount");

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/discount");

  if (fetching) return <Loader />;

  if (!discountData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">Discount not found</p>
        <button
          onClick={() => navigate("/discount")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Discounts
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
  title={t("EditDiscountTitle", { name: discountData.name })}
  description={t("EditDiscountDescription")}
  submitButtonText={t("UpdateDiscount")}
        fields={fields}
        initialData={discountData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}
