import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { toast } from "react-toastify";
import { Package } from "lucide-react";

const formatCurrency = (val) => {
  return (Number(val) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ProductWarehouse = () => {
  const { id: warehouseId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [deleteTarget, setDeleteTarget] = useState(null);

  // تخزين الـ ID في localStorage ليتم استخدامه في صفحة الإضافة والتعديل للعودة
  useEffect(() => {
    if (warehouseId) {
      localStorage.setItem("currentWarehouseId", warehouseId);
    }
  }, [warehouseId]);

  // جلب البيانات
  const { data, loading, error, refetch } = useGet(`/api/admin/product_warehouse/${warehouseId}`);

  // تعريف الـ Hook (المسار الافتراضي للحذف)
  const { deleteData, loading: deleting } = useDelete("/api/admin/product_warehouse");

  const warehouse = data?.data?.warehouse || data?.warehouse || {};
  const products = data?.data?.products || data?.products || [];

  // نضيف اسم الـ variation + سعر الوحدة + الإجمالي لكل صف
  const enrichedProducts = useMemo(() => {
    return products.map((product) => {
      const variationText = (product.variationOptions || [])
        .map((opt) => {
          if (!opt?.name) return null;
          const variationName = isArabic
            ? opt.variationId?.ar_name || opt.variationId?.name
            : opt.variationId?.name;
          return variationName ? `${variationName}: ${opt.name}` : opt.name;
        })
        .filter(Boolean)
        .join(" | ");

      const baseName = isArabic
        ? product.ar_name || product.name
        : product.name;

      const displayName = variationText
        ? `${baseName} - ${variationText}`
        : baseName;

      const unitPrice = Number(
        product.productPriceId?.price ?? product.price ?? 0,
      );
      // ✅ بنجمع كمية المخزن الفعلية لكل صف (stock_quantity)
      // مش product.quantity الإجمالية لأنها مش كمية الفرع
      const quantity = Number(
        product.stock_quantity ?? product.quantity ?? 0,
      );

      return {
        ...product,
        displayName,
        variationText,
        unitPrice,
        totalPrice: unitPrice * quantity,
        quantity,
      };
    });
  }, [products, isArabic]);

  // إجمالي الكمية وإجمالي الفلوس (بنحسبهم في الفرونت لو الـ API مش راجعهم)
  const summary = useMemo(() => {
    return enrichedProducts.reduce(
      (acc, product) => {
        acc.totalQuantity += Number(product.quantity) || 0;
        acc.totalAmount += Number(product.totalPrice) || 0;
        return acc;
      },
      { totalQuantity: 0, totalAmount: 0 },
    );
  }, [enrichedProducts]);

  // دالة الحذف بإرسال الـ Body
  const handleDelete = async (item) => {
    try {
      // الترتيب حسب الـ Hook الخاص بك: (url, body)
      // نمرر null للـ url ليستخدم الـ defaultUrl أو نكتبه صراحة
      const body = {
        productId: item._id, // ID المنتج من الـ JSON
        // ✅ لازم نبعت الـ variation عشان نحذف الصف الصح مش أول variation
        productPriceId: item.productPriceId?._id || item.productPriceId || null,
        warehouseId: warehouseId
      };

      await deleteData(null, body);
      refetch(); // تحديث الجدول
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo(() => [
    {
      key: "displayName",
      header: t("Product"),
      filterable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
            {row.image ? (
              <img src={row.image} alt={row.displayName} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.displayName}</p>
            {row.productPriceId?.code ? (
              <p className="text-xs text-gray-500 font-mono">{row.productPriceId.code}</p>
            ) : row.code ? (
              <p className="text-xs text-gray-500 font-mono">{row.code}</p>
            ) : null}
          </div>
        </div>
      )
    },
    {
      key: "quantity",
      header: t("Quantity"),
      render: (val) => (
        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
          {Number(val) || 0}
        </span>
      )
    },
    {
      key: "low_stock",
      header: t("Low Stock Alert"),
      render: (val) => (
        <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
          {Number(val) || 0}
        </span>
      )
    },
    {
      key: "unitPrice",
      header: t("Unit Price"),
      render: (val) => (
        <span className="font-semibold text-gray-700">
          {formatCurrency(val)}{" "}
          <span className="text-xs font-medium text-gray-400">EGP</span>
        </span>
      )
    },
    {
      key: "totalPrice",
      header: t("Total"),
      render: (val) => (
        <span className="font-black text-emerald-600">
          {formatCurrency(val)}{" "}
          <span className="text-xs font-medium text-gray-400">EGP</span>
        </span>
      )
    }
  ], [t, isArabic]);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {t("Warehouse")}: {warehouse.name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-400">{t("Phone")}</span>
            <span className="font-medium">{warehouse.phone || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">{t("TotalQuantity")}</span>
            <span className="font-black text-gray-900 text-lg">
              {(Number(summary.totalQuantity) || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400">{t("Total Amount")}</span>
            <span className="font-black text-emerald-600 text-lg">
              {formatCurrency(summary.totalAmount)}{" "}
              <span className="text-xs font-medium text-gray-400">EGP</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-3 border-gray-100">
        <DataTable
          data={enrichedProducts}
          columns={columns}
          title={t("InventoryManagement")}
          addButtonText={t("AddNewProduct")}
          addPath={`/product-warehouse/add`}
          // نستخدم stockId للتعديل لأنه المعرف الخاص بعملية الربط بين المنتج والمستودع
          editPath={(item) => `/product-warehouse/edit/${item.stockId}`}
          onEdit={(item) => navigate(`/product-warehouse/edit/${item.stockId}`)}
          // onAdd={() => navigate(`/product-warehouse/add`)}
          onDelete={(item) => setDeleteTarget(item)}
          itemsPerPage={10}
          showActions={true}
          searchable={true}
          filterable={true}
          moduleName={AppModules.PRODUCT_WAREHOUSE}
        />
      </div>

      {deleteTarget && (
        <DeleteDialog
          title={t("Remove Product")}
          message={t("Are you sure you want to remove this product from inventory?")}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ProductWarehouse;