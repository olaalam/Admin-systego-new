import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import api from "@/api/api";
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";

export default function PopupAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
const { t ,i18n } = useTranslation();

  const fields = useMemo(
    () => [
      { key: "title_En", label:  t("TitleEN"), required: true },
      { key: "title_ar", label: t("TitleAR"), required: true },
      {
        key: "description_En",
        label: t("DescriptionEN"),
        type: "textarea",
        required: true,
      },
      {
        key: "description_ar",
        label: t("DescriptionAR"),
        type: "textarea",
        required: true,
      },
      {
        key: "image",
        label: t("Image"),
        type: "image",
        required: false,
      },

      {
        key: "link",
        label: t("RedirectLink"),
        placeholder: "https://example.com",
      },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = { ...formData };



      await api.post("/api/admin/popup", payload);

      toast.success(t("PopupAddedSuccessfully"));
      navigate("/popup");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        t("Failedtoaddpopup");

      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={t("AddNewPopup")}
        description={t("CreateaNewPopupWithImagesAndContent")}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/popup")}
        loading={loading}
      />
    </div>
  );
}
