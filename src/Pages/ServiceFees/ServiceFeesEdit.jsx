import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";

export default function ServiceFeesEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 1. جلب بيانات الرسوم (للقراءة والتعبئة)
    const { data: feeData, loading: loadingFee, error: feeError } = useGet(`/api/admin/service-fees/${id}`);

    // 2. جلب قائمة المخازن (للسلكت)
    const { data: warehouseData, loading: loadingWarehouses } = useGet("/api/admin/service-fees/select");

    // 3. إعداد دالة التحديث
    const { putData, loading: submitting } = usePut(`/api/admin/service-fees/${id}`);

    // تحويل بيانات المخازن إلى تنسيق Options
    const warehouseOptions = warehouseData?.warehouses?.map(w => ({
        value: w._id,
        label: w.name
    })) || [];

    // إعداد الحقول
    const fields = [
        { key: "title", label: t("ServiceName"), required: true, type: "text" },
        { key: "amount", label: t("Amount"), required: true, type: "number" },
        {
            key: "type",
            label: t("FeeType"),
            required: true,
            type: "select",
            options: [
                { value: "fixed", label: t("Fixed") },
                { value: "percentage", label: t("Percentage") }
            ]
        },
        {
            key: "module",
            label: t("Module"),
            required: true,
            type: "select",
            options: [
                { value: "pos", label: "POS" },
                { value: "online", label: t("Online") }
            ]
        },
        {
            key: "warehouseId",
            label: t("Warehouse"),
            required: true,
            type: "select",
            options: warehouseOptions
        },
        { key: "status", label: t("Status"), type: "checkbox" }
    ];

    // دالة الإرسال
    const handleSubmit = async (formData) => {
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                status: formData.status ?? true
            };

            await putData(payload);

            toast.success(t("ServiceFeeUpdatedSuccessfully"));
            navigate("/service-fees");
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("FailedToUpdateServiceFee");
            toast.error(errorMessage);
        }
    };

    // إذا كان جاري التحميل أو هناك خطأ في جلب البيانات
    if (loadingFee || loadingWarehouses) return <Loader />;
    if (feeError) return <div className="text-red-500 p-4">{t("ErrorloadingData")}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <AddPage
                fields={fields}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/service-fees")}
                loading={submitting || loadingWarehouses}
                // البيانات الأولية تأتي من الـ API
                initialData={feeData?.fee || {}}
            />
        </div>
    );
}