// src/pages/warehouses.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import usePut from "@/hooks/usePut"; // استيراد usePut
import api from "@/api/api"; //
import { toast } from "react-toastify"; //
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const WareHouse = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useGet("/api/admin/warehouse");
  const { deleteData, loading: deleting } = useDelete("/api/admin/warehouse/delete");

  // 1. إضافة هوك usePut وتتبع حالة التحديث
  const [updatingId, setUpdatingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const warehouses = data?.warehouses || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/warehouse/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // 2. دالة التعامل مع تغيير حالة المفتاح (Switch)
  const handleOnlineToggle = async (item) => {
    const newStatus = !item.Is_Online;
    setUpdatingId(item._id);
    try {
      // استخدام API الـ Put لتحديث الحالة
      await api.put(`/api/admin/warehouse/${item._id}`, { Is_Online: newStatus });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch(); // إعادة جلب البيانات لتحديث الجدول
    } catch (err) {
      toast.error(t("FailedToUpdateStatus"));
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: t("Name"),
      filterable: true,
      render: (value, row) => (
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/product-warehouse/${row._id}`)}
        >
          {value}
        </span>
      )
    },
    { key: "address", header: t("Address"), filterable: true },
    { key: "phone", header: t("Phone"), filterable: true },
    { key: "email", header: t("Email"), filterable: true },
    { key: "number_of_products", header: t("Products"), filterable: false },

    // 3. تعديل عمود Is Online ليصبح Switch
    {
      key: "Is_Online",
      header: t("Is Online"),
      filterable: false,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer scale-90">
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleOnlineToggle(item)}
              disabled={updatingId === item._id}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-sm"></div>
          </label>
          {/* إظهار مؤشر تحميل صغير بجانب المفتاح عند التحديث */}
          {updatingId === item._id && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      ),
    },

    { key: "stock_Quantity", header: t("Stock Quantity"), filterable: false },
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
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={warehouses}
        columns={columns}
        title={t("Branch Management")}
        addButtonText={t("Add Branch")}
        onAdd={() => navigate("add")}
        onEdit={(item) => navigate(`edit/${item._id}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.WAREHOUSE}
      />

      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Warehouse")}
          message={`${t("Are you sure you want to delete warehouse")} "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default WareHouse;