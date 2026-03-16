import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet"; // استيراد useGet لجلب المخازن
import { useTranslation } from "react-i18next";

const ServiceFeesAdd = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 1. جلب قائمة المخازن للـ Select
    const { data: warehouseData, loading: loadingWarehouses } = useGet("/api/admin/service-fees/select");

    // 2. إعداد دالة الإرسال
    const { postData, loading: submitting } = usePost("/api/admin/service-fees");

    // 3. تحويل بيانات المخازن إلى تنسيق Options (label و value)
    // بناءً على الـ JSON: البيانات موجودة داخل data.warehouses
    const warehouseOptions = warehouseData?.warehouses?.map(w => ({
        value: w._id,
        label: w.name
    })) || [];

    const fields = [
        {
            key: "title",
            label: t("ServiceName"),
            required: true,
            type: "text"
        },
        {
            key: "amount",
            label: t("Amount"),
            required: true,
            type: "number"
        },
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
            options: warehouseOptions // تمرير الخيارات الديناميكية هنا
        },
        {
            key: "status",
            label: t("Status"),
            type: "checkbox"
        }
    ];

    const handleSubmit = async (formData) => {
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                status: formData.status ?? true
            };

            await postData(payload);

            toast.success(t("ServiceFeeAddedSuccessfully"));
            navigate("/service-fees");
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("Failedtoaddservicefee");
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-6">
            <AddPage
                title={t("add_service_fee_title")}
                description={t("add_service_fee_description")}
                fields={fields}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/service-fees")}
                loading={submitting || loadingWarehouses} // تفعيل اللودر إذا كان جاري جلب المخازن أو الإرسال
                initialData={{
                    title: "",
                    amount: "",
                    type: "fixed",
                    module: "pos",
                    status: true,
                    warehouseId: ""
                }}
            />
        </div>
    );
};

export default ServiceFeesAdd;