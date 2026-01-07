import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Popup = () => {
  const navigate = useNavigate();

  // ✅ endpoint الصح
  const { data, loading, error, refetch } = useGet("/api/admin/popup");
  const { deleteData, loading: deleting } = useDelete("/api/admin/popup");
const { t ,i18n } = useTranslation();

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ البيانات جاية في popup array
  const popups = data?.popup || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/popup/${item._id}`);
      toast.success(t("Popupdeletedsuccessfully"));
      refetch();
    } catch (err) {
      toast.error(t("Failed to delete popup"),err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderImage = (url) => {
    if (!url) return <span className="text-gray-400">{t("NoImage")}</span>;
    return (
      <img
        src={url}
        alt="Popup"
        className="h-12 w-20 object-cover rounded border"
      />
    );
  };

  const renderLink = (url) => {
    if (!url) return "-";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm"
      >
        {t("OpenLink")}
      </a>
    );
  };

  const columns = [
    {
    key: "title_En",
    header: t("TitleEN"),
    filterable: true,
  },
  {
    key: "title_ar",
    header: t("TitleAR"),
    filterable: true,
  },
  {
    key: "description_En",
    header: t("DescriptionEN"),
    filterable: true,
  },
  {
    key: "description_ar",
    header: t("DescriptionAR"),
    filterable: true,
  },
    {
      key: "image",
      header: t("Image"),
      filterable: false,
      render: renderImage,
    },
    {
      key: "link",
      header: t("Link"),
      filterable: false,
      render: renderLink,
    },
  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingpopups")}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={popups}
        columns={columns}
        title={t("PopupManagement")}
        addButtonText={t("AddPopup")}
        onAdd={() => navigate("add")}
        onEdit={() => {}}
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
            title={t("DeletePopup")}
  message={t("DeletePopupMessage", { title: deleteTarget.title_En })}
  onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Popup;
