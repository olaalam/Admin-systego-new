import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";

const PaymobEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    // جلب البيانات الأساسية (الـ Config المراد تعديله)
    const { data, loading: dataLoading } = useGet(`/api/admin/paymob/${id}`);

    // جلب خيارات طرق الدفع للـ Select
    const { data: methodsData, loading: methodsLoading } = useGet("/api/admin/payment_method");

    const [initialData, setInitialData] = useState(null);

    const paymentOptions = methodsData?.paymentMethods?.map(method => ({
        label: method.name,
        value: method._id
    })) || [];

    useEffect(() => {
        if (data?.paymob) {
            const fetchedData = Array.isArray(data.paymob) ? data.paymob[0] : data.paymob;
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
        { key: "api_key", label: t("API Key"), type: "text", required: true },
        { key: "iframe_id", label: t("Iframe ID"), type: "text", required: true },
        { key: "integration_id", label: t("Integration ID"), type: "text", required: true },
        { key: "hmac_key", label: t("HMAC Key"), type: "text", required: true },
        { key: "type", label: t("Type"), type: "text" },
        { key: "callback", label: t("Callback URL"), type: "text" },
        { key: "isActive", label: t("Active Status"), type: "checkbox" },
        { key: "sandboxMode", label: t("Sandbox Mode"), type: "checkbox" }
    ];

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await api.put(`/api/admin/paymob/${id}`, formData);
            toast.success(t("Updated successfully"));
            navigate("/paymob");
        } catch (error) {
            toast.error(error?.data?.message || t("Error updating item"));
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading || methodsLoading || !initialData) return <Loader />;

    return (
        <div className="p-6">
            <AddPage
                title={t("Edit Paymob Config")}
                fields={fields}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/paymob")}
                loading={loading}
            />
        </div>
    );
};

export default PaymobEdit;