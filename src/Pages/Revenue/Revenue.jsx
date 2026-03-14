// src/pages/revenues.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { Search, RotateCcw } from "lucide-react";

// مكتبات التصدير
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Revenues = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // 1. حالات التاريخ والـ API URL
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [apiUrl, setApiUrl] = useState("/api/admin/revenue");

  const { data, loading, error } = useGet(apiUrl);
  const { data: accountData } = useGet("/api/admin/bank_account");

  const revenues = data?.revenues || [];
  const financialAccountOptions = (accountData?.bankAccounts || []).map((a) => ({
    label: a.name,
    value: a._id,
  }));

  // 2. دالة تصدير Excel (أرقام بصيغة رقمية للجمع)
  const handleExportExcel = (filteredData) => {
    const exportData = filteredData.map((item) => ({
      [t("RevenueName")]: item.name || "-",
      [t("Amount")]: Number(item.amount) || 0, // ✅ تحويل لرقم ليتمكنوا من الجمع
      [t("Category")]: item.Category_id?.name || "-",
      [t("FinancialAccount")]: item.financial_accountId?.name || "-",
      [t("CreatedBy")]: item.admin_id?.username || "-",
      [t("Note")]: item.note || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenues");
    XLSX.writeFile(workbook, `Revenues_${new Date().toLocaleDateString()}.xlsx`);
  };

  // 3. دالة تصدير PDF
  const handleExportPdf = (filteredData) => {
    const doc = new jsPDF();
    const tableColumn = [t("RevenueName"), t("Amount"), t("Category"), t("FinancialAccount")];
    const tableRows = filteredData.map(item => [
      item.name,
      `${item.amount} EGP`,
      item.Category_id?.name,
      item.financial_accountId?.name,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    });
    doc.save(`Revenues_${new Date().toLocaleDateString()}.pdf`);
  };

  // 4. دوال التحكم في البحث
  const handleSearch = () => {
    if (startDate && endDate) {
      setApiUrl(`/api/admin/revenue?startDate=${startDate}&endDate=${endDate}`);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setApiUrl("/api/admin/revenue");
  };

  // 5. مكون الفلتر بجانب العنوان (حسب الصورة المرفقة)
  const dateFilterHeader = (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm ml-4">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="text-sm border-none focus:ring-0 outline-none p-0 cursor-pointer bg-transparent"
      />
      <span className="text-gray-400">|</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="text-sm border-none focus:ring-0 outline-none p-0 cursor-pointer bg-transparent"
      />
      <button
        onClick={handleSearch}
        className="ml-2 p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all"
        title={t("Search")}
      >
        <Search size={16} />
      </button>
      {(startDate || endDate) && (
        <button
          onClick={handleReset}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-all"
          title={t("Reset")}
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );

  const columns = [
    { key: "name", header: t("RevenueName"), filterable: false },
    { key: "amount", header: t("Amount"), filterable: false, render: (value) => `${value} ${t("EGP")}` },
    { key: "Category_id.name", header: t("Category"), filterable: false, render: (_, item) => item?.Category_id?.name || "-" },
    { key: "financial_accountId.name", header: t("FinancialAccount"), filterable: false, render: (_, item) => item?.financial_accountId?.name || "-" },
    { key: "admin_id.username", header: t("CreatedBy"), filterable: false, render: (_, item) => item?.admin_id?.username || "-" },
    { key: "note", header: t("Note"), filterable: false },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && !error.includes("404") && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {t("Errorloadingrevenues")}: {error}
        </div>
      )}

      <DataTable
        data={revenues}
        columns={columns}
        title={t("RevenuesManagement")}
        headerExtra={dateFilterHeader} // وضع الفلتر بجانب العنوان
        onExport={handleExportExcel}    // زر الإكسل
        onExportPdf={handleExportPdf}  // زر الـ PDF
        addButtonText={t("Add Revenue")}
        onAdd={() => navigate("add")}
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