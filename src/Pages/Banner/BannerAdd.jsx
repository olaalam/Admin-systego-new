import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";

export default function BannerAdd() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const { postData, loading } = usePost("/api/admin/banner");
  const { data: modulesData } = useGet("/api/admin/banner/banner-modules");

  const [formData, setFormData] = useState({
    section: [],
    title: "",
    ar_title: "",
    description: "",
    link: "",
    images: [],
    isActive: false,
  });

  const moduleOptions = useMemo(() => {
    return (
      modulesData?.modules?.map((m) => ({
        label: m.name,
        value: m.name,
        disabled: m.isUsed,
      })) || []
    );
  }, [modulesData]);

  const fields = useMemo(
    () => [
      {
        key: "section",
        label: t("Section"),
        type: "multiselect",
        options: moduleOptions,
        required: true,
      },
      {
        key: "title",
        label: t("Title (English)"),
        type: "text",
        required: true,
        placeholder: "Enter English title",
      },
      {
        key: "ar_title",
        label: isRTL ? "العنوان (بالعربية)" : "Title (Arabic)",
        type: "text",
        required: true,
        placeholder: isRTL ? "أدخل العنوان بالعربية" : "Enter Arabic title",
      },
      {
        key: "description",
        label: t("Description"),
        type: "text",
        required: false,
      },
      {
        key: "link",
        label: t("Link / Video URL", "رابط البانر (فيديو / رابط)"),
        type: "text",
        required: false,
        placeholder: "https://...",
      },
      {
        key: "images",
        label: t("Images"),
        type: "file",
        required: true,
        multiple: true,
      },
      {
        key: "isActive",
        label: t("IsActive"),
        type: "switch",
        required: true,
      },
    ],
    [t, moduleOptions, isRTL],
  );

  const handleSubmit = async (data) => {
    try {
      // ⭐️ section: array → name (array) + ar_name (string)
      const sectionValue = Array.isArray(data.section)
        ? data.section.join(", ")
        : data.section || "";

      const finalBody = {
        name: data.section,
        ar_name: sectionValue,
        title: data.title || "",
        ar_title: data.ar_title || "",
        description: data.description || "",
        link: data.link || "",
        isActive: data.isActive,
        images: Array.isArray(data.images) ? data.images : [data.images],
      };

      console.log("📤 Banner payload:", finalBody);

      await postData(finalBody);
      toast.success(t("Banner added successfully!"));
      navigate("/banner");
    } catch (err) {
      console.error("Submission Error:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t("Failed to add banner");
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/banner");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddBanner")}
        description={t("AddBannerDescription")}
        fields={fields}
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
