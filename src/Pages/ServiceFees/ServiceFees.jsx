import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const ServiceFees = () => {
    // الرابط والبيانات
    const { data, loading, error, refetch } = useGet("/api/admin/service-fees");
    const { deleteData, loading: deleting } = useDelete("/api/admin/service-fees/delete");

    const [updatingId, setUpdatingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    // استخراج المصفوفة بناءً على JSON المرفق (data.data.fees)
    const serviceFees = data?.fees || [];

    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/service-fees/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleToggleStatus = async (item) => {
        setUpdatingId(item._id);
        try {
            // تحديث الحالة (status) بناءً على الحقل الموجود في الـ JSON
            await api.put(`/api/admin/service-fees/${item._id}`, {
                status: !item.status,
            });

            toast.success(t("status_updated_successfully"));
            refetch();
        } catch (err) {
            toast.error(t("failed_to_update_status"));
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const columns = [
        // استخدام "title" بدلاً من "name" بناءً على الـ API
        {
            key: "title",
            header: t("ServiceName"),
            filterable: true
        },
        {
            key: "amount",
            header: t("Amount"),
        },
        {
            key: "type",
            header: t("FeeType"),
            render: (value) => value === "fixed" ? t("Fixed") : t("Percentage")
        },
        {
            key: "warehouseId.name",
            header: t("Warehouse"),
            render: (_, item) => item.warehouseId?.name || "---"
        },
        {
            key: "status",
            header: t("Status"),
            render: (value, item) => (
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!value}
                        disabled={updatingId === item._id}
                        onChange={() => handleToggleStatus(item)}
                        className="sr-only peer"
                    />
                    <div className={`
                        w-11 h-6 bg-gray-300 rounded-full peer 
                        peer-checked:bg-primary 
                        after:content-[''] after:absolute after:top-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                        ${isRTL ? "peer-checked:after:-translate-x-full" : "peer-checked:after:translate-x-full"}
                        after:start-[2px]
                    `} />
                    {updatingId === item._id && (
                        <span className="ml-2 text-xs text-gray-500">{t("Updating")}</span>
                    )}
                </label>
            ),
        }
    ];

    if (loading) return <Loader />;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {error && !error.includes("404") && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {t("ErrorloadingServiceFees")}: {error}
                </div>
            )}

            <DataTable
                data={serviceFees}
                columns={columns}
                title={t("ServiceFeesManagement")}
                onAdd={() => { }} // اربطيها بفتح المودال أو التنقل لصفحة الإضافة
                onEdit={(item) => { }} // اربطيها بفتح مودال التعديل
                onDelete={(item) => setDeleteTarget(item)}
                addButtonText={t("AddServiceFee")}
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                itemsPerPage={10}
                searchable={true}
                filterable={true}
                moduleName={AppModules.SERVICE_FEES}
            />

            {deleteTarget && (
                <DeleteDialog
                    title={t("delete_service_fee_title")}
                    message={t("confirm_delete_service_fee", { name: deleteTarget.title })}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default ServiceFees;