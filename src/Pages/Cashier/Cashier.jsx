import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import api from "@/api/api";
import { Switch } from "@/components/ui/switch"; // تأكد من مسار الـ Switch الصحيح في مشروعك
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Cashier = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/cashier");
  const { deleteData, loading: deleting } = useDelete("/api/admin/cashier/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBankAccountsModal, setShowBankAccountsModal] = useState(false);
  const [selectedBankAccounts, setSelectedBankAccounts] = useState([]);

  const cashiers = data?.cashiers || [];
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // --- Functions ---

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/cashier/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderStatus = (status) => (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
    >
      {status ? t("Active") : t("Inactive")}
    </span>
  );

  // مكون فرعي للـ Switch لضمان استقلالية الـ State لكل صف
  const RenderStatusSwitch = ({ initialStatus, row }) => {
    const [checked, setChecked] = useState(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleStatus = async () => {
      if (isUpdating) return;
      setIsUpdating(true);
      const previousStatus = checked;
      const newStatus = !checked;

      try {
        setChecked(newStatus);
        await api.put(`/api/admin/cashier/${row._id}`, {
          status: newStatus,
        });
        toast.success(
          t("status_updated_for", { name: row.name || t("unknown") })
        );
        refetch(); // لتحديث البيانات في الجدول بالكامل إذا لزم الأمر
      } catch (err) {
        setChecked(previousStatus);
        toast.error(t("failed_to_update_status"), err);
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div className="flex items-center justify-center">
        <Switch
          dir={isRTL ? "rtl" : "ltr"}
          checked={checked}
          onCheckedChange={toggleStatus}
          disabled={isUpdating}
        />
      </div>
    );
  };

  const renderBankAccounts = (accounts) => {
    if (!accounts || accounts.length === 0) {
      return <span className="text-gray-400">{t("NoAccounts")}</span>;
    }
    return (
      <div className="flex flex-col gap-1">
        {accounts.slice(0, 2).map((account, idx) => (
          <span key={idx} className="text-sm font-medium text-gray-700">
            • {account.name}
          </span>
        ))}
        {accounts.length > 2 && (
          <button
            onClick={() => {
              setSelectedBankAccounts(accounts);
              setShowBankAccountsModal(true);
            }}
            className="text-xs text-teal-600 font-bold hover:underline text-left mt-1"
          >
            +{accounts.length - 2} {t("moreaccounts")}
          </button>
        )}
      </div>
    );
  };

  // --- Table Columns Configuration ---

  const columns = [
    { key: "name", header: t("Name"), filterable: true },
    { key: "ar_name", header: t("ArabicName"), filterable: true },
    {
      key: "warehouse_id",
      header: t("Warehouse"),
      filterable: true,
      render: (_, row) => row.warehouse_id?.name || <span className="text-gray-400">No Warehouse</span>,
    },
    {
      key: "status",
      header: t("Status"),
      render: (status, row) => <RenderStatusSwitch initialStatus={status} row={row} />,
    },
    {
      key: "cashier_active",
      header: t("CashierActive"),
      render: renderStatus,
    },
    {
      key: "bankAccounts",
      header: t("BankAccounts"),
      render: renderBankAccounts,
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cashiers}
        columns={columns}
        title={t("CashierManagement")}
        addButtonText="Add Cashier"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        onAdd={() => alert("Add new brand clicked!")}
        onDelete={(item) => setDeleteTarget(item)}
        searchable={true}
        filterable={true}
        moduleName={AppModules.CASHIER}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteCashier")}
          message={t("confirm_delete_message", {
            name: deleteTarget.name || deleteTarget.ar_name
          })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bank Accounts Modal */}
      {showBankAccountsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{t("BankAccounts")}</h3>
                <p className="text-teal-100 text-xs">
                  {t("total_linked_accounts", {
                    count: selectedBankAccounts.length
                  })}
                </p>
              </div>
              <button onClick={() => setShowBankAccountsModal(false)} className="text-white hover:rotate-90 transition-transform">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-3">
              {selectedBankAccounts.map((account, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{account.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${account.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {account.status ? "Active" : "Inactive"}
                      </span>
                      {account.in_POS && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">POS</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-teal-600 font-bold text-lg">${account.balance?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowBankAccountsModal(false)}
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-colors"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;