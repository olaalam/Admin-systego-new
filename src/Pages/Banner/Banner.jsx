import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Banner = () => {
    const { data, loading, error, refetch } = useGet("/api/admin/banner");
    const { deleteData, loading: deleting } = useDelete("/api/admin/banner/delete");
    const { t, i18n } = useTranslation();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const banners = data?.banners || [];


    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/banner/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };

    const columns = [
        { key: "name", header: t("bannerName"), filterable: false },
        {
            key: "images",
            header: t("bannerImage"),
            filterable: false,
            render: (images) => (
                <img
                    src={images[0]}
                    alt="banner"
                    className="w-16 h-10 object-cover rounded"
                />
            )
        },
        {
            key: "isActive",
            header: t("isActive"),
            filterable: false,
            render: (value, row) => row.isActive ? t("true") : t("false"),
        },
    ];

    if (loading) return <Loader />;
    {
        error && !error.includes("404") && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {t("Errorloadingbanners")}: {error}
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={banners}
                columns={columns}
                title={t("bannerManagement")}
                onAdd={() => alert("Add new banner clicked!")}
                onEdit={(item) => alert(`Edit banner: ${item.name}`)}
                onDelete={(item) => setDeleteTarget(item)}
                addButtonText={t("Addbanner")}
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                itemsPerPage={10}
                searchable={true}
                filterable={true}
                moduleName={AppModules.banner}
            />

            {deleteTarget && (
                <DeleteDialog
                    title={t("Deletebanner")}
                    message={t("confirm_delete_banner", { name: deleteTarget.name })}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default Banner;
