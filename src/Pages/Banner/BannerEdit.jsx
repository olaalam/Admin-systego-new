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
                const banner = res.data?.data?.banner || res.data?.banner || res.data?.data || {};

                setBannerData({
                    name: banner.name || [],
                    title: banner.title || "",
                    description: banner.description || "",
                    link: banner.link || "",
                    images: banner.images || [],
                    isActive: banner.isActive ?? true,
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
        {
            key: "title",
            label: t("Title"),
            type: "text",
            required: false,
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
        { key: "images", label: t("Images"), type: "file", required: false, multiple: true },
        {
            key: "isActive",
            label: t("IsActive"),
            type: "switch",
            required: true,
        },
    ], [t, moduleOptions]);

    const handleSubmit = async (formData) => {
        try {
            // 1. تحويل الصور إلى Base64 Array
            let base64Images = [];
            if (Array.isArray(formData.images)) {
                base64Images = await Promise.all(
                    formData.images.map((img) => fileToBase64(img))
                );
            } else if (formData.images) {
                const singleBase64 = await fileToBase64(formData.images);
                base64Images = [singleBase64];
            }

            // 2. تجهيز الـ Body النهائي كـ JSON
            const finalBody = {
                name: formData.name,
                title: formData.title || "",
                description: formData.description || "",
                link: formData.link || "",
                isActive: formData.isActive,
                images: base64Images,
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