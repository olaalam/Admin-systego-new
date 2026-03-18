// src/pages/CouriersAdd.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const CouriersAdd = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // ✅ استخدام hook الـ POST
    const { postData, loading: submitting } = usePost("/api/admin/courier/");

    // ✅ تعريف الحقول بناءً على الـ Keys المطلوبة
    const fields = useMemo(
        () => [
            {
                key: "name",
                label: t("Name") || "الاسم",
                type: "text",
                required: true
            },
            {
                key: "phone_number",
                label: t("Phone Number") || "رقم الهاتف",
                type: "text",
                required: true
            },
            {
                key: "address", // تم التعديل لتطابق الـ JSON (بـ s واحدة)
                label: t("Address") || "العنوان",
                type: "text"
            },
        ],
        [t]
    );

    // ✅ إرسال البيانات
    const handleSubmit = async (formData) => {
        try {
            // بناء الـ payload ليطابق الـ keys المطلوبة بالضبط
            const payload = {
                name: formData.name,
                phone_number: formData.phone_number,
                address: formData.address, // إرسالها كما هي مطلوبة في الـ API
            };

            await postData(payload);

            toast.success(t("Courieraddedsuccessfully") || "تم إضافة المندوب بنجاح");
            navigate("/courier");
        } catch (err) {
            const errorMessage =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                "Failed to add courier";

            toast.error(errorMessage);
            console.error("❌ Error Details:", err.response?.data);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <AddPage
                title={t("AddCourier") || "إضافة مندوب جديد"}
                description={t("Fill in the courier information") || "برجاء ملء بيانات المندوب"}
                fields={fields}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/courier")}
                loading={submitting}
                initialData={{
                    name: "",
                    phone_number: "",
                    addres: "",
                }}
            />
        </div>
    );
};

export default CouriersAdd;