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

  // State للفلتر النشط (الكل أو حسب السبب)
  const [activeFilter, setActiveFilter] = useState("/api/admin/wasted");

  // جلب قائمة الهوالك
  const { data: wastedResponse, loading, refetch } = useGet(activeFilter);

  // جلب إحصائيات التوالف من الباك إند
  const { data: statsResponse, refetch: refetchStats } = useGet(
    "/api/admin/wasted/stats"
  );

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
        render: (date) => (
          <span className="text-xs text-gray-500">
            {date ? new Date(date).toLocaleDateString() : "---"}
          </span>
        ),
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

  // ── 8. فلاتر التبويب العلوية ──────────────────────────────────────────
  const filters = [
    {
      label: t("All"),
      path: "/api/admin/wasted",
      icon: <PackageSearch size={16} />,
    },
    {
      label: t("damaged"),
      path: "/api/admin/wasted?reason=damaged",
      icon: <Flame size={16} />,
    },
    {
      label: t("expired"),
      path: "/api/admin/wasted?reason=expired",
      icon: <Clock size={16} />,
    },
    {
      label: t("theft"),
      path: "/api/admin/wasted?reason=theft",
      icon: <ShieldAlert size={16} />,
    },
    {
      label: t("lost"),
      path: "/api/admin/wasted?reason=lost",
      icon: <HelpCircle size={16} />,
    },
    {
      label: t("stocktake_not_found"),
      path: "/api/admin/wasted?reason=stocktake_not_found",
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

      {/* ── أزرار الفلترة السريعة (Filter Tabs) ────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.path}
            onClick={() => setActiveFilter(f.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeFilter === f.path
                ? "bg-gray-900 text-white border-gray-900 shadow-md -translate-y-0.5"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
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
