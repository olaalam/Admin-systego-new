// src/pages/payment_methods.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const Unit = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/units");
  const { deleteData, loading: deleting } = useDelete("/api/admin/units");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();
  const units = data?.units || [];
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/units/${item._id}`);
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
      await deleteData("/api/admin/units", { ids: bulkDeleteIds });

      refetch();
      toast.success(t("UnitsDeletedSuccessfully", { count: bulkDeleteIds.length }));
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
      toast.error(t("No data found"));
      return;
    }

    const worksheetData = dataToExport.map((unit) => ({
      Name: unit.name,
      "Name (Arabic)": unit.ar_name || "",
      Code: unit.code,
      "Base Unit": unit.base_unit?.name || "",
      "Base Unit (Arabic)": unit.base_unit?.ar_name || "",
      "Base Unit Code": unit.base_unit?.code || "",
      Operator: unit.operator || "",
      "Operator Value": unit.operator_value || "",
      "Is Base Unit": unit.is_base_unit ? "Yes" : "No",
      Status: unit.status ? "Active" : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Units");

    XLSX.writeFile(wb, `units_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Imported units data:", jsonData);

      toast.info(`Read ${jsonData.length} row${jsonData.length > 1 ? 's' : ''} from file. (API integration pending)`);

      // Here you should make an API call for bulk import
      // await fetch("/api/admin/units/import", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ units: jsonData }),
      // });

      refetch();
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(t("Failed to read Excel file"));
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Name: "",
        "Name (Arabic)": "",
        Code: "",
        "Base Unit": "",
        "Base Unit (Arabic)": "",
        "Base Unit Code": "",
        Operator: "*,/",
        "Operator Value": "",
        "Is Base Unit": "Yes/No",
        Status: "Active/Inactive",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "units_import_template.xlsx");
  };

  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/units/${item._id}`, { status: !item.status });
      toast.success(t("Status updated successfully"));
      refetch();
    } catch (err) {
      toast.error(t("Failed to update status"), err);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusSwitch = (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={() => handleStatusToggle(item)}
        disabled={updatingId === item._id}
        className="sr-only peer"
      />
      <div

        className={`
      w-11 h-6 bg-gray-300 rounded-full peer 
      peer-checked:bg-primary 
      after:content-[''] after:absolute after:top-[2px] after:bg-white  after:rounded-full after:h-5 after:w-5 after:transition-all 
      ${isRTL
            ? "peer-checked:after:-translate-x-full"
            : "peer-checked:after:translate-x-full"}
      after:start-[2px]
    `}></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">{t("Updating")}</span>
      )}
    </label>
  );

  // Render unit info
  const renderUnitInfo = (item) => {
    return (
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm">
          {item.name}
        </h3>
        {item.ar_name && (
          <p className="text-xs text-gray-600">{item.ar_name}</p>
        )}
        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
          {item.code}
        </span>
      </div>
    );
  };

  // Render base unit info
  const renderBaseUnit = (item) => {
    if (!item.base_unit) {
      return <span className="text-gray-400 italic text-sm">—</span>;
    }

    return (
      <div className="space-y-1">
        <div className="font-medium text-sm text-gray-900">{item.base_unit.name}</div>
        {item.base_unit.ar_name && (
          <div className="text-gray-600 text-xs">{item.base_unit.ar_name}</div>
        )}
        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
          {item.base_unit.code}
        </span>
      </div>
    );
  };

  // Render conversion info
  const renderConversion = (item) => {
    if (!item.operator || !item.operator_value) {
      return <span className="text-gray-400 text-sm">—</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          {item.operator}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {item.operator_value}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: t("Unit Details"),
      filterable: true,
      render: (_, item) => renderUnitInfo(item),
    },
    {
      key: "base_unit",
      header: t("Base Unit"),
      filterable: false,
      render: (_, item) => renderBaseUnit(item),
    },
    {
      key: "operator",
      header: t("Conversion"),
      filterable: false,
      render: (_, item) => renderConversion(item),
    },
    {
      key: "is_base_unit",
      header: t("Is Base Unit"),
      filterable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${value
              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
              : "bg-gray-50 text-gray-600 ring-1 ring-gray-300/50"
            }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${value ? "bg-green-500" : "bg-gray-400"
              }`}
          />
          {value ? t("Yes") : t("No")}
        </span>
      ),
    },
    {
      key: "status",
      header: t("Status"),
      filterable: false,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">{t("Error loading units")}</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={units}
        columns={columns}
        title={t("Unit Management")}
        onAdd={() => navigate("add")}
        onEdit={(item) => { }} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        downloadTemplate={downloadTemplate}
        addButtonText={t("Add Unit")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.UNITS}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={t("DeleteUnit")}
          message={t("ConfirmDeleteUnit", { name: deleteTarget.name })}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {bulkDeleteIds && (
        <DeleteDialog
          title={t("DeleteMultipleUnits")}
          message={t("ConfirmDeleteMultipleUnits", { count: bulkDeleteIds.length })}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Unit;