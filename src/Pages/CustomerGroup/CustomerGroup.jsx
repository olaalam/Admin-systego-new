import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { Switch } from "@/components/ui/switch"; // لو عندك مكون Switch جاهز
import { useTranslation } from "react-i18next";

const CustomerGroup = () => {
    const navigate = useNavigate();
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
    const { data, loading, error, refetch } = useGet(
        "/api/admin/customer/group"
    );

    const { deleteData, loading: deleting } = useDelete(
        "/api/admin/customer/group/delete"
    );

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const groups = data?.groups || [];

    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/customer/group/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };

    // 🔹 تعديل الحالة
const handleStatusChange = async (group) => {
    if (!group?._id) return; // حماية إضافية
    try {
        setUpdatingStatus(true);
        await api.put(`/api/admin/customer/group/${group._id}`, {
            status: !group.status,
        });
        toast.success(t("Statusupdatedsuccessfully"));
        refetch();
    } catch (err) {
        toast.error(t("Failedtoupdatestatus"));
        console.error(err);
    } finally {
        setUpdatingStatus(false);
    }
};


    const columns = [
        {
            key: "name",
            header: t("GroupName"),
            filterable: true,
        },
{
    key: "status",
    header: t("Status"),
    filterable: true,
    render: (value, group) => (
        <Switch
            checked={group.status}
            onCheckedChange={() => handleStatusChange(group)}
            disabled={updatingStatus}
        />
    ),
}

    ];

    if (loading) return <Loader />;

    if (error)
        return (
            <div className="p-6 text-red-600 text-center">
                {error}
            </div>
        );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={groups}
                columns={columns}
                    title={t("Customer Groups")}
                addButtonText={t("Add Group")}
                onAdd={() => navigate("add")}
                onEdit={(item) => navigate(`edit/${item._id}`)}
                onDelete={(item) => setDeleteTarget(item)}
                itemsPerPage={10}
                searchable
                filterable
            />

            {deleteTarget && (
                <DeleteDialog
title={t("delete_customer_group_title")}
message={t("confirm_delete_customer_group", { name: deleteTarget.name })}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default CustomerGroup;
