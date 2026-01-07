// src/pages/TaxesEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function TaxesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  const { putData, loading: updating } = usePut(`/api/admin/taxes/${id}`);

  const [taxData, setTaxData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: t("Name(English)"),
        type: "text",
        required: true,
    placeholder: t("e.g. Tax (10%)"), // مثال: ضريبة (10%)
      },


      {
        key: "type",
 label: t("Tax Type"),
         type: "select",
        required: true,
        options: [
        
         { value: "percentage", label: t("Percentage (%)") }, // نسبة مئوية (%)
      { value: "fixed", label: t("Fixed Amount") },        // قيمة ثابتة
   
        ],
      },
      {
        key: "amount",
 label: t("Amount"),
         type: "number",
        required: true,
        min: 0,
        step: "any",
       placeholder: t("e.g. 10"), // مثال: 10
    helperText: t("For percentage, enter 10 for 10%"), // بالنسبة للنسبة المئوية، أدخل 10 لـ 10%
       },
      {
        key: "status",
        label:  t("Active Status"),
        type: "switch",
        required: false,
      },
    ],
    []
  );

  /* =======================
     Fetch Tax
  ======================= */
  useEffect(() => {
    const fetchTax = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/taxes/${id}`);
        console.log("🔍 Tax Response:", res.data);

        const tax = res.data?.data?.tax || res.data?.data;

        if (!tax) {
          toast.error(t("Tax not found"));
          navigate("/taxes");
          return;
        }

        setTaxData({
          name: tax.name || "",
          ar_name: tax.ar_name || "",
          type: tax.type || "percentage",
          status: tax.status ?? true,
          amount:
            tax.type === "percentage"
              ? Number(tax.amount) * 100
              : Number(tax.amount),
        });
      } catch (err) {
        console.error("❌ Error fetching tax:", err);
        toast.error(t("Failed to load tax data"));
        navigate("/taxes");
      } finally {
        setFetching(false);
      }
    };

    fetchTax();
  }, [id, navigate]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        type: formData.type,
        status: formData.status ?? true,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
      };

      await putData(payload);

      toast.success(t("Tax updated successfully"));
      navigate("/taxes");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failed to update tax");

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/taxes");

  if (fetching) return <Loader />;

  if (!taxData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">{t("Tax not found")}</p>
        <button
          onClick={() => navigate("/taxes")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          {t("Back to Taxes")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`${t("Edit Tax")}: ${taxData.name}`}
        description={t("Update tax details")}
        fields={fields}
        initialData={taxData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText={t("Update Tax")}
      />
    </div>
  );
}
