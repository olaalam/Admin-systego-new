import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";

export default function BannerAdd() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { postData, loading } = usePost("/api/admin/banner");
    const { data: modulesData } = useGet("/api/admin/banner/banner-modules");
    const [formData, setFormData] = useState({
        name: [], // تغيير القيمة الابتدائية لمصفوفة لأنها multi-select
        images: [],
        isActive: false,
    });



    // تحويل الملفات إلى Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };
    const moduleOptions = useMemo(() => {
        return modulesData?.modules?.map(m => ({
            label: m.name,
            value: m.name,
            disabled: m.isUsed // اختياري: لو الموديول مستخدم ممكن نعطله
        })) || [];
    }, [modulesData]);
    const fields = useMemo(() => [
        {
            key: "name",
            label: t("Name"),
            type: "multiselect",
            options: moduleOptions,
            required: true
        },
        {
            key: "images",
            label: t("Images"),
            type: "file",
            required: true,
            multiple: true, // مهم جداً للسماح باختيار أكثر من صورة
        },
        {
            key: "title",
            label: t("Title"),
            type: "text",
            required: true,
        },
        {
            key: "description",
            label: t("Description"),
            type: "text",
            required: true,
        },
        {
            key: "isActive",
            label: t("IsActive"),
            type: "switch",
            required: true,
        },
    ], [t, moduleOptions]);

    const handleSubmit = async (data) => {
        try {


            const finalBody = {
                name: data.name,
                isActive: data.isActive,
                images: Array.isArray(data.images) ? data.images : [data.images],
            };

            await postData(finalBody);
            toast.success(t("Banner added successfully!"));
            navigate("/banner");
        } catch (err) {
            console.error("Submission Error:", err); // عشان تشوف الخطأ الحقيقي في الـ console
            const errorMessage = err.response?.data?.message || t("Failed to add banner");
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