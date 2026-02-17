// src/pages/payment_methods.jsx
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

const PaymentMethod = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/payment_method");
  const { deleteData, loading: deleting } = useDelete("/api/admin/payment_method/delete");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { t, i18n } = useTranslation();

  const paymentMethods = data?.paymentMethods || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/payment_method/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.isActive ? "false" : "true";
    setUpdatingId(item._id);

    try {
      await api.put(`/api/admin/payment_method/${item._id}`, { isActive: newStatus });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch();
    } catch (err) {
      toast.error(t("FailedToUpdateStatus"));
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderIcon = (url) => {
    if (!url) return <span className="text-gray-400">{t("NoIcon")}</span>;
    return (
      <img
        src={url}
        alt="Payment Icon"
        className="h-10 w-10 object-contain rounded border"
      />
    );
  };

  const renderStatusSwitch = (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={() => handleStatusToggle(item)}
        disabled={updatingId === item._id}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">{t("Updating")}</span>
      )}
    </label>
  );

  const columns = [
    { key: "name", header: t("Name"), filterable: true },
    { key: "ar_name", header: t("ArabicName"), required: true },
    { key: "discription", header: t("Description"), filterable: true },
    {
      key: "isActive",
      header: t("Status"),
      filterable: true,
      render: (value, item) => renderStatusSwitch(value, item),
    },
    {
      key: "icon",
      header: t("Icon"),
      filterable: false,
      render: renderIcon,
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={paymentMethods}
        columns={columns}
        title={t("PaymentMethodManagement")}
        addButtonText={t("AddPaymentMethod")}
        onAdd={() => alert("Add new payment method clicked!")}
        onEdit={(item) => alert(`Edit payment method: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.PAYMENT_METHOD}
      />
      {deleteTarget && (
        <DeleteDialog
          title={t("DeletePaymentMethod")}
          message={t("DeletePaymentMethodMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default PaymentMethod;