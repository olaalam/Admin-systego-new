// src/pages/revenues.jsx
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Revenues = () => {
  const { data, loading, error } = useGet("/api/admin/revenue");
  const { data: accountData } = useGet("/api/admin/bank_account");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  // ✅ البيانات جاية داخل revenues
  const revenues = data?.revenues || [];

  const financialAccountOptions = (accountData?.bankAccounts || []).map((a) => ({
    label: a.name,
    value: a._id,
  }));



  const columns = [
    {
      key: "name",
      header: t("RevenueName"),
      filterable: false,
    },
    {
      key: "amount",
      header: t("Amount"),
      filterable: false,
      render: (value) => `${value} ${t("EGP")}`,
    },
    {
      key: "Category_id.name",
      header: t("Category"),
      filterable: false,
      render: (_, item) => item?.Category_id?.name || "-",
    },
    {
      key: "Category_id.ar_name",
      header: t("ArabicCategory"),
      filterable: false,
      render: (_, item) => item?.Category_id?.ar_name || "-",
    },
    {
      key: "financial_accountId.name",
      header: t("FinancialAccount"),
      filterable: false,
      render: (_, item) => item?.financial_accountId?.name || "-",
    },
    {
      key: "admin_id.username",
      header: t("CreatedBy"),
      filterable: false,
      render: (_, item) => item?.admin_id?.username || "-",
    },
    {
      key: "note",
      header: t("Note"),
      filterable: false,
    },

  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingrevenues")}: {error}
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={revenues}
        columns={columns}
        title={t("RevenuesManagement")}
        addButtonText={t("Add Revenue")}
        onAdd={() => navigate("add")}
        onEdit={() => { }}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.REVENUE}
        filters={[
          { key: "financial_accountId._id", label: t("FinancialAccount"), options: financialAccountOptions },
        ]}
      />

    </div>
  );
};

export default Revenues;
