import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const City = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/city");
  const { data: countryData } = useGet("/api/admin/country");
  const { deleteData, loading: deleting } = useDelete("/api/admin/city/delete");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cities = data?.cities || [];
  const countryOptions = (countryData?.countries || []).map((c) => ({
    label: c.name,
    value: c._id,
  }));

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/city/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: t("CityName"), filterable: false },
    {
      key: "ar_name",
      header: t("CityNameArabic"),
      filterable: false,
    },
    { key: "shipingCost", header: t("ShippingCost"), filterable: false },
    {
      key: "country.name",
      header: t("Country"),
      filterable: false,
      render: (value, row) => row.country?.name || "N/A",
    },
  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingcities")}: {error}
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cities}
        columns={columns}
        title={t("CityManagement")}
        onAdd={() => alert("Add new city clicked!")}
        onEdit={(item) => alert(`Edit city: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText={t("AddCity")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.CITY}
        filters={[
          { key: "country._id", label: t("Country"), options: countryOptions },
        ]}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteCity")}
          message={t("confirm_delete_city", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default City;
