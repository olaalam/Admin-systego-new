// src/pages/VariationEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  const [fetching, setFetching] = useState(true);

  // الاحتفاظ بالمعرفات الأصلية للخيارات المحملة من السيرفر
  const initialOptionIdsRef = useRef(new Set());
  // الاحتفاظ بالمعرفات التي قام المستخدم بمسحها يدوياً
  const deletedOptionIdsRef = useRef(new Set());

  const handleRemoveOption = (option) => {
    const optionId = option?.id || option?._id;
    if (optionId) {
      deletedOptionIdsRef.current.add(String(optionId));
    }
    return true;
  };

  const fields = [
    { key: "ar_name", label: t("NameArabic"), required: true },
    { key: "name", label: t("NameEnglish"), required: false },
    {
      key: "options",
      label: t("Options") || "Options",
      type: "array",
      confirmDelete: false, // مسح فوري وسلس بدون نافذة تأكيد منبثقة
      onRemove: handleRemoveOption,
      subFields: [
        { key: "name", label: t("OptionName"), required: true },
        { key: "status", label: t("Status"), type: "switch", initialValue: true },
      ],
    },
  ];

  useEffect(() => {
    const fetchVariation = async () => {
      try {
        const res = await api.get(`/api/admin/variation/${id}`);
        const variation = res.data?.data?.variation;

        if (!variation) {
          throw new Error("Variation not found");
        }

        const initialIds = new Set();
        const formattedOptions = (variation.options || []).map((opt) => {
          const optId = String(opt._id);
          initialIds.add(optId);
          return {
            id: optId,
            name: opt.name,
            status: opt.status ?? true,
          };
        });

        initialOptionIdsRef.current = initialIds;
        deletedOptionIdsRef.current = new Set();

        setVariationData({
          name: variation.name || "",
          ar_name: variation.ar_name || "",
          options: formattedOptions,
        });
      } catch (err) {
        toast.error(t("Failedtofetchvariationdata"));
        console.error("❌ Error fetching variation:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchVariation();
  }, [id, t]);

  const handleSubmit = async (formData) => {
    try {
      // 1. تحديد المعرفات المتبقية في الفورم
      const currentOptionIds = new Set(
        (formData.options || [])
          .map((o) => (o.id || o._id ? String(o.id || o._id) : null))
          .filter(Boolean)
      );

      // 2. تجميع كل المعرفات المطلوب حذفها (التي كانت في الأصل ومستبعدة الآن + التي تم مسحها يدوياً)
      const allDeletedIds = new Set([
        ...deletedOptionIdsRef.current,
        ...Array.from(initialOptionIdsRef.current).filter((optId) => !currentOptionIds.has(optId)),
      ]);

      // 3. حذف الخيارات المستبعدة من السيرفر
      for (const optId of allDeletedIds) {
        try {
          await api.delete(`/api/admin/variation/option/${optId}`);
        } catch (delErr) {
          console.warn(`Option ${optId} deletion via DELETE endpoint:`, delErr);
        }
      }

      // 4. إعداد الـ payload بالخيارات المتبقية دائماً لحفظ الحالة الجديدة
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        options: (formData.options || []).map((opt) => {
          const optPayload = {
            name: opt.name,
            status: opt.status ?? false,
          };
          const optId = opt.id || opt._id;
          if (optId) {
            optPayload._id = optId;
          }
          return optPayload;
        }),
      };

      console.log("🚀 Saving variation with options:", payload);
      await putData(payload);

      toast.success(t("Variationupdatedsuccessfully") || "Variation updated successfully! 🎉");
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

      console.error("❌ Error updating variation:", err.response?.data || err);
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