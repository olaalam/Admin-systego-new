import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Couriers = () => {
    // جلب بيانات المناديب فقط
    const { data, loading, error, refetch } = useGet("/api/admin/courier");
    const { deleteData, loading: deleting } = useDelete("/api/admin/courier/delete");

    const [deleteTarget, setDeleteTarget] = useState(null);

    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    // استخراج المصفوفة بناءً على شكل الـ Response الجديد
    // بنستخدم data?.data?.couriers عشان الـ API بيرجع { success, data: { couriers: [...] } }
    const couriers = data?.data?.couriers || data?.couriers || [];

    // --- Functions ---
    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/courier/${item._id}`);
            refetch();
            toast.success(t("DeletedSuccessfully"));
        } catch (err) {
            toast.error(t("DeleteFailed"));
        } finally {
            setDeleteTarget(null);
        }
    };

    // --- Table Columns Configuration ---
    const columns = [
        {
            key: "name",
            header: t("Name"),
            filterable: false
        },
        {
            key: "phone_number",
            header: t("Phone Number") || "رقم الهاتف",
            filterable: false
        },
        {
            key: "address",
            header: t("Address") || "العنوان",
            filterable: false
        },

    ];

    if (loading) return <Loader />;

    {
        error && !error.includes("404") && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {t("Errorloadingbrands")}: {error}
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={couriers}
                columns={columns}
                title={t("CourierManagement")}
                addButtonText={t("Add Courier") || "إضافة مندوب"}
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                onAdd={() => alert("Add new courier clicked!")}
                onDelete={(item) => setDeleteTarget(item)}
                onEdit={(item) => alert(`Edit ${item.name} clicked!`)}
                searchable={true}
                filterable={false} // تم إيقاف الفلاتر لأن البيانات الحالية لا تحتوي على تصنيفات للفلترة
                moduleName={AppModules.COURIER}
                filters={[]} // تم مسح الفلاتر القديمة
            />

            {/* Delete Confirmation Dialog */}
            {deleteTarget && (
                <DeleteDialog
                    title={t("DeleteCourier") || "حذف المندوب"}
                    message={t("confirm_delete_message", {
                        name: deleteTarget.name
                    })}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default Couriers;