import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";

const FawryEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    // جلب البيانات الأساسية (الـ Config المراد تعديله)
    const { data, loading: dataLoading } = useGet(`/api/admin/fawry/${id}`);

    // جلب خيارات طرق الدفع للـ Select
    const { data: methodsData, loading: methodsLoading } = useGet("/api/admin/payment_method");

    const [initialData, setInitialData] = useState(null);

    const paymentOptions = methodsData?.paymentMethods?.map(method => ({
        label: method.name,
        value: method._id
    })) || [];

    useEffect(() => {
        const configData = data?.fawry || data?.config;
        if (configData) {
            const fetchedData = Array.isArray(configData) ? configData[0] : configData;
            setInitialData({
                ...fetchedData,
                // نتأكد أن القيمة المختارة في الـ select هي الـ ID فقط
                payment_method_id: fetchedData.payment_method_id?._id || fetchedData.payment_method_id || ""
            });
        }
    }, [data]);

    const fields = [
        {
            key: "payment_method_id",
            label: t("Payment Method"),
            type: "select",
            options: paymentOptions,
            required: true
        },
        { key: "merchantCode", label: t("Merchant Code"), type: "text", required: true },
        { key: "secureKey", label: t("Secure Key"), type: "text", required: true },
        { key: "sandboxMode", label: t("Sandbox Mode"), type: "checkbox" },
        { key: "isActive", label: t("Active Status"), type: "checkbox" },
    ];

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await api.put(`/api/admin/fawry/${id}`, formData);
            toast.success(t("Updated successfully"));
            navigate("/fawry");
        } catch (error) {
            const serverMessage = error?.response?.data?.error?.message;
            toast.error(serverMessage || t("Error processing request"));
            console.error("Full Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading || methodsLoading || !initialData) return <Loader />;

    return (
        <div className="p-6">
            <AddPage
                title={t("Edit Fawry Config")}
                fields={fields}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/fawry")}
                loading={loading}
            />
        </div>
    );
};

export default FawryEdit;