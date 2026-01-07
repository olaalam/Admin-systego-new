import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";

const Country = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/country");
  const { deleteData, loading: deleting } = useDelete("/api/admin/country/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const cities = data?.countries || [];
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/country/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: t("countryName"), filterable: true },

  ];

  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cities}
        columns={columns}
        title={t("countryManagement")}
        onAdd={() => alert("Add new country clicked!")}
        onEdit={(item) => alert(`Edit country: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText={t("addCountry")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
       title={t("delete_country_title")}
message={t("confirm_delete_country", { name: deleteTarget.name })}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Country;
