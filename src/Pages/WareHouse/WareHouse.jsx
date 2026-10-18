// src/pages/warehouses.jsx
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { toast } from "react-toastify";

const WareHouse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useGet("/api/admin/warehouse");
  const warehouses = data?.warehouses || [];

  const handleEdit = (item) => {
    if (item.enabled === false) {
      toast.error(t("ContactSupport"));
      return;
    }
    navigate(`edit/${item._id}`);
  };

  const columns = [
    {
      key: "name",
      header: t("Name"),
      filterable: true,
      render: (value, row) =>
        row.enabled === false ? (
          <span className="text-gray-400 line-through">{value}</span>
        ) : (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate(`/product-warehouse/${row._id}`)}
          >
            {value}
          </span>
        ),
    },
    {
      key: "ar_name",
      header: t("Arabic Name"),
      filterable: true,
      render: (value) => value || "-",
    },
    { key: "address", header: t("Address (English)"), filterable: true },
    {
      key: "ar_address",
      header: t("Address (Arabic)"),
      filterable: true,
      render: (value) => value || "-",
    },
    { key: "phone", header: t("Phone"), filterable: true },
    { key: "email", header: t("Email"), filterable: true },
    { key: "number_of_products", header: t("Products"), filterable: false },
    {
      key: "Is_Online",
      header: t("Is Online"),
      filterable: false,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.enabled === false ? (
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
              {t("BranchSuspended")}
            </span>
          ) : value ? (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {t("Online")}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
              {t("Offline")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock_Quantity",
      header: t("Stock Quantity"),
      filterable: false,
    },
    {
      key: "transfer",
      header: t("Transfer"),
      render: (_, row) => (
        <span
          className="text-primary font-bold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/warehouse/transfer/${row._id}`);
          }}
        >
          {t("View Transfer")}
        </span>
      ),
    },
    {
      key: "notice",
      header: "",
      filterable: false,
      render: (_, row) =>
        row.enabled === false ? (
          <span className="text-xs text-amber-700 whitespace-nowrap">
            {t("ContactSupport")}
          </span>
        ) : null,
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-4 px-4 py-2 rounded-lg bg-white shadow-sm border border-gray-200 text-sm inline-block">
        <span className="text-gray-500">{t("Branches")}: </span>
        <span className="font-semibold text-gray-800">
          {warehouses.length}
        </span>
      </div>
      <DataTable
        data={warehouses}
        columns={columns}
        title={t("Branch Management")}
        onEdit={handleEdit}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.WAREHOUSE}
      />
    </div>
  );
};

export default WareHouse;
