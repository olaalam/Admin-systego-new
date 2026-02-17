// src/pages/revenues.jsx
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Revenues = () => {
  const { data, loading, error } = useGet("/api/admin/revenue");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  // ✅ البيانات جاية داخل revenues
  const revenues = data?.revenues || [];



  const columns = [
    {
      key: "name",
      header: t("RevenueName"),
      filterable: true,
    },
    {
      key: "amount",
      header: t("Amount"),
      filterable: true,
      render: (value) => `${value} ${t("EGP")}`,
    },
    {
      key: "Category_id.name",
      header: t("Category"),
      filterable: true,
      render: (_, item) => item?.Category_id?.name || "-",
    },
    {
      key: "Category_id.ar_name",
      header: t("ArabicCategory"),
      filterable: true,
      render: (_, item) => item?.Category_id?.ar_name || "-",
    },
    {
      key: "financial_accountId.name",
      header: t("FinancialAccount"),
      filterable: true,
      render: (_, item) => item?.financial_accountId?.name || "-",
    },
    {
      key: "admin_id.username",
      header: t("CreatedBy"),
      filterable: true,
      render: (_, item) => item?.admin_id?.username || "-",
    },
    {
      key: "note",
      header: t("Note"),
      filterable: true,
    },

  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingrevenues")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

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
      />

    </div>
  );
};

export default Revenues;
