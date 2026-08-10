import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import Loader from "@/components/Loader";
import DataTable from "@/components/DataTable";
import {
  ArrowLeft,
  User,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Receipt,
  Clock,
  FileText,
  XCircle,
  RotateCcw,
  PackageCheck,
  Tag,
} from "lucide-react";

const CashierShiftDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("sales");

  // طلب البيانات من الـ API
  const { data: responseData, loading, error } = useGet(`/api/admin/admin/shifts/${id}/details`);

  // استخراج الكائنات من داخل data
  const data = responseData?.data || responseData;
  const shift = data?.shift;
  const summary = data?.summary;
  const sales = data?.sales || [];
  const expenses = data?.expenses || [];
  const returns = data?.returns || [];

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(isArabic ? "ar-EG" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // تنسيق مدة الشيفت (من milliseconds إلى ساعات ودقائق)
  const formatDuration = (ms) => {
    if (!ms) return "—";
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // أعمدة جدول المبيعات
  const saleColumns = useMemo(
    () => [
      {
        key: "reference",
        header: t("Reference"),
        render: (val) => (
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            {val || "—"}
          </span>
        ),
      },
      {
        key: "items",
        header: t("Items Count"),
        render: (val) => (
          <span className="font-semibold text-gray-700">
            {val?.length || 0} {t("items")}
          </span>
        ),
      },
      {
        key: "grand_total",
        header: t("Total Amount"),
        render: (val) => (
          <span className="font-black text-gray-900">
            {formatCurrency(val)} <span className="text-[9px] text-gray-400">EGP</span>
          </span>
        ),
      },
      {
        key: "paid_amount",
        header: t("Paid"),
        render: (val) => (
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
            {formatCurrency(val)}
          </span>
        ),
      },
      {
        key: "date",
        header: t("Time"),
        render: (val) => (
          <span className="text-gray-500 font-medium text-xs">
            {formatDate(val)}
          </span>
        ),
      },
    ],
    [t, isArabic]
  );

  // أعمدة جدول المصروفات
  const expenseColumns = useMemo(
    () => [
      {
        key: "name",
        header: t("Description"),
        render: (val, item) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{val}</span>
            <span className="text-[10px] text-gray-400 capitalize">
              {item.Category_id?.name || t("General")}
            </span>
          </div>
        ),
      },
      {
        key: "amount",
        header: t("Amount"),
        render: (val) => (
          <span className="font-black text-rose-600">
            -{formatCurrency(val)} <span className="text-[9px] text-gray-400">EGP</span>
          </span>
        ),
      },
      {
        key: "financial_accountId",
        header: t("Account"),
        render: (val) => (
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
            {val?.name || "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("Time"),
        render: (val) => (
          <span className="text-gray-500 font-medium text-xs">
            {formatDate(val)}
          </span>
        ),
      },
    ],
    [t, isArabic]
  );

  // أعمدة جدول المرتجعات
  const returnColumns = useMemo(
    () => [
      {
        key: "reference",
        header: t("Return Ref"),
        render: (val) => (
          <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
            {val || "—"}
          </span>
        ),
      },
      {
        key: "sale_reference",
        header: t("Original Sale Ref"),
        render: (val) => (
          <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {val || "—"}
          </span>
        ),
      },
      {
        key: "total_amount",
        header: t("Returned Amount"),
        render: (val) => (
          <span className="font-black text-rose-600">
            {formatCurrency(val)} <span className="text-[9px] text-gray-400">EGP</span>
          </span>
        ),
      },
      {
        key: "refund_method",
        header: t("Refund Method"),
        render: (val) => (
          <span className="text-xs font-semibold text-gray-700 capitalize bg-gray-100 px-2.5 py-1 rounded-lg">
            {val ? val.replace("_", " ") : "—"}
          </span>
        ),
      },
      {
        key: "date",
        header: t("Time"),
        render: (val) => (
          <span className="text-gray-500 font-medium text-xs">
            {formatDate(val)}
          </span>
        ),
      },
    ],
    [t, isArabic]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fcfcfc]">
        <Loader />
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="p-12 text-center bg-white min-h-screen flex flex-col items-center justify-center">
        <XCircle className="text-rose-500 mb-4" size={64} />
        <h2 className="text-2xl font-black text-gray-900 mb-2">{t("Shift Not Found")}</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          {error || t("The requested cashier shift details could not be retrieved. Please check the ID or try again later.")}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <ArrowLeft size={18} />
          {t("Back to Shifts")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="w-full max-w-7xl mx-auto">
        {/* Top Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group"
        >
          <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:bg-gray-50 transition-all">
            <ArrowLeft size={20} />
          </div>
          {t("Back to Shifts List")}
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden mb-10">
          <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {shift.cashier?.name || t("Unknown Cashier")}
                  </h1>
                  <span
                    className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                      shift.status === "open"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {t(shift.status)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 font-medium">
                  {shift.cashierman?.username && (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-400">{t("Admin / Manager")}:</span>
                      <span className="text-gray-800 font-bold">{shift.cashierman.username}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-400">{t("Started")}:</span>
                    <span className="text-gray-800 font-bold">{formatDate(shift.start_time)}</span>
                  </div>

                  {shift.end_time && (
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-6 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-400">{t("Ended")}:</span>
                      <span className="text-gray-800 font-bold">{formatDate(shift.end_time)}</span>
                    </div>
                  )}

                  {shift.duration_ms && (
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-6 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
                      <Tag size={16} className="text-gray-400" />
                      <span className="text-gray-400">{t("Duration")}:</span>
                      <span className="text-gray-800 font-bold">{formatDuration(shift.duration_ms)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Sales */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/20 hover:scale-[1.02] transition-transform cursor-default group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                {summary?.sales_count || 0} {t("Sales")}
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("Total Revenue")}</p>
            <h3 className="text-3xl font-black text-gray-900">
              {formatCurrency(summary?.total_sales_amount)} <span className="text-sm font-medium text-gray-400">EGP</span>
            </h3>
          </div>

          {/* Expenses */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/20 hover:scale-[1.02] transition-transform cursor-default group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <TrendingDown size={24} />
              </div>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase">
                {expenses.length} {t("Items")}
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("Total Expenses")}</p>
            <h3 className="text-3xl font-black text-gray-900">
              {formatCurrency(summary?.total_expenses_amount)} <span className="text-sm font-medium text-gray-400">EGP</span>
            </h3>
          </div>

          {/* Returns */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/20 hover:scale-[1.02] transition-transform cursor-default group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <RotateCcw size={24} />
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">
                {returns.length} {t("Returns")}
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("Total Returns")}</p>
            <h3 className="text-3xl font-black text-gray-900">
              {formatCurrency(summary?.total_returns_amount)} <span className="text-sm font-medium text-gray-400">EGP</span>
            </h3>
          </div>

          {/* Net Cash */}
          <div className="bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-transform cursor-default group border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                <Wallet size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                {t("In Drawer")}
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("Net Cash")}</p>
            <h3 className="text-3xl font-black text-white">
              {formatCurrency(summary?.net_cash)} <span className="text-sm font-medium text-gray-500">EGP</span>
            </h3>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex flex-col gap-8">
          {/* Tab Buttons */}
          <div className="flex items-center p-1.5 bg-white rounded-3xl border border-gray-100 shadow-sm w-fit overflow-x-auto">
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                activeTab === "sales"
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Receipt size={18} />
              {t("Sales")}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === "sales" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {sales.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                activeTab === "expenses"
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <FileText size={18} />
              {t("Expenses")}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === "expenses" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {expenses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                activeTab === "returns"
                  ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <RotateCcw size={18} />
              {t("Returns")}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === "returns" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {returns.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === "sales" && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                <DataTable
                  data={sales}
                  columns={saleColumns}
                  title={t("Sales Invoices")}
                  showActions={false}
                  pagination={true}
                  moduleName={AppModules.CASHIER_SHIFT}
                />
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                  <DataTable
                    data={expenses}
                    columns={expenseColumns}
                    title={t("Expenses Sheet")}
                    showActions={false}
                    pagination={true}
                    moduleName={AppModules.CASHIER_SHIFT}
                  />
                </div>

                {/* Audit Box */}
                <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden h-fit">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <Wallet size={24} className="text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-wider text-white">{t("Cash Audit")}</h4>
                  </div>

                  <div className="space-y-5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t("Gross Sales")}</span>
                      <span className="font-black text-emerald-400">+{formatCurrency(summary?.total_sales_amount)} EGP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t("Total Expenses")}</span>
                      <span className="font-black text-rose-400">-{formatCurrency(summary?.total_expenses_amount)} EGP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{t("Total Returns")}</span>
                      <span className="font-black text-amber-400">-{formatCurrency(summary?.total_returns_amount)} EGP</span>
                    </div>

                    <div className="h-px bg-white/10 my-3"></div>

                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t("Calculated")}</p>
                        <span className="text-gray-200 font-bold">{t("Net Cash In Drawer")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white">{formatCurrency(summary?.net_cash)}</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">EGP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                <DataTable
                  data={returns}
                  columns={returnColumns}
                  title={t("Returns Sheet")}
                  showActions={false}
                  pagination={true}
                  moduleName={AppModules.CASHIER_SHIFT}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierShiftDetails;