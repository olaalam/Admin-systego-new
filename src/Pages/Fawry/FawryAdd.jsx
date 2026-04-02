import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet"; // جلب الخطاف الخاص بالبيانات
import api from "@/api/api";
import Loader from "@/components/Loader";

const FawryAdd = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 1. جلب طرق الدفع من الـ API
    const { data: methodsData, loading: methodsLoading } = useGet("/api/admin/payment_method");

    // 2. تحويل البيانات لتناسب حقل الـ Select (label و value)
    const paymentOptions = methodsData?.paymentMethods?.map(method => ({
        label: method.name,
        value: method._id
    })) || [];

    const fields = [
        // أضفنا حقل الـ Select هنا
        {
            key: "payment_method_id",
            label: t("Payment Method"),
            type: "select",
            options: paymentOptions,
            required: true
        },
        { key: "type", label: t("Type"), type: "text", required: true },
        { key: "callbackUrl", label: t("Callback URL"), type: "text", required: true },
        { key: "api_key", label: t("API Key"), type: "text", required: true },
        { key: "iframe_id", label: t("Iframe ID"), type: "text", required: true },
        { key: "integration_id", label: t("Integration ID"), type: "text", required: true },
        { key: "hmac_key", label: t("HMAC Key"), type: "text", required: true },
        { key: "secureKey", label: t("Secure Key"), type: "text", required: true },
        { key: "merchantCode", label: t("Merchant Code"), type: "text", required: true },
        // { key: "isActive", label: t("Active Status"), type: "checkbox" },

    ];

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await api.post("/api/admin/fawry", formData);
            toast.success(t("Added successfully"));
            navigate("/fawry");
        } catch (error) {
            const serverMessage = error?.response?.data?.error?.message;
            toast.error(serverMessage || t("Error processing request"));
            console.error("Full Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (methodsLoading) return <Loader />;

    return (
        <div className="p-6">
            <AddPage
                title={t("Add Fawry Config")}
                description={t("Select a payment method and enter credentials")}
                fields={fields}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/fawry")}
                loading={loading}
            />
        </div>
    );
};

export default FawryAdd;