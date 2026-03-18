import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AddPage from "@/components/AddPage";
import Loader from "@/components/Loader";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function CouriersEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { putData, loading: updating } = usePut(`/api/admin/courier/${id}`);

    const [courierData, setCourierData] = useState(null);
    const [fetching, setFetching] = useState(true);

    // ✅ تحديث الحقول لتطابق الـ Keys الجديدة
    const fields = useMemo(
        () => [
            { key: "name", label: t("Name") || "Name", required: true },
            { key: "phone_number", label: t("Phone Number") || "Phone Number", required: true },
            { key: "addres", label: t("Address") || "Address", required: true }, // التعديل لـ addres
        ],
        [t]
    );

    useEffect(() => {
        const fetchCourier = async () => {
            try {
                setFetching(true);
                const res = await api.get(`/api/admin/courier/${id}`);
                // بناءً على الـ Response اللي بعته: data.data.courier
                const courier = res.data?.data?.courier;

                if (!courier) {
                    toast.error("Courier not found.");
                    navigate("/courier");
                    return;
                }

                // تعبئة البيانات في الـ State
                setCourierData({
                    name: courier.name || "",
                    phone_number: courier.phone_number || "",
                    addres: courier.addres || courier.address || "", // يدعم المفتاحين للاحتياط
                });
            } catch (err) {
                toast.error("Failed to fetch courier data");
                console.error("❌ Error:", err);
            } finally {
                setFetching(false);
            }
        };

        fetchCourier();
    }, [id, navigate]);

    const handleSubmit = async (formData) => {
        try {
            // إرسال الـ payload بالـ keys المطلوبة
            const payload = {
                name: formData.name,
                phone_number: formData.phone_number,
                address: formData.addres,
            };

            await putData(payload);
            toast.success(t("Courier updated successfully!"));
            navigate("/courier");
        } catch (err) {
            const errorMessage =
                err.response?.data?.error?.message || err.response?.data?.message || "Failed to update courier";
            toast.error(errorMessage);
            console.error("❌ Error:", err.response?.data);
        }
    };

    // تم تصحيح loadingSelect غير المعرفة بـ fetching فقط
    if (fetching) return <Loader />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {courierData && (
                <AddPage
                    title={`${t("Edit Courier")}: ${courierData.name || "..."}`}
                    description={t("Update courier details")}
                    fields={fields}
                    initialData={courierData}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/courier")}
                    loading={updating}
                />
            )}
        </div>
    );
}