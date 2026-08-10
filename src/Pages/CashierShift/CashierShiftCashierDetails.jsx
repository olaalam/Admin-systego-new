import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import Loader from "@/components/Loader";
import DataTable from "@/components/DataTable";
import {
  ArrowLeft,
  User,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  X,
} from "lucide-react";

const CashierShiftCashierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // حالة فلاتر التاريخ
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // بناء رابط الـ API مع الـ Query Parameters
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("start_date", startDate);
  if (endDate) queryParams.append("end_date", endDate);

  const queryString = queryParams.toString();
  const apiEndpoint = `/api/admin/admin/report/${id}${queryString ? `?${queryString}` : ""}`;

  const { data, loading, error } = useGet(apiEndpoint);

  // استخراج بيانات الكاشير (تم إضافة cashierman)
  const cashier = useMemo(() => {
    if (!data) return null;
    return (
      data.cashierman ||
      data.cashier ||
      data.admin ||
      data.user ||
      data.employee ||
      data.profile ||
      data
    );
  }, [data]);

  // استخراج الشيفتات
  const shifts = useMemo(() => {
    if (!data) return [];
    return data.shifts || data.data?.shifts || data.shift || [];
  }, [data]);

  const avatarUrl = cashier?.image || cashier?.photo || cashier?.avatar || cashier?.profile_image || cashier?.user_image || cashier?.logo;

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString(isArabic ? "ar-EG" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // إعداد أعمدة الجدول متوافقة مع الـ Keys الجدد من الباك إند
  const columns = useMemo(
    () => [
      {

        key: "_id",
        header: t("Shift ID"),
        render: (val, item) =>
          <Link to={`/cashier-shift/cashiershift/${item.shifts?._id || item._id}`} className="group flex items-center gap-4 cursor-pointer">
            <span className="font-mono text-xs text-gray-600">{val}</span>
          </Link>,
      },
      {
        key: "cashier_name",
        header: t("Cashier Name"),
        render: (val) => <span className="font-mono text-xs text-gray-600">{val}</span>,
      },
      {
        key: "status",
        header: t("Status"),
        render: (status) => (
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${status === "open"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            {t(status) || status}
          </span>
        ),
      },
      {
        key: "total_sales_amount",
        header: t("Sales"),
        render: (val, row) => {
          const amount = val ?? row.total_sale_amount;
          return (
            <div className="flex items-center gap-2">
              <ArrowUpRight size={14} className="text-emerald-500" />
              <span className="font-black text-gray-900">{formatCurrency(amount)} <span className="text-[9px] text-gray-400">EGP</span></span>
            </div>
          );
        },
      },
      {
        key: "total_expenses_amount",
        header: t("Expenses"),
        render: (val, row) => {
          const amount = val ?? row.total_expenses;
          return (
            <div className="flex items-center gap-2">
              <ArrowDownLeft size={14} className="text-rose-500" />
              <span className="font-black text-gray-900">{formatCurrency(amount)} <span className="text-[9px] text-gray-400">EGP</span></span>
            </div>
          );
        },
      },
      {
        key: "returns_count",
        header: t("Returns"),
        render: (val) => <span className="font-semibold text-gray-900">{val || 0}</span>,
      },
      {
        key: "total_returns_amount",
        header: t("Return Amount"),
        render: (val, row) => {
          const amount = val ?? row.total_returns;
          return <span className="font-black text-gray-900">{formatCurrency(amount)} <span className="text-[9px] text-gray-400">EGP</span></span>;
        },
      },
      {
        key: "net_cash",
        header: t("Net Cash"),
        render: (val, row) => {
          const amount = val ?? row.net_cash_in_drawer;
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-900 text-white">
              <Wallet size={14} />
              <span className="font-black text-xs">{formatCurrency(amount)} <span className="text-[9px] text-gray-200">EGP</span></span>
            </div>
          );
        },
      },
      {
        key: "start_time",
        header: t("Start Time"),
        render: (val) => <span className="text-sm font-medium text-gray-700">{formatDate(val)}</span>,
      },
      {
        key: "end_time",
        header: t("End Time"),
        render: (val) => <span className="text-sm font-medium text-gray-700">{formatDate(val)}</span>,
      },
    ],
    [t, isArabic]
  );

  // الاعتماد على summary القادمة من الباك إند أولاً
  const stats = useMemo(() => {
    const summary = data?.summary;
    const open = shifts.filter((item) => item.status === "open").length;
    const closed = shifts.filter((item) => item.status === "closed").length;

    if (summary) {
      return {
        total: summary.total_shifts ?? shifts.length,
        open,
        closed,
        totalSales: summary.total_sales_amount || 0,
        totalExpenses: summary.total_expenses_amount || 0,
        netCash: summary.total_net_cash || 0,
      };
    }

    return {
      total: shifts.length,
      open,
      closed,
      totalSales: shifts.reduce((sum, item) => sum + Number(item.total_sales_amount || item.total_sale_amount || 0), 0),
      totalExpenses: shifts.reduce((sum, item) => sum + Number(item.total_expenses_amount || item.total_expenses || 0), 0),
      netCash: shifts.reduce((sum, item) => sum + Number(item.net_cash || item.net_cash_in_drawer || 0), 0),
    };
  }, [data, shifts]);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (loading && !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fcfcfc]">
        <Loader />
      </div>
    );
  }

  if (error || !cashier) {
    return (
      <div className="p-12 text-center bg-white min-h-screen">
        <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <User size={48} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{t("Cashier Not Found")}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || t("The requested cashier report could not be retrieved. Please check the ID or try again later.")}</p>
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

  const cashierName = cashier.username || cashier.name || cashier.ar_name || cashier.title || "Unknown";
  const cashierSubtitle = cashier.email || cashier.phone || cashier.role || "";
  const initials = cashierName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group"
        >
          <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:bg-gray-50 transition-all">
            <ArrowLeft size={20} />
          </div>
          {t("Back to Shifts List")}
        </button>

        {/* Cashier Info Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-10">
          <div className="p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={cashierName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-gray-700">{initials || "C"}</span>
                )}
              </div>

              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{cashierName}</h1>
                <p className="mt-2 text-sm text-gray-500 max-w-xl">{cashierSubtitle}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {cashier.email && (
                    <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{t("Email")}</p>
                      <p className="font-semibold text-gray-900 text-sm">{cashier.email}</p>
                    </div>
                  )}
                  {cashier.role && (
                    <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{t("Role")}</p>
                      <p className="font-semibold text-gray-900 text-sm capitalize">{cashier.role}</p>
                    </div>
                  )}
                  {cashier.status !== undefined && (
                    <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{t("Status")}</p>
                      <span className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${cashier.status === "active" || cashier.status === true ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {cashier.status === "active" || cashier.status === true ? t("Active") : t("Inactive")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
              <div className="rounded-[2rem] bg-emerald-50 border border-emerald-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-white text-emerald-600">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{t("Total Sales")}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(stats.totalSales)} <span className="text-xs text-gray-400">EGP</span></p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-rose-50 border border-rose-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-white text-rose-600">
                    <TrendingDown size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">{t("Total Expenses")}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(stats.totalExpenses)} <span className="text-xs text-gray-400">EGP</span></p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-gray-900 text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-white/10 text-white">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{t("Net Cash")}</p>
                    <p className="text-2xl font-black mt-1">{formatCurrency(stats.netCash)} <span className="text-xs text-gray-300">EGP</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-800">{t("Filter Shifts by Date")}</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("Start Date")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("End Date")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                />
              </div>
            </div>

            {(startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"
              >
                <X size={14} />
                {t("Reset Filter")}
              </button>
            )}
          </div>
        </div>

        {/* Shift History & Data Table */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">{t("Shift History")}</p>
              <h2 className="text-3xl font-black text-gray-900">{t("All Shifts")}</h2>
            </div>
            <div className="rounded-3xl bg-white border border-gray-200 px-5 py-4 shadow-sm w-full sm:w-auto">
              <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{t("Total Shifts")}</div>
              <div className="text-3xl font-black text-gray-900 mt-1">{stats.total}</div>
              <div className="mt-2 flex gap-3 text-xs text-gray-500 font-medium">
                <span>{t("Open")}: <strong className="text-emerald-600">{stats.open}</strong></span>
                <span>{t("Closed")}: <strong className="text-gray-700">{stats.closed}</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[2rem]">
                <Loader />
              </div>
            )}
            <DataTable
              data={shifts}
              columns={columns}
              title={t("Cashier Shift History")}
              showActions={false}
              pagination={true}
              moduleName={AppModules.CASHIER_SHIFT_REPORT}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierShiftCashierDetails;