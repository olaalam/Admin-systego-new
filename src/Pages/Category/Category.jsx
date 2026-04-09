// src/pages/categorys.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import api from "@/api/api";
const Category = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/category");
  const { deleteData, loading: deleting } = useDelete("/api/admin/category/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { postData, loading: importing } = usePost("/api/admin/category/import");
  const [updatingId, setUpdatingId] = useState(null);
  const handleOnlineToggle = async (item) => {
    const newStatus = !item.Is_Online;
    setUpdatingId(item._id);
    try {
      // استخدام API الـ Put لتحديث الحالة
      await api.put(`/api/admin/category/${item._id}`, { Is_Online: newStatus });
      toast.success(t("Statusupdatedsuccessfully"));
      refetch(); // إعادة جلب البيانات لتحديث الجدول
    } catch (err) {
      toast.error(t("FailedToUpdateStatus"));
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };
  const categories = data?.categories || [];
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Build parent category filter options (only categories that appear as parentId of at least one item)
  const parentOptions = [
    ...new Map(
      categories
        .filter((c) => c.parentId)
        .map((c) => [c.parentId._id, { label: c.parentId.name, value: c.parentId._id }])
    ).values(),
  ];
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/category/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // Bulk delete with the required body format
  const handleBulkDelete = async (selectedIds) => {
    if (!selectedIds?.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;

    setBulkDeleting(true);

    try {
      // Pass the body data with ids array to deleteData
      await deleteData("/api/admin/category", { ids: bulkDeleteIds });

      refetch();
      toast.success(
        t("category_deleted_successfully", {
          count: bulkDeleteIds.length
        })
      );
    } catch (err) {
      console.error("Bulk delete error:", err);
      // Error toast is already handled by useDelete hook
    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  const handleExport = (dataToExport) => {
    if (!dataToExport?.length) {
      toast.error(t("Nodatafound"));
      return;
    }

    const worksheetData = dataToExport.map((category) => ({
      Name: category.name,
      "Name (Arabic)": category.ar_name || "",
      "Parent Category": category.parentId?.name || "",
      "Parent Category (Arabic)": category.parentId?.ar_name || "",
      "Product Quantity": category.product_quantity || 0,
      "Image URL": category.image || "",
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    XLSX.writeFile(wb, `categories_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    // 1. إنشاء الـ FormData
    const formData = new FormData();

    // تأكد أن المفتاح "file" يطابق تماماً ما يتوقعه الباك إند (كما رأينا في Postman)
    formData.append("file", file);

    try {
      // 2. إرسال البيانات مع تحديد الـ Headers
      // نمرر الـ formData كأول باراميتر (body)
      // والـ config كالتالث باراميتر لضبط الـ headers
      await postData(formData, null, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 3. تحديث الجدول بعد النجاح
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
        "Name (Arabic)": "",
        "Parent Category": "",
        "Parent Category (Arabic)": "",
        "Product Quantity": "",
        "Image URL": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "categories_import_template.xlsx");
  };

  // helper function to display image
  const renderImage = (url) => {
    if (!url) return <span className="text-gray-400 text-xs">{t("Noimage")}</span>;
    return (
      <img
        src={url}
        alt="category"
        className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200"
      />
    );
  };

  // Render category info with image
  const renderCategoryInfo = (item) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {renderImage(item.image)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {item.name}
          </h3>
          {item.ar_name && (
            <p className="text-xs text-gray-500 truncate">{item.ar_name}</p>
          )}
        </div>
      </div>
    );
  };

  // Render parent category
  const renderParentCategory = (item) => {
    return (
      <div className="text-sm">
        <span className="font-medium text-gray-700">
          {item.parentId?.name || "—"}
        </span>
        {item.parentId?.ar_name && (
          <p className="text-xs text-gray-500 mt-0.5">{item.parentId.ar_name}</p>
        )}
      </div>
    );
  };

  // Render product quantity with badge
  const renderProductQuantity = (item) => {
    const quantity = item.product_quantity || 0;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${quantity === 0
            ? "bg-gray-100 text-gray-600"
            : quantity < 5
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
            }`}
        >
          {quantity}
        </span>
        <span className="text-xs text-gray-500">
          {/* تعديل بسيط للتأكد من استدعاء نص وليس Object */}
          {quantity === 1 ? t("product_singular", "product") : t("products")}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: t("CategoryDetails"),
      filterable: false,

    },
    {
      key: "ar_name",
      header: t("CategoryArabic"),
      filterable: false,

    },
    {
      key: "parentId",
      header: t("ParentCategory"),
      filterable: true,
      render: (_, item) => renderParentCategory(item),
    },
    {
      key: "product_quantity",
      header: t("Products"),
      filterable: false,
      render: (_, item) => renderProductQuantity(item),
    },
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
  ];

  if (loading) return <Loader />;
  {
    error && !error.includes("404") && (
      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        {t("Errorloadingcategories")}: {error}
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={categories}
        columns={columns}
        title={t("CategoryManagement")}
        onAdd={() => alert("Add new category clicked!")}
        onEdit={(item) => { }} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        loading={loading || importing}
        downloadTemplate={downloadTemplate}
        addButtonText={t("AddCategory")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.CATEGORY}

      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={t("delete_category")}
          message={t("confirm_delete_category", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {bulkDeleteIds && (
        <DeleteDialog
          title={t("delete_multiple_categories")}
          message={t("confirm_delete_multiple_categories", { count: bulkDeleteIds.length })}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Category;