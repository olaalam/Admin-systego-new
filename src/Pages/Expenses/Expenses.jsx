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

const Expenses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [apiUrl, setApiUrl] = useState("/api/admin/expenseAdmin");

  const { data, loading, error } = useGet(apiUrl);
  const { data: accountData } = useGet("/api/admin/bank_account");

  const expenseAdmin = data?.expenses || [];

  // --- دالة تصدير Excel (بصيغة أرقام صحيحة) ---
  const handleExportExcel = (filteredData) => {
    const exportData = filteredData.map((item) => ({
      [t("ExpensesName")]: item.name || "-",
      [t("Amount")]: Number(item.amount) || 0, // ✅ تحويل صريح لرقم
      [t("Category")]: item.Category_id?.name || "-",
      [t("FinancialAccount")]: item.financial_accountId?.name || "-",
      [t("CreatedBy")]: item.admin_id?.username || "-",
      [t("Note")]: item.note || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, `Expenses_${new Date().toLocaleDateString()}.xlsx`);
  };

  // --- دالة تصدير PDF ---
  const handleExportPdf = (filteredData) => {
    const doc = new jsPDF();
    const tableColumn = [t("ExpensesName"), t("Amount"), t("Category"), t("FinancialAccount"), t("Note")];
    const tableRows = filteredData.map(item => [
      item.name,
      `${item.amount} EGP`,
      item.Category_id?.name,
      item.financial_accountId?.name,
      item.note
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "courier" }, // للتعامل مع الترميز البسيط
      theme: "grid",
    });
    doc.save(`Expenses_${new Date().toLocaleDateString()}.pdf`);
  };

  // --- دوال البحث ---
  const handleSearch = () => {
    if (startDate && endDate) setApiUrl(`/api/admin/expenseAdmin?startDate=${startDate}&endDate=${endDate}`);
  };

  const handleReset = () => {
    setStartDate(""); setEndDate(""); setApiUrl("/api/admin/expenseAdmin");
  };

  const dateFilterHeader = (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm ml-4">
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-sm border-none outline-none bg-transparent" />
      <span className="text-gray-400">|</span>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-sm border-none outline-none bg-transparent" />
      <button onClick={handleSearch} className="ml-2 p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-all">
        <Search size={16} />
      </button>
      {(startDate || endDate) && (
        <button onClick={handleReset} className="p-1.5 text-gray-400 hover:text-red-600 transition-all">
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );

  const columns = [
    { key: "name", header: t("ExpensesName") },
    { key: "amount", header: t("Amount"), render: (v) => `${v} EGP` },
    { key: "Category_id.name", header: t("Category"), render: (_, i) => i?.Category_id?.name || "-" },
    { key: "financial_accountId.name", header: t("FinancialAccount"), render: (_, i) => i?.financial_accountId?.name || "-" },
    { key: "admin_id.username", header: t("CreatedBy"), render: (_, i) => i?.admin_id?.username || "-" },
    { key: "note", header: t("Note") },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={expenseAdmin}
        columns={columns}
        title={t("ExpenseAdminManagement")}
        headerExtra={dateFilterHeader}
        onExport={handleExportExcel}
        onExportPdf={handleExportPdf}
        onAdd={() => navigate("add")}
        addButtonText={t("AddExpenseAdmin")}
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
        moduleName={AppModules.EXPENSE_ADMIN}
        filters={[{ key: "financial_accountId._id", label: t("FinancialAccount"), options: (accountData?.bankAccounts || []).map(a => ({ label: a.name, value: a._id })) }]}
      />
    </div>
  );
};

export default Expenses;