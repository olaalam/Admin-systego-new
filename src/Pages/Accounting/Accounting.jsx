import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "react-toastify";

const DefaultSwitch = ({ isDefault, onChange, loading }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) onChange();
  };

  return (
    <button
      type="button"
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${isDefault
        ? "bg-primary text-white hover:bg-red-600"
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
  const { t } = useTranslation();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingDefault, setUpdatingDefault] = useState(false);
  const [updatingPOS, setUpdatingPOS] = useState(false);

  // ✅ حالات (States) نافذة التحويل
  const [transferTarget, setTransferTarget] = useState(null); // الحساب المحول منه
  const [transferData, setTransferData] = useState({ to_account_id: "", amount: "" });
  const [transferring, setTransferring] = useState(false); // حالة التحميل أثناء الإرسال

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
    return <img src={url} alt="Payment Icon" className="h-10 w-10 object-contain rounded border" />;
  };

  const handleToggleStatus = async (account) => {
    setUpdatingDefault(true);
    try {
      await api.put(`/api/admin/bank_account/${account._id}`, { status: !account.status });
      await refetch();
    } catch (err) {
      toast.error(t("error") + " : " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingDefault(false);
    }
  };

  const handleTogglePOS = async (account) => {
    setUpdatingPOS(true);
    try {
      await api.put(`/api/admin/bank_account/${account._id}`, { in_POS: !account.in_POS });
      await refetch();
    } catch (err) {
      toast.error(t("error") + " : " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingPOS(false);
    }
  };

  // ✅ دالة إرسال طلب التحويل للـ API
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferring(true);
    try {
      await api.post("/api/admin/bank_account/transfer", {
        from_account_id: transferTarget._id,
        to_account_id: transferData.to_account_id,
        amount: Number(transferData.amount),
      });

      toast.success(t("TransferSuccessful") || "تم التحويل بنجاح");
      await refetch();

      // تصفير البيانات وإغلاق المودال
      setTransferTarget(null);
      setTransferData({ to_account_id: "", amount: "" });

    } catch (err) {
      console.error("Transfer Error:", err);

      // ✅ استخراج رسالة الخطأ بناءً على الـ Structure الخاص بكِ
      // نتحقق أولاً إذا كان هناك response من السيرفر وبداخله error.message
      const serverMessage = err.response?.data?.error?.message;
      const fallbackMessage = err.message || "Something went wrong";

      // عرض الرسالة القادمة من السيرفر (مثل: Insufficient balance...)
      toast.error(serverMessage || fallbackMessage);

    } finally {
      setTransferring(false);
    }
  };
  const columns = [
    { key: "name", header: t("Name"), filterable: false },
    { key: "image", header: t("Image"), filterable: false, render: (_, item) => renderIcon(item.image) },
    { key: "balance", header: t("InitialBalance"), filterable: false },
    {
      key: "status",
      header: t("Status"),
      render: (status, item) => <DefaultSwitch isDefault={!!status} onChange={() => handleToggleStatus(item)} loading={updatingDefault} />,
    },
    {
      key: "in_POS",
      header: t("ShowinPOS"),
      render: (in_POS, item) => <DefaultSwitch isDefault={!!in_POS} onChange={() => handleTogglePOS(item)} loading={updatingPOS} />,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {error && !error.includes("404") && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {t("Errorloadingbankaccounts")}: {error}
        </div>
      )}

      <DataTable
        data={PaymentMethod}
        columns={columns}
        title={t("FinancialAccountManagement")}
        onAdd={() => alert("Add new bank account clicked!")}
        onEdit={(item) => alert(`Edit bank account: ${item.account_no}`)}
        onDelete={(item) => setDeleteTarget(item)}
        // ✅ تمرير زر التحويل الجديد للـ DataTable
        extraActions={(item) => (
          <button
            onClick={() => setTransferTarget(item)}
            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
            title={t("Transfer")}
          >
            <ArrowRightLeft size={16} />
          </button>
        )}
        addButtonText={t("AddFinancialAccount")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.ACCOUNTING}
        filters={[{ key: "status", label: t("Status"), options: [{ label: t("On"), value: "true" }, { label: t("Off"), value: "false" }] }]}
      />

      {/* مودال الحذف (موجود مسبقاً) */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteBankAccount")}
          message={t("delete_bank_account_confirm", { account: deleteTarget.account_no || deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* ✅ نافذة (Modal) التحويل */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t("TransferFunds") || "Transfer Funds"}</h2>

            <form onSubmit={handleTransferSubmit}>
              {/* الحساب المحول منه (للقراءة فقط) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("FromAccount") || "From Account"}</label>
                <input
                  type="text"
                  value={transferTarget.name}
                  disabled
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
                />
              </div>

              {/* الحساب المحول إليه */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("ToAccount") || "To Account"}</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  value={transferData.to_account_id}
                  onChange={(e) => setTransferData({ ...transferData, to_account_id: e.target.value })}
                >
                  <option value="">{t("SelectAccount") || "Select Account..."}</option>
                  {/* فلترة الحسابات بحيث لا يظهر الحساب المحول منه في القائمة */}
                  {PaymentMethod.filter((acc) => acc._id !== transferTarget._id).map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* المبلغ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Amount")}</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* أزرار الإلغاء والتأكيد */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTransferTarget(null); // إغلاق النافذة
                    setTransferData({ to_account_id: "", amount: "" }); // تصفير البيانات تماماً
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {transferring ? t("Transferring...") : t("Confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;