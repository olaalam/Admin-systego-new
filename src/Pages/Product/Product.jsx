// src/pages/products.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import VariablePricesDialog from "@/components/VariablePricesDialog";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";

const Product = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/product");
  const { deleteData, loading: deleting } = useDelete("/api/admin/product/delete");
  const { t ,i18n } = useTranslation();
 const isRTL = i18n.language === "ar";
  // ✅ FIX: غيّر من [] لـ null
  const [searchedProduct, setSearchedProduct] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [priceDialogProduct, setPriceDialogProduct] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { postData, loading: importing } = usePost("/api/admin/product/import");

  const { postData: searchByCode, loading: searchingByCode } =
    usePost("/api/admin/product/code");

  // Helper function to fix image URLs
  const getImageUrl = (imageStr) => {
    if (!imageStr) return "";
    if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
      return imageStr;
    }
    if (imageStr.startsWith("data:")) {
      return imageStr;
    }
    if (imageStr.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/jpeg;base64,${imageStr}`;
    }
    return imageStr;
  };

  // ✅ FIX: الآن هيشتغل صح
  const products = searchedProduct ?? data?.products ?? [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/product/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // ✅ FIX: عدّل الـ search function
  const handleSearchByCode = async (value) => {
    // ✅ امسح البحث السابق
    if (!value || value.trim() === "") {
      setSearchedProduct(null);
      return;
    }

    try {
      const res = await searchByCode({ code: value });
      const product = res?.data?.product;

      if (product) {
        setSearchedProduct([product]);
        toast.success(t("Productfound"));
      } else {
        setSearchedProduct([]);
        toast.error(t("Product not found"));
      }
    } catch (err) {
      setSearchedProduct([]);
      toast.error(t("Invalidcode"));
      console.error(err);
    }
  };

  // Bulk delete
  const handleBulkDelete = async (selectedIds) => {
    if (!selectedIds?.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;

    setBulkDeleting(true);

    try {
      await deleteData("/api/admin/product", { ids: bulkDeleteIds });
      refetch();
  toast.success(t("ProductsDeleted", { count: bulkDeleteIds.length }));
    } catch (err) {
      console.error("Bulk delete error:", err);
        toast.error(t("FailedToDeleteProducts"));

    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  const handleExport = (dataToExport) => {
    if (!dataToExport?.length) {
      toast.error(t("No data found"));
      return;
    }

    const worksheetData = dataToExport.map((product) => ({
      Name: product.name,
      Category: product.categoryId?.[0]?.name || "",
      Brand: product.brandId?.name || "",
      Price: product.price,
      "Whole Price": product.whole_price || "",
      Stock: product.quantity,
      Unit: product.unit,
      "Min Sale Qty": product.minimum_quantity_sale || 1,
      "Has Expiry": product.exp_ability ? "Yes" : "No",
      "Expiry Date": product.date_of_expiery
        ? new Date(product.date_of_expiery).toLocaleDateString("en-GB")
        : "",
      "Variable Price": product.different_price ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    XLSX.writeFile(wb, `products_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await postData(formData, null, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      refetch();
      console.log("Import successful");
    } catch (err) {
      console.error("Import error:", err);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Name: "",
        Category: "",
        Brand: "",
        Price: "",
        "Whole Price": "",
        Stock: "",
        Unit: "",
        "Min Sale Qty": "",
        "Has Expiry": "Yes/No",
        "Expiry Date": "DD/MM/YYYY",
        "Variable Price": "Yes/No",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "products_import_template.xlsx");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const renderProductInfo = (item) => {
    // ✅ تأكد من وجود البيانات قبل الـ render
    if (!item) return "—";

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={getImageUrl(item.image)}
            alt={item.name || "Product"}
            className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
          />
          {item.quantity < 10 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {t("Low")}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1.5 truncate">
            {item.name || "Unnamed Product"}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">{t("Category")}:</span>
              <span className="font-medium text-gray-700">
                {Array.isArray(item.categoryId) 
                  ? item.categoryId[0]?.name || "—"
                  : item.categoryId?.name || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">{t("Brand")}:</span>
              <span className="font-medium text-gray-700">
                {item.brandId?.name || "—"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-base font-bold text-teal-600">
             {typeof item.price === "object" ? item.price.price : item.price || 0} {t("EGP")}
            </span>
            <span className="text-xs text-gray-500">/ {item.unit || "unit"}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = (item) => {
    // ✅ تأكد من وجود البيانات
    if (!item) return "—";

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">{t("Stock")}:</span>
          <span
            className={`text-sm font-semibold ${
              (item.quantity || 0) < 10
                ? "text-red-600"
                : (item.quantity || 0) < 50
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {item.quantity || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">{t("MinSale")}:</span>
            <span
    className={`text-sm font-medium text-gray-700 ${
      isRTL ? "pr-6" : "pl-3"
    }`}
  >
    {item.minimum_quantity_sale ?? 1}
  </span>
        </div>
        {item.whole_price > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">{t("Wholesale")}:</span>
            <span className="text-sm font-medium text-gray-700">
              {item.whole_price} {t("EGP")}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderBadge = (value) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
        value
          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
          : "bg-gray-50 text-gray-600 ring-1 ring-gray-300/50"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
          value ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {value ? t("Yes") : t("No")}
    </span>
  );

  const renderExpiration = (item) => {
    if (!item.exp_ability) {
      return renderBadge(false);
    }

    return (
      <div className="space-y-1.5">
        {renderBadge(true)}
        {item.date_of_expiery && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">{t("Expires")}:</span>
            <span
              className={`font-medium ${
                isExpiringSoon(item.date_of_expiery) ? "text-red-600" : "text-gray-700"
              }`}
            >
              {formatDate(item.date_of_expiery)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderFeatures = (item) => {
    // ✅ تأكد من وجود البيانات
    if (!item) return "—";

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">{t("IMEI")}:</span>
          {renderBadge(item.product_has_imei)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">{t("VarPrice")}:</span>
          {item.different_price ? (
            <button
              onClick={() => setPriceDialogProduct(item)}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-600/20 hover:bg-green-100 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
              {t("Yes")}
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          ) : (
            renderBadge(false)
          )}
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: t("ProductDetails"),
      filterable: true,
      render: (_, item) => renderProductInfo(item),
    },
    {
      key: "inventory",
      header: t("Inventory"),
      filterable: false,
      render: (_, item) => renderInventory(item),
    },
    {
      key: "features",
      header: t("Features"),
      filterable: false,
      render: (_, item) => renderFeatures(item),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingproducts")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={products}
        columns={columns}
       title={t("ProductManagement")}
  addButtonText={t("AddProduct")}
        onAdd={() => alert("Add new product clicked!")}
        onEdit={(item) => {}}
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        onSearchApi={handleSearchByCode}
        loading={loading || importing}
        downloadTemplate={downloadTemplate}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
       title={t("DeleteProduct")}
  message={t("DeleteProductMessage", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {bulkDeleteIds && (
        <DeleteDialog
           title={t("DeleteMultipleProducts")}
  message={t("DeleteMultipleProducts", { count: bulkDeleteIds.length })}
onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}

      {priceDialogProduct && (
        <VariablePricesDialog
          product={priceDialogProduct}
          onCancel={() => setPriceDialogProduct(null)}
        />
      )}
    </div>
  );
};

export default Product;