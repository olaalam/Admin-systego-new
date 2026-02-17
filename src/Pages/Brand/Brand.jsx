// src/pages/brands.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Brand = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/brand");
  const { deleteData, loading: deleting } = useDelete("/api/admin/brand/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const brands = data?.brands || [];
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/brand/${item._id}`);
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
      await deleteData("/api/admin/brand", { ids: bulkDeleteIds });

      refetch();
      toast.success(
        t("brand_deleted_successfully", { count: bulkDeleteIds.length })
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

    const worksheetData = dataToExport.map((brand) => ({
      Name: brand.name,
      "Name (Arabic)": brand.ar_name || "",
      "Logo URL": brand.logo || "",
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brands");

    XLSX.writeFile(wb, `brands_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Imported brands data:", jsonData);

      toast.info(
        t("file_rows_read_info", { count: jsonData.length })
      );

      // Here you should make an API call for bulk import
      // await fetch("/api/admin/brand/import", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ brands: jsonData }),
      // });

      refetch();
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(t("FailedtoreadExcelfile"))
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Name: "",
        "Name (Arabic)": "",
        "Logo URL": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "brands_import_template.xlsx");
  };

  // helper function to display logo
  const renderLogo = (url) => {
    if (!url) return <span className="text-gray-400 text-xs">NoLogo</span>;
    return (
      <img
        src={url}
        alt="brand logo"
        className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200"
      />
    );
  };

  // Render brand info with logo
  const renderLogoOnly = (url) => {
    if (!url)
      return <span className="text-gray-400 text-xs">{t("NoImage")}</span>;

    return (
      <img
        src={url}
        alt="brand logo"
        className="h-12 w-12 object-cover rounded-lg border"
      />
    );
  };


  const columns = [
    {
      key: "name",
      header: t("BrandDetails"),
      filterable: true,
    },
    {
      key: "ar_name",
      header: t("BrandArabic"),
      filterable: true,

    },
    {
      key: "logo",
      header: t("Logo"),
      render: (value) => renderLogoOnly(value),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Errorloadingbrands")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={brands}
        columns={columns}
        title={t("BrandManagement")}
        onAdd={() => alert("Add new brand clicked!")}
        onEdit={(item) => { }} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        downloadTemplate={downloadTemplate}
        addButtonText={t("AddBrand")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.BRAND}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteBrand")}
          message={`${"Are you sure you want to delete"} "${deleteTarget.name}"?`}

          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {bulkDeleteIds && (
        <DeleteDialog
          title="Delete Multiple Brands"
          message={`Are you sure you want to delete ${bulkDeleteIds.length} brand${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Brand;