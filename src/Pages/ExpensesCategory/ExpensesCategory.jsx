// src/pages/payment_methods.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const ExpensesCategory = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/expenseCategory");
  const { deleteData, loading: deleting } = useDelete("/api/admin/expenseCategory");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const expenseCategories = data?.expenseCategories || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/expenseCategory/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/expenseCategory/${item._id}`, { status: !item.status });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch();
    } catch (err) {
      toast.error(t("Failedtoupdatestatus"), err);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusSwitch = (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
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
    {
      key: "name",
      header: t("CategoryDetails"),
      filterable: false,

    },
    {
      key: "ar_name",
      header: t("ArabicName"),
      filterable: false,

    },

    {
      key: "status",
      header: t("Status"),
      filterable: false,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingexpensecategories")}: {error}
      </div>
    )
  }
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={expenseCategories}
        columns={columns}
        title={t("ExpenseCategoryManagement")}
        addButtonText={t("AddExpenseCategory")}
        onAdd={() => navigate("add")}
        onEdit={(item) => { }} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.EXPENSE_CATEGORY}
        filters={[
          {
            key: "status",
            label: t("Status"),
            options: [
              { label: t("Active"), value: "true" },
              { label: t("Inactive"), value: "false" },
            ],
          },
        ]}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteExpenseCategory")}
          message={t("DeleteExpenseCategoryMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ExpensesCategory;
