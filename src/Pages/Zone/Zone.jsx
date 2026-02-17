import { useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Zone = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/zone");
  const { deleteData, loading: deleting } = useDelete("/api/admin/zone/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const zones = data?.zones || [];
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/zone/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: t("ZoneName"),
      filterable: true,
      render: (value, row) => row.name || "N/A"
    },
    {
      key: "ar_name",
      header: t("ZoneName(Arabic)"),
      filterable: true,
      render: (value, row) => row.ar_name || "N/A"
    },
    {
      key: "cityId.name",
      header: t("CityName"),
      filterable: true,
      render: (value, row) => row.cityId?.name || "N/A"
    },
    {
      key: "cityId.ar_name",
      header: t("CityName(Arabic)"),
      filterable: true,
      render: (value, row) => row.cityId?.ar_name || "N/A"
    },
    {
      key: "cost",
      header: t("Shipping Cost"),
      filterable: true,
      render: (value, row) => row.cost ?? 0
    },
    {
      key: "countryId.name",
      header: t("CountryName"),
      filterable: true,
      render: (value, row) => row.countryId?.name || "N/A"
    },
  ];


  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={zones}
        columns={columns}
        title={t("Zone Management")}
        addButtonText={t("Add Zone")}
        onAdd={() => alert("Add new zone clicked!")}
        onEdit={(item) => alert(`Edit zone: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.ZONE}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Zone")}
          message={`${t("Are you sure you want to delete zone")} "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Zone;
