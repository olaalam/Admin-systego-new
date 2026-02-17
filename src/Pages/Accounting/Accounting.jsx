import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api"; // ✅ استيراد api مباشرة
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

// A placeholder for a simple Switch component
const DefaultSwitch = ({ isDefault, onChange, loading }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🟢 Switch clicked! isDefault:", isDefault, "loading:", loading);
    if (!loading) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${isDefault
        ? "bg-primary text-white hover:bg-teal-600"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "..." : isDefault ? "On" : "Off"}
    </button>
  );
};
const Accounting = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/bank_account");
  const { deleteData, deleting } = useDelete("/api/admin/bank_account/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const { t } = useTranslation();

  // حالات التحديث المنفصلة
  const [updatingDefault, setUpdatingDefault] = useState(false);
  const [updatingPOS, setUpdatingPOS] = useState(false);

  const PaymentMethod = data?.bankAccounts || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/bank_account/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
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


  // ✅ تغيير حالة الحساب (مفعل / غير مفعل) - toggle عادي
  const handleToggleStatus = async (account) => {
    setUpdatingDefault(true); // هنستخدم نفس الـ state عشان الـ loading
    try {
      await api.put(`/api/admin/bank_account/${account._id}`, {
        status: !account.status, // نبدل القيمة: true → false أو false → true
      });
      await refetch();
    } catch (err) {
      console.error(err);
      alert("فشل تحديث حالة الحساب: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingDefault(false);
    }
  };

  // ✅ تغيير ظهور الحساب في POS
  const handleTogglePOS = async (account) => {
    setUpdatingPOS(true);
    try {
      await api.put(`/api/admin/bank_account/${account._id}`, {
        in_POS: !account.in_POS, // نبدل القيمة الحالية
      });
      await refetch();
    } catch (err) {
      alert("فشل تحديث إعدادات POS: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingPOS(false);
    }
  };

  const columns = [
    { key: "name", header: t("Name"), filterable: true },
    {
      key: "image",
      header: t("Image"),
      filterable: false,
      render: (_, item) => renderIcon(item.image),
    }
    ,
    { key: "balance", header: t("InitialBalance"), filterable: false },

    {
      key: "status",
      header: t("Status"), // أو "Active" أو "Enabled" حسب المعنى اللي عايزاه
      render: (status, item) => (
        <DefaultSwitch
          isDefault={!!status}
          onChange={() => handleToggleStatus(item)}
          loading={updatingDefault}
        />
      ),
    },
    {
      key: "in_POS",
      header: t("ShowinPOS"),
      render: (in_POS, item) => (
        <DefaultSwitch
          isDefault={!!in_POS}
          onChange={() => handleTogglePOS(item)}
          loading={updatingPOS}
        />
      ),
    },
    // باقي الأعمدة إذا فيه actions مثلاً
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={PaymentMethod}
        columns={columns}
        title={t("BankAccountManagement")}
        onAdd={() => alert("Add new bank account clicked!")}
        onEdit={(item) => alert(`Edit bank account: ${item.account_no}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText={t("AddBankAccount")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.ACCOUNTING}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteBankAccount")}
          message={t("delete_bank_account_confirm", {
            account: deleteTarget.account_no || deleteTarget.name,
          })}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Accounting;