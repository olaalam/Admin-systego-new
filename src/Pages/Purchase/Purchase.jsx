import { useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, X, CreditCard, AlertTriangle,
  Timer, Ban, PackageSearch, Box, CheckCircle2,
  Wallet, Receipt, Clock, Eye
} from "lucide-react";
import PurchaseReturnsModal from "./PurchaseReturnsModal";

const PurchasesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  const [activeFilter, setActiveFilter] = useState("/api/admin/purchase");
  const { data, loading, error } = useGet(activeFilter);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnModalData, setReturnModalData] = useState({ isOpen: false, purchaseId: null });
  // --- 1. حساب الإحصائيات (Stats) للعرض في الأعلى ---
  const statsData = useMemo(() => {
    if (!data) return null;

    // لو إحنا في فلتر Low Stock، نعرض إحصائيات المنتجات فقط
    if (data.products) {
      return { type: 'products', count: data.count || 0, message: data.message };
    }

    // لو إحنا في المشتريات (خاصة فلتر الكل)، نعرض إحصائيات الـ stats الشاملة
    return {
      type: 'purchases',
      total_purchases: data.stats?.total_purchases || 0,
      total_amount: data.stats?.total_amount || 0,
      partial_count: data.stats?.partial_count || 0,
      partial_amount: data.stats?.partial_amount || 0,
      full_count: data.stats?.full_count || 0,
      full_amount: data.stats?.full_amount || 0,
      later_count: data.stats?.later_count || 0,
      later_amount: data.stats?.later_amount || 0,
    };
  }, [data]);

  // --- 2. تجميع البيانات للجدول ---
  const displayData = useMemo(() => {
    if (!data) return [];
    if (data.products) return data.products;
    return [
      ...(data?.purchases?.partial || []),
      ...(data?.purchases?.full || []),
      ...(data?.purchases?.later || []),
      ...(Array.isArray(data) ? data : [])
    ];
  }, [data]);

  // --- 3. تعريف الأعمدة ديناميكياً ---
  const columns = useMemo(() => {
    if (activeFilter.includes("low-stock")) {
      return [
        { key: "code", header: t("Code") },
        { key: "name", header: t("Product Name"), render: (val, item) => isArabic ? (item.ar_name || item.name) : item.name },
        { key: "actual_stock", header: t("Stock"), render: (val) => <span className="font-bold text-orange-600">{val}</span> }
      ];
    }

    return [
      { key: "reference", header: t("Reference") },
      { key: "supplier_id", header: t("Supplier"), render: (sup) => sup?.company_name || sup?.username || "---" },
      { key: "warehouse_id", header: t("Warehouse"), render: (wh) => wh?.name || "---", filterable: true },
      { key: "grand_total", header: t("Total"), render: (val) => <span className="font-bold">{val} EGP</span> },

      // --- عمود الـ Invoices (المدفوعات الفعلية) ---
      {
        key: "invoices",
        header: t("Paid"),
        render: (invoices) => {
          const totalPaid = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
          return (
            <div className="flex flex-col">
              <span className="text-green-600 font-bold text-xs">{totalPaid} EGP</span>
              <span className="text-[9px] text-gray-400">{invoices?.length || 0} {t("Payments")}</span>
            </div>
          );
        }
      },

      {
        key: "payment_status",
        header: t("Status"),
        filterable: true,
        render: (status, item) => (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${status === 'full' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
              }`}>
              {t(status || 'N/A')}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPurchase(item); }}
              className="text-teal-600 p-1 bg-white border border-teal-100 rounded-full shadow-sm hover:bg-teal-50"
            >
              <CalendarDays size={14} />
            </button>
          </div>
        )
      },
      {
        key: "returns",
        header: t("Returns"),
        render: (_, item) => (
          <button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 rounded-full border border-purple-100 h-8"
            onClick={(e) => {
              e.stopPropagation(); // منع فتح مودال التفاصيل الأساسي
              setReturnModalData({ isOpen: true, purchaseId: item._id });
            }}
          >
            <Eye size={14} />
            <span className="text-[10px] font-bold">{t("View Returns")}</span>
          </button>
        )
      },
      { key: "date", header: t("Date"), render: (date) => date ? new Date(date).toLocaleDateString() : '---' },
    ];
  }, [activeFilter, t, isArabic]);

  const filters = [
    { label: t("All"), path: "/api/admin/purchase", icon: <PackageSearch size={16} /> },
    { label: t("Low Stock"), path: "/api/admin/purchase/low-stock", icon: <AlertTriangle size={16} /> },
    { label: t("Expiring Soon"), path: "/api/admin/purchase/expiring", icon: <Timer size={16} /> },
    { label: t("Expired"), path: "/api/admin/purchase/expired", icon: <Ban size={16} /> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* --- الإحصائيات العلوية الشاملة (Stats) --- */}
      {statsData && statsData.type === 'purchases' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* إجمالي المشتريات */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Box size={20} /></div>
              <span className="text-xs font-bold text-gray-400">TOTAL</span>
            </div>
            <h3 className="text-xl font-black">{statsData.total_amount} EGP</h3>
            <p className="text-xs text-gray-500">{statsData.total_purchases} {t("Purchases")}</p>
          </div>

          {/* مدفوع جزئياً */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-100 border-l-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Wallet size={20} /></div>
              <span className="text-xs font-bold text-teal-600">PARTIAL</span>
            </div>
            <h3 className="text-xl font-black text-teal-700">{statsData.partial_amount} EGP</h3>
            <p className="text-xs text-teal-500">{statsData.partial_count} {t("Invoices")}</p>
          </div>

          {/* مدفوع بالكامل */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 border-l-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={20} /></div>
              <span className="text-xs font-bold text-green-600">FULL</span>
            </div>
            <h3 className="text-xl font-black text-green-700">{statsData.full_amount} EGP</h3>
            <p className="text-xs text-green-500">{statsData.full_count} {t("Invoices")}</p>
          </div>

          {/* دفع لاحقاً */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 border-l-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={20} /></div>
              <span className="text-xs font-bold text-orange-600">LATER</span>
            </div>
            <h3 className="text-xl font-black text-orange-700">{statsData.later_amount} EGP</h3>
            <p className="text-xs text-orange-500">{statsData.later_count} {t("Invoices")}</p>
          </div>
        </div>
      )}

      {/* إحصائيات الـ Low Stock */}
      {statsData && statsData.type === 'products' && (
        <div className="bg-teal-600 p-4 rounded-2xl shadow-lg mb-6 text-white flex items-center gap-4">
          <AlertTriangle size={24} />
          <div>
            <h3 className="font-black">{statsData.count} {t("Products with Low Stock")}</h3>
            <p className="text-xs opacity-80">{statsData.message}</p>
          </div>
        </div>
      )}

      {/* أزرار الفلترة */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.path}
            onClick={() => setActiveFilter(f.path)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeFilter === f.path
                ? "bg-gray-900 text-white border-gray-900 shadow-xl -translate-y-1"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          data={displayData}
          columns={columns}
          title={activeFilter.includes('low-stock') ? t("Low Stock Products") : t("Purchases")}
          addButtonText={t("Add")}
          onEdit={(item) => navigate(`edit/${item._id}`)}
          showActions={true}
          onAdd={() => alert("Add new payment method clicked!")}
          addPath="add"
        />
      )}
      <PurchaseReturnsModal
        purchaseId={returnModalData.purchaseId}
        isOpen={returnModalData.isOpen}
        onClose={() => setReturnModalData({ isOpen: false, purchaseId: null })}
      />

      {/* المودال التفصيلي (Invoices + Due Payments) */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-teal-600 p-4 text-white flex justify-between items-center font-bold">
              <div className="flex items-center gap-2 text-sm"><Receipt size={18} /> {t("Financial Summary")}</div>
              <button onClick={() => setSelectedPurchase(null)}><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* نفس محتوى المودال السابق لعرض المدفوعات والمواعيد */}
              <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">{t("Paid History")}</h4>
              {selectedPurchase.invoices?.map((inv, i) => (
                <div key={i} className="flex justify-between p-3 bg-green-50 border border-green-100 rounded-xl mb-2">
                  <span className="text-xs font-bold text-gray-600">{new Date(inv.date).toLocaleDateString()}</span>
                  <span className="text-sm font-black text-green-700">{inv.amount} EGP</span>
                </div>
              ))}
              <h4 className="text-[10px] font-black text-gray-400 uppercase mt-4 mb-3 tracking-widest">{t("Future Dues")}</h4>
              {selectedPurchase.duePayments?.map((due, i) => (
                <div key={i} className="flex justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl mb-2">
                  <span className="text-xs font-bold text-gray-600">{new Date(due.date).toLocaleDateString()}</span>
                  <span className="text-sm font-black text-orange-700">{due.amount} EGP</span>
                </div>
              ))}
              <button onClick={() => setSelectedPurchase(null)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold">{t("Done")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;