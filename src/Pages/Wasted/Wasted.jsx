import { useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  HelpCircle,
  PackageSearch,
  Eye,
  CheckCircle2,
  Check,
  Warehouse,
  Package,
  Layers,
  FileText,
  User,
  Coins,
  TrendingDown,
  CalendarDays,
  Calendar,
  RotateCcw,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Wasted = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  // ── حالات الفلترة (السبب والفترة الزمنية من / إلى) ──────────────────────
  const [selectedReason, setSelectedReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── تحويل التاريخ المحلي إلى بداية ونهاية اليوم بصيغة ISO لـ MongoDB ──
  const getStartOfDayISO = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day, 0, 0, 0, 0);
    return d.toISOString();
  };

  const getEndOfDayISO = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day, 23, 59, 59, 999);
    return d.toISOString();
  };

  // بناء رابط جلب الهوالك ديناميكياً بناءً على الفلاتر النشطة
  const wastedEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedReason) params.append("reason", selectedReason);
    if (fromDate) {
      const fromISO = getStartOfDayISO(fromDate);
      if (fromISO) params.append("from", fromISO);
    }
    if (toDate) {
      const toISO = getEndOfDayISO(toDate);
      if (toISO) params.append("to", toISO);
    }
    const qs = params.toString();
    return qs ? `/api/admin/wasted?${qs}` : "/api/admin/wasted";
  }, [selectedReason, fromDate, toDate]);

  // بناء رابط جلب الإحصائيات مع الفلترة بالتواريخ
  const statsEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (fromDate) {
      const fromISO = getStartOfDayISO(fromDate);
      if (fromISO) params.append("from", fromISO);
    }
    if (toDate) {
      const toISO = getEndOfDayISO(toDate);
      if (toISO) params.append("to", toISO);
    }
    const qs = params.toString();
    return qs ? `/api/admin/wasted/stats?${qs}` : "/api/admin/wasted/stats";
  }, [fromDate, toDate]);

  // جلب قائمة الهوالك
  const { data: wastedResponse, loading, refetch } = useGet(wastedEndpoint);

  // جلب إحصائيات التوالف من الباك إند
  const { data: statsResponse, refetch: refetchStats } = useGet(statsEndpoint);

  // ── دوال مساعدة للفترات الزمنية السريعة (Date Presets) ─────────────────
  const formatDateForInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSetToday = () => {
    const today = formatDateForInput(new Date());
    setFromDate(today);
    setToDate(today);
  };

  const handleSetLast7Days = () => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 6);
    setFromDate(formatDateForInput(past));
    setToDate(formatDateForInput(now));
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setFromDate(formatDateForInput(firstDay));
    setToDate(formatDateForInput(now));
  };

  const handleResetFilters = () => {
    setSelectedReason("");
    setFromDate("");
    setToDate("");
  };

  // حالة المودال الخاص بالتفاصيل
  const [viewItem, setViewItem] = useState(null);

  // حالة مودال الحذف
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { deleteData } = useDelete();

  // حالة الاعتماد السريع
  const [approvingId, setApprovingId] = useState(null);

  // ── 1. استخراج قائمة العناصر من استجابة الباك إند ────────────────────────
  const wastedItems = useMemo(() => {
    if (!wastedResponse) return [];
    if (Array.isArray(wastedResponse)) return wastedResponse;
    if (Array.isArray(wastedResponse.data)) return wastedResponse.data;
    return [];
  }, [wastedResponse]);

  // ── 2. دالة ذكية وشاملة لاستخراج بيانات المنتج مهما كان شكل السجل ────────
  const getProductInfo = (item) => {
    if (!item) return { name: "---", code: "", image: "", isMissing: true };

    const prod = item.productId || item.product_id || item.product;

    if (typeof prod === "object" && prod !== null) {
      const name = isArabic
        ? prod.ar_name || prod.name || prod.code
        : prod.name || prod.ar_name || prod.code;
      return {
        name: name || (isArabic ? "منتج بدون اسم" : "Unnamed Product"),
        code: prod.code || item.code || "",
        image: prod.image || "",
        isMissing: false,
      };
    }

    if (typeof prod === "string" && prod.trim()) {
      return {
        name:
          item.productName ||
          item.name ||
          `${isArabic ? "منتج (كود)" : "Product"}: ${prod.slice(-8)}`,
        code: item.code || prod,
        image: "",
        isMissing: false,
      };
    }

    // إذا كان السجل قديماً أو المنتج محذوفاً من قاعدة البيانات
    return {
      name:
        item.productName ||
        item.name ||
        (isArabic ? "منتج غير متوفر (سجل قديم)" : "Item unavailable"),
      code: item.code || "",
      image: "",
      isMissing: true,
    };
  };

  // ── 3. حساب إحصائيات الكروت العلوية (Stats) ─────────────────────────────
  const stats = useMemo(() => {
    const rawStats = Array.isArray(statsResponse?.data)
      ? statsResponse.data
      : Array.isArray(statsResponse)
      ? statsResponse
      : [];

    let totalQuantity = 0;
    let totalLossValue = 0;
    let totalRecords = 0;
    const reasonMap = {};

    rawStats.forEach((st) => {
      totalQuantity += st.totalQuantity || 0;
      totalLossValue += st.totalLossValue || 0;
      totalRecords += st.count || 0;
      reasonMap[st._id] = {
        quantity: st.totalQuantity || 0,
        lossValue: st.totalLossValue || 0,
        count: st.count || 0,
      };
    });

    return {
      totalQuantity,
      totalLossValue,
      totalRecords,
      damaged: reasonMap["damaged"] || { quantity: 0, lossValue: 0, count: 0 },
      expired: reasonMap["expired"] || { quantity: 0, lossValue: 0, count: 0 },
      theft: reasonMap["theft"] || { quantity: 0, lossValue: 0, count: 0 },
      lost: reasonMap["lost"] || { quantity: 0, lossValue: 0, count: 0 },
    };
  }, [statsResponse]);

  // ── 4. شارات الأسباب بألوان واضحة ─────────────────────────────────────
  const renderReasonBadge = (reason) => {
    const config = {
      damaged: {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: <Flame size={13} className="text-red-600" />,
        label: t("damaged"),
      },
      expired: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock size={13} className="text-amber-600" />,
        label: t("expired"),
      },
      theft: {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <ShieldAlert size={13} className="text-purple-600" />,
        label: t("theft"),
      },
      lost: {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <HelpCircle size={13} className="text-blue-600" />,
        label: t("lost"),
      },
      stocktake_not_found: {
        bg: "bg-orange-50 text-orange-700 border-orange-200",
        icon: <AlertTriangle size={13} className="text-orange-600" />,
        label: t("stocktake_not_found"),
      },
      other: {
        bg: "bg-gray-50 text-gray-700 border-gray-200",
        icon: <FileText size={13} className="text-gray-500" />,
        label: t("other"),
      },
    };

    const current = config[reason] || {
      bg: "bg-gray-50 text-gray-700 border-gray-200",
      icon: null,
      label: reason || "---",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${current.bg}`}
      >
        {current.icon}
        {current.label}
      </span>
    );
  };

  // ── 5. زر وتأكيد اعتماد الهالك سريعاً (PATCH /:id/status) ──────────────
  const handleApproveStatus = async (item) => {
    const targetId = item?._id || item?.id;
    if (!targetId) {
      toast.error(t("Invalid entry ID"));
      return;
    }
    if (item.isApproved) return;

    try {
      setApprovingId(targetId);
      const res = await api.patch(`/api/admin/wasted/${targetId}/status`, {
        isApproved: true,
      });
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || t("Approved successfully!"));
        refetch();
        refetchStats();
      }
    } catch (err) {
      console.error("Approve status error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.message ||
        t("Failed to approve wasted item");
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  // ── 6. تنفيذ حذف السجل مع استرجاع المخزون ──────────────────────────────
  const handleDeleteConfirm = async () => {
    const targetId = deleteTarget?._id || deleteTarget?.id;
    if (!targetId) {
      toast.error(t("Invalid entry ID"));
      return;
    }
    try {
      await deleteData(`/api/admin/wasted/${targetId}`);
      setDeleteTarget(null);
      refetch();
      refetchStats();
    } catch (err) {
      console.error("Delete wasted error:", err);
    }
  };

  // ── 7. تعريف أعمدة الجدول ─────────────────────────────────────────────
  const columns = useMemo(() => {
    return [
      {
        key: "productId",
        header: t("Product"),
        render: (_, item) => {
          const info = getProductInfo(item);
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200 overflow-hidden shrink-0">
                {info.image ? (
                  <img
                    src={info.image}
                    alt={info.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={18} />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-bold text-sm leading-tight ${
                    info.isMissing ? "text-gray-400 italic" : "text-gray-900"
                  }`}
                >
                  {info.name}
                </span>
                {info.code && (
                  <span className="font-mono text-[11px] text-gray-400 mt-0.5">
                    {info.code}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "productPriceId",
        header: isArabic ? "التشكيلة / الخيار" : "Variant",
        render: (_, item) => {
          const variant = item.productPriceId;
          if (variant && variant.name) {
            return (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                <Layers size={13} className="text-blue-500" />
                <span>{variant.name}</span>
                {variant.price && (
                  <span className="text-[10px] text-blue-500 font-normal">
                    ({variant.price} EGP)
                  </span>
                )}
              </div>
            );
          }
          return (
            <span className="text-gray-400 text-xs">
              {isArabic ? "منتج أساسي (بدون خيارات)" : "Standard"}
            </span>
          );
        },
      },
      {
        key: "warehouseId",
        header: t("Warehouse"),
        render: (wh) => (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <Warehouse size={14} className="text-gray-400" />
            <span>{wh?.name || "---"}</span>
          </div>
        ),
      },
      {
        key: "quantity",
        header: t("Quantity"),
        render: (qty) => (
          <span className="inline-block px-2.5 py-1 bg-red-100/80 text-red-700 rounded-lg font-black text-xs">
            {qty}
          </span>
        ),
      },
      {
        key: "reason",
        header: t("Reason"),
        render: (reason) => renderReasonBadge(reason),
      },
      {
        key: "isApproved",
        header: t("Status"),
        render: (isApproved, item) => {
          const itemId = item._id || item.id;
          const isCurrentApproving = approvingId === itemId;

          return (
            <div className="flex items-center gap-1.5">
              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                  <CheckCircle2 size={12} />
                  {t("Approved")}
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                    <Clock size={12} />
                    {t("Pending")}
                  </span>
                  <button
                    disabled={isCurrentApproving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveStatus(item);
                    }}
                    className="p-1 bg-white hover:bg-green-50 border border-green-200 text-green-600 rounded-full shadow-xs transition-colors hover:scale-105 active:scale-95 disabled:opacity-50"
                    title={t("Approve Wasted")}
                  >
                    {isCurrentApproving ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <Check size={13} />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: t("Date"),
        render: (date) => {
          if (!date) return <span className="text-xs text-gray-400">---</span>;
          const d = new Date(date);
          return (
            <div className="flex items-center gap-1.5 text-xs text-gray-700 whitespace-nowrap">
              <span className="font-semibold">{d.toLocaleDateString()}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded-md">
                <Clock size={11} className="text-gray-400 shrink-0" />
                {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: t("Details"),
        render: (_, item) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewItem(item);
            }}
            className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
            title={t("View Details")}
          >
            <Eye size={15} />
          </button>
        ),
      },
    ];
  }, [isArabic, t, approvingId]);

  // ── 8. فلاتر أسباب الهالك (Reason Tabs) ───────────────────────────────
  const reasonTabs = [
    {
      value: "",
      label: t("All"),
      icon: <PackageSearch size={16} />,
    },
    {
      value: "damaged",
      label: t("damaged"),
      icon: <Flame size={16} />,
    },
    {
      value: "expired",
      label: t("expired"),
      icon: <Clock size={16} />,
    },
    {
      value: "theft",
      label: t("theft"),
      icon: <ShieldAlert size={16} />,
    },
    {
      value: "lost",
      label: t("lost"),
      icon: <HelpCircle size={16} />,
    },
    {
      value: "stocktake_not_found",
      label: t("stocktake_not_found"),
      icon: <AlertTriangle size={16} />,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── العنوان العلوي ───────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">{t("Wasted")}</h1>
        <p className="text-xs text-gray-500 mt-1">
          {t("Manage and track inventory damages and losses")}
        </p>
      </div>

      {/* ── كروت الإحصائيات العلوية (Stats Cards) مثل Purchase ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* إجمالي الخسائر المالية */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
            <span className="text-[10px] font-black tracking-wider text-gray-400 uppercase">
              {t("Total Losses")}
            </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            {stats.totalLossValue.toLocaleString()} EGP
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalRecords} {t("Wasted Items")}
          </p>
        </div>

        {/* إجمالي الكميات الهالكة */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Coins size={20} />
            </div>
            <span className="text-[10px] font-black tracking-wider text-orange-600 uppercase">
              {t("Total Wasted")}
            </span>
          </div>
          <h3 className="text-2xl font-black text-orange-700">
            {stats.totalQuantity.toLocaleString()}
          </h3>
          <p className="text-xs text-orange-600/80 mt-1">
            {t("Units removed from stock")}
          </p>
        </div>

        {/* التالف (Damaged) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Flame size={20} />
            </div>
            <span className="text-[10px] font-black tracking-wider text-amber-600 uppercase">
              {t("damaged")}
            </span>
          </div>
          <h3 className="text-2xl font-black text-amber-700">
            {stats.damaged.quantity}
          </h3>
          <p className="text-xs text-amber-600/80 mt-1">
            {stats.damaged.lossValue.toLocaleString()} EGP {t("loss")}
          </p>
        </div>

        {/* منتهي الصلاحية (Expired) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-black tracking-wider text-purple-600 uppercase">
              {t("expired")}
            </span>
          </div>
          <h3 className="text-2xl font-black text-purple-700">
            {stats.expired.quantity}
          </h3>
          <p className="text-xs text-purple-600/80 mt-1">
            {stats.expired.lossValue.toLocaleString()} EGP {t("loss")}
          </p>
        </div>
      </div>

      {/* ── تابة وبطاقة الفلترة المتقدمة (Reason & Date Filtration) ───── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-6 space-y-4">
        {/* صف تابات أسباب الهالك مع زر إعادة الضبط */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {reasonTabs.map((tab) => {
              const isActive = selectedReason === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedReason(tab.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs -translate-y-0.5"
                      : "bg-gray-50/80 text-gray-600 border-gray-200/80 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {(selectedReason || fromDate || toDate) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors"
              title={isArabic ? "مسح جميع الفلاتر" : "Reset all filters"}
            >
              <RotateCcw size={13} />
              <span>{isArabic ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
            </button>
          )}
        </div>

        {/* شريط فلترة الفترة الزمنية (from & to) */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-700">
              <Calendar size={15} className="text-gray-500" />
              <span>{isArabic ? "الفترة الزمنية:" : "Date Range:"}</span>
            </div>

            {/* From Input */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus-within:border-gray-900 focus-within:bg-white transition-colors">
              <span className="text-gray-400 font-medium">
                {isArabic ? "من:" : "From:"}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            {/* To Input */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus-within:border-gray-900 focus-within:bg-white transition-colors">
              <span className="text-gray-400 font-medium">
                {isArabic ? "إلى:" : "To:"}
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:outline-none"
              />
            </div>

            {/* زر مسح التواريخ فقط */}
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                title={isArabic ? "مسح التواريخ" : "Clear dates"}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* فلاتر سريعة للتواريخ */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSetToday}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {isArabic ? "اليوم" : "Today"}
            </button>
            <button
              onClick={handleSetLast7Days}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {isArabic ? "آخر 7 أيام" : "Last 7 Days"}
            </button>
            <button
              onClick={handleSetThisMonth}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {isArabic ? "هذا الشهر" : "This Month"}
            </button>
          </div>
        </div>
      </div>

      {/* ── جدول البيانات (DataTable) مع زر الإضافة الوحيد المعتمد ─────── */}
      {loading ? (
        <Loader />
      ) : (
        <DataTable
          data={wastedItems}
          columns={columns}
          title={t("Wasted")}
          addButtonText={t("Add Wasted")}
          onAdd={() => navigate("add")}
          addPath="add"
          onDelete={(item) => setDeleteTarget(item)}
          showActions={true}
          searchable={true}
          filterable={true}
          itemsPerPage={15}
        />
      )}

      {/* ── مودال عرض التفاصيل بالتفصيل (Details Modal) ──────────────── */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <FileText className="text-red-600" size={22} />
              {t("Wasted Details")}
            </DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="p-6 space-y-5">
              {/* بيانات المنتج والمستودع */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {t("Product")}
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      {getProductInfo(viewItem).name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {getProductInfo(viewItem).code || "---"}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {t("Warehouse")}
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      {viewItem.warehouseId?.name || "---"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {t("Recorded by")}: {viewItem.userId?.username || "---"}
                    </p>
                  </div>
                </div>
              </div>

              {/* الكمية والسبب والحالة */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {t("Quantity")}
                  </p>
                  <span className="text-lg font-black text-red-600">
                    {viewItem.quantity}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {t("Reason")}
                  </p>
                  {renderReasonBadge(viewItem.reason)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {t("Status")}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      viewItem.isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {viewItem.isApproved ? t("Approved") : t("Pending")}
                  </span>
                </div>
              </div>

              {/* التشكيلة أو خيارات المنتج إن وجدت */}
              {viewItem.productPriceId && viewItem.productPriceId.name && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 flex items-center gap-1.5">
                    <Layers size={14} /> {isArabic ? "التشكيلة / الخيار" : "Variant"}:
                  </span>
                  <span className="font-bold text-gray-800">
                    {viewItem.productPriceId.name}{" "}
                    {viewItem.productPriceId.price &&
                      `(${viewItem.productPriceId.price} EGP)`}
                  </span>
                </div>
              )}

              {/* الملاحظة */}
              {viewItem.note && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {t("Note")}
                  </p>
                  <p className="text-xs text-gray-700">{viewItem.note}</p>
                </div>
              )}

              {/* تاريخ الإنشاء */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {viewItem.createdAt
                    ? new Date(viewItem.createdAt).toLocaleString()
                    : "---"}
                </span>
                <span className="flex items-center gap-1">
                  <User size={13} />
                  {viewItem.userId?.username || "---"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── مودال الحذف مع تنبيه استرجاع المخزون (DeleteDialog) ──────── */}
      {deleteTarget && (
        <DeleteDialog
          title={t("Delete Wasted Item")}
          message={t(
            "Are you sure you want to delete this wasted entry? Deleting it will automatically restore the stock to the warehouse."
          )}
          confirmText={t("Delete & Restore Stock")}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Wasted;
