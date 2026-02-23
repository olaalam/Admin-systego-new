// src/pages/ProductWarehouse.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const ProductWarehouse = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  useEffect(() => {
    if (id) {
      localStorage.setItem("currentWarehouseId", id);
    }
  }, [id]);

  const { data, loading, error } = useGet(`/api/admin/product_warehouse/${id}`);

  const warehouse = data?.warehouse || {};
  const products = data?.products || [];

  const columns = [
    {
      key: "name",
      header: t("ProductName"),
      filterable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {/* إضافة الصورة إذا كانت متوفرة تعطي شكلاً أفضل للجدول */}
          {row.image && (
            <img
              src={row.image}
              className="w-8 h-8 rounded object-cover border"
              alt=""
            />
          )}
          <span className="text-gray-700 font-medium">
            {value}
          </span>
        </div>
      ),
    },
    {
      // استخدام الكود بدلاً من SKU
      key: "code",
      header: t("ProductCode"),
      filterable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-800 bg-blue-50 px-2 py-1 rounded">
          {value || "N/A"}
        </span>
      )
    },
    {
      key: "price",
      header: t("Price"),
      filterable: false,
      render: (price) => (
        <span className="text-primary font-bold">
          {price ? `${price} EGP` : "N/A"}
        </span>
      )
    },
    {
      key: "quantity",
      header: t("InStock"),
      filterable: false,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${value > 5 ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-600'}`}>
          {value} {t("Units")}
        </span>
      )
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* قسم تفاصيل المخزن بشكل أكثر احترافية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-8 bg-primary rounded-full"></div>
          {warehouse.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-400 mb-1">{t("Address")}</span>
            <span className="font-semibold text-gray-700">{warehouse.address || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 mb-1">{t("Phone Number")}</span>
            <span className="font-semibold text-gray-700">{warehouse.phone || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 mb-1">{t("Contact Email")}</span>
            <span className="font-semibold text-gray-700">{warehouse.email || "N/A"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 mb-1">{t("Capacity")}</span>
            <span className="font-bold text-primary">{warehouse.stock_Quantity || 0}{t("Total Items")}</span>
          </div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-2xl shadow-sm border p-3 border-gray-100">
        <DataTable
          onAdd={() => alert("Add new category clicked!")}

          data={products}
          columns={columns}
          title={t("InventoryManagement")}
          addButtonText={t("AddNewProduct")}
          addPath={`/product-warehouse/add`}
          itemsPerPage={10}
          searchable={true}
          filterable={true}
          moduleName={AppModules.PRODUCT_WAREHOUSE}
        />
      </div>
    </div>
  );
};

export default ProductWarehouse;