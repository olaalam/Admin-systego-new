import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Currency = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/currency"); // تأكد من الرابط الصحيح
  const { deleteData, loading: deleting } = useDelete("/api/admin/currency/delete");
const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // تعديل هنا: نستخدم data.currencies بدل countries
  const currencies = data?.currencies || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/currency/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };
  const handleSetDefault = async (item) => {
  if (item.isdefault) return; // already default

  setUpdatingId(item._id);
  try {
    await api.put(`/api/admin/currency/${item._id}`, {
      isdefault: true,
    });

    toast.success(t("default_currency_updated"));
    refetch();
  } catch (err) {
    toast.error(t("failed_to_update_default_currency"));
    console.error(err);
  } finally {
    setUpdatingId(null);
  }
};


const columns = [
  { key: "name", header: t("CurrencyName"), filterable: true },
  { key: "ar_name", header: t("ArabicName"), filterable: true },
{
  key: "isdefault",
  header: t("Default"),
  filterable: false,
  render: (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        disabled={value || updatingId === item._id}
        onChange={() => handleSetDefault(item)}
        className="sr-only peer"
      />
      <div
 className={`
      w-11 h-6 bg-gray-300 rounded-full peer 
      peer-checked:bg-primary 
      after:content-[''] after:absolute after:top-[2px] after:bg-white  after:rounded-full after:h-5 after:w-5 after:transition-all 
      ${isRTL 
        ? "peer-checked:after:-translate-x-full" 
        : "peer-checked:after:translate-x-full"}
      after:start-[2px]
    `} />    {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">{t("Updating")}</span>
      )}
    </label>
  ),
}
,
  { key: "amount", header: t("Amount"), filterable: true },
];


  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={currencies}
        columns={columns}
        title={t("CurrencyManagement")}
        onAdd={() => alert("Add new currency clicked!")}
        onEdit={(item) => alert(`Edit currency: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText={t("AddCurrency")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
       title={t("delete_currency_title")}
message={t("confirm_delete_currency", { name: deleteTarget.name })}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Currency;
