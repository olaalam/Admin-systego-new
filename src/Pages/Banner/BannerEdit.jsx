import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";

export default function BannerEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { putData, loading: updating } = usePut(`/api/admin/banner/${id}`);
    const { data: modulesData } = useGet("/api/admin/banner/banner-modules");
    const { t } = useTranslation();
    const [bannerData, setBannerData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const moduleOptions = useMemo(() => {
        return modulesData?.modules?.map(m => ({
            label: m.name,
            value: m.name,
            disabled: m.isUsed // اختياري: لو الموديول مستخدم ممكن نعطله
        })) || [];
    }, [modulesData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/api/admin/banner/${id}`);
                const banner = res.data?.data?.banner || {};

                setBannerData({
                    name: banner.name || "",
                    images: banner.images || [], // هيفضل روابط URLs لحد ما المستخدم يغيرهم
                    isActive: banner.isActive ?? false,
                });

            } catch (err) {
                toast.error(t("Failed to fetch banner data"));
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, t]);

    // وظيفة لتحويل الملف إلى Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (typeof file === "string") return resolve(file); // لو هي أصلاً رابط أو base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const fields = useMemo(() => [
        {
            key: "name",
            label: t("Name"),
            type: "multiselect",
            options: moduleOptions,
            required: true
        },
        { key: "images", label: t("Images"), type: "file", required: true, multiple: true }, // تأكد من دعم الصور المتعددة
        {
            key: "isActive",
            label: t("IsActive"),
            type: "switch",
            required: true,
        },
    ], [t]);

    const handleSubmit = async (formData) => {
        try {
            // 1. تحويل الصور إلى Base64 Array
            let base64Images = [];
            if (Array.isArray(formData.images)) {
                base64Images = await Promise.all(
                    formData.images.map((img) => fileToBase64(img))
                );
            } else if (formData.images) {
                // لو صورة واحدة فقط
                const singleBase64 = await fileToBase64(formData.images);
                base64Images = [singleBase64];
            }

            // 2. تجهيز الـ Body النهائي كـ JSON
            const finalBody = {
                name: formData.name,
                isActive: formData.isActive, // التأكد أنها Boolean
                images: base64Images
            };

            // 3. إرسال البيانات
            await putData(finalBody);

            toast.success(t("Banner updated successfully!"));
            navigate("/banner");
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Failedtoupdatebanner");
            toast.error(errorMessage);
        }
    };

    const handleCancel = () => navigate("/banner");

    if (fetching) return <Loader />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {bannerData && (
                <AddPage
                    title={t("edit_banner_title", { name: bannerData?.name || "..." })}
                    description={t("edit_banner_description")}
                    fields={fields}
                    initialData={bannerData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={updating}
                />
            )}
        </div>
    );
}