// src/pages/VariationEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function AttributeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { putData, loading: updating } = usePut(`/api/admin/variation/${id}`);

  const [variationData, setVariationData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const fields = useMemo(
    () => [
    { key: "ar_name", label: t("NameArabic"), required: true },
  { key: "name", label: t("NameEnglish"), required: false },

      {
        key: "options",
        label: "Options",
        type: "array",
        subFields: [
      { key: "name", label: t("OptionName"), required: true },
          { key: "status", label: t("Status"), type: "checkbox" },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const fetchVariation = async () => {
      try {
        const res = await api.get(`/api/admin/variation/${id}`);
        const variation = res.data.data.variation;

        const formatted = {
          name: variation.name || "",
          ar_name:variation.ar_name||"",
          options:
            variation.options?.map((opt) => ({
              id: opt._id,
              name: opt.name,
              status: opt.status ?? false,
            })) || [],
        };

        setVariationData(formatted);
        setOriginalData(formatted);
      } catch (err) {
        toast.error(t("Failedtofetchvariationdata"));
        console.error("❌ Error fetching variation:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchVariation();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const payload = {};

      // ✅ لو الاسم اتغير
      if (formData.name !== originalData.name) {
        payload.name = formData.name;
      }
if (formData.ar_name !== originalData.ar_name) {
  payload.ar_name = formData.ar_name;
}
      // ✅ شيك لو في أي option اتغير (name أو status)
      const hasOptionsChanged = formData.options.some((opt, idx) => {
        const original = originalData.options[idx];
        return (
          !original ||
          opt.name !== original.name ||
          opt.status !== original.status
        );
      });

      // ✅ لو في تغيير في الـ options، ابعت **كل الـ options** مش بس المتغيرة
      if (hasOptionsChanged) {
        payload.options = formData.options.map((opt) => {
          const optionPayload = {
            name: opt.name,
            status: opt.status,
          };

          // 👈 لو في id، ضيفه (عشان الباك يعرف ده update مش insert)
          if (opt.id) {
            optionPayload._id = opt.id;
          }

          return optionPayload;
        });
      }

      // ✅ لو مفيش تغيير خالص
      if (Object.keys(payload).length === 0) {
        toast.info(t("Nochangesdetected"));
        return;
      }

      console.log("🚀 Sending payload:", payload);

      await putData(payload);
      toast.success(t("Variationupdatedsuccessfully"));
      navigate("/attribute");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failedtoupdatevariation");

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/attribute");

  if (fetching) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {variationData && (
        <AddPage
       title={t("EditVariationTitle", { name: variationData?.name || "..." })}
  description={t("EditVariationDescription")}
          fields={fields}
          initialData={variationData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}