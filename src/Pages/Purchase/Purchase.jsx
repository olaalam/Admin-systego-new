import { useState, useMemo, Fragment } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, X, CreditCard, AlertTriangle,
  Timer, Ban, PackageSearch, Box, CheckCircle2,
  Wallet, Receipt, Clock, Eye, Building2, Warehouse, FileText, Package, Layers
} from "lucide-react";
import PurchaseReturnsModal from "./PurchaseReturnsModal";
import usePut from "@/hooks/usePut";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PurchasesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  const [activeFilter, setActiveFilter] = useState("/api/admin/purchase");
  const { data, loading, error } = useGet(activeFilter);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnModalData, setReturnModalData] = useState({ isOpen: false, purchaseId: null });

  // --- حالات المودال الخاص بتفاصيل المشتريات (/api/admin/purchase/:id) ---
  const [viewPurchaseId, setViewPurchaseId] = useState(null);
  const { data: purchaseDetails, loading: isDetailsLoading } = useGet(
    viewPurchaseId ? `/api/admin/purchase/${viewPurchaseId}` : null
  );

  const { data: selection } = useGet("api/admin/purchase/selection");
  const { putData: payInstallment, loading: isPaying } = usePut();
  const [payingInstallmentId, setPayingInstallmentId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // --- 1. حساب الإحصائيات (Stats) للعرض في الأعلى ---
  const statsData = useMemo(() => {
    if (!data) return null;

    if (data.products) {
      return { type: 'products', count: data.count || 0, message: data.message };
    }

    return {
      type: 'purchases',
      total_purchases: data.stats?.total_purchases || 0,
      total_amount: data.stats?.total_amount || 0,
      partial_count: data.stats?.partial_count || 0,
      partial_amount: data.stats?.partial_amount || 0,
      full_count: data.stats?.full_count || 0,
      full_amount: data.stats?.full_amount?.toFixed(2) || 0,
      later_count: data.stats?.later_count || 0,
      later_amount: data.stats?.later_amount?.toFixed(2) || 0,
    };
  }, [data]);

  // --- 2. تجميع البيانات للجدول ---
  const displayData = useMemo(() => {
    if (!data) return [];
    if (data.products) return data.products;

    const allPurchases = [
      ...(data?.purchases?.partial || []),
      ...(data?.purchases?.full || []),
      ...(data?.purchases?.later || []),
      ...(Array.isArray(data) ? data : [])
    ];

    return allPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      { key: "warehouse_id", header: t("Warehouse"), render: (wh) => wh?.name || "---", filterable: false },
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
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${status === 'full' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {t(status || 'N/A')}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPurchase(item); }}
              className="text-red-600 p-1 bg-white border border-red-100 rounded-full shadow-sm hover:bg-red-50"
              title={t("View Installments")}
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
            className="flex items-center gap-1 text-gray-600 hover:bg-gray-50 rounded-full border border-gray-100 h-8 px-2"
            onClick={(e) => {
              e.stopPropagation();
              setReturnModalData({ isOpen: true, purchaseId: item._id });
            }}
          >
            <Eye size={14} />
            <span className="text-[10px] font-bold">{t("View Returns")}</span>
          </button>
        )
      },
      { key: "date", header: t("Date"), render: (date) => date ? new Date(date).toLocaleDateString() : '---' },
      {
        key: "details_action",
        header: t("Details"),
        render: (_, item) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewPurchaseId(item._id);
            }}
            className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
            title={t("View Details")}
          >
            <Eye size={16} />
          </button>
        )
      }
    ];
  }, [activeFilter, t, isArabic]);

  const filters = [
    { label: t("All"), path: "/api/admin/purchase", icon: <PackageSearch size={16} /> },
    { label: t("Low Stock"), path: "/api/admin/purchase/low-stock", icon: <AlertTriangle size={16} /> },
    { label: t("Expiring Soon"), path: "/api/admin/purchase/expiring", icon: <Timer size={16} /> },
    { label: t("Expired"), path: "/api/admin/purchase/expired", icon: <Ban size={16} /> },
  ];

  const currentFilter = filters.find(f => f.path === activeFilter);

  const handlePayInstallment = async (installmentId) => {
    if (!selectedAccountId) {
      toast.error(t("Please select a financial account"));
      return;
    }

    try {
      const result = await payInstallment(
        { financial_id: selectedAccountId },
        `/api/admin/purchase/installment/${installmentId}/pay`
      );

      if (result) {
        toast.success(t("Payment successful!"));
        setSelectedPurchase(null);
        setPayingInstallmentId(null);
        setSelectedAccountId("");
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  // استخراج تفاصيل العملية الحالية بالاعتماد على الهيكل المقترح (data.purchase)
  const purchaseDetailData = purchaseDetails?.data?.purchase || purchaseDetails?.purchase || purchaseDetails;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* --- الإحصائيات العلوية الشاملة (Stats) --- */}
      {statsData && statsData.type === 'purchases' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Box size={20} /></div>
              <span className="text-xs font-bold text-gray-400">TOTAL</span>
            </div>
            <h3 className="text-xl font-black">{statsData.total_amount} EGP</h3>
            <p className="text-xs text-gray-500">{statsData.total_purchases} {t("Purchases")}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 border-l-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wallet size={20} /></div>
              <span className="text-xs font-bold text-red-600">PARTIAL</span>
            </div>
            <h3 className="text-xl font-black text-red-700">{statsData.partial_amount} EGP</h3>
            <p className="text-xs text-red-500">{statsData.partial_count} {t("Invoices")}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 border-l-4">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={20} /></div>
              <span className="text-xs font-bold text-green-600">FULL</span>
            </div>
            <h3 className="text-xl font-black text-green-700">{statsData.full_amount} EGP</h3>
            <p className="text-xs text-green-500">{statsData.full_count} {t("Invoices")}</p>
          </div>

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

      {/* إحصائيات المنتجات */}
      {statsData && statsData.type === 'products' && (
        <div className="bg-red-600 p-4 rounded-2xl shadow-lg mb-6 text-white flex items-center gap-4">
          <div className="*:w-6 *:h-6">
            {currentFilter?.icon || <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="font-black">
              {statsData.count} {currentFilter?.label}
            </h3>
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
          title={activeFilter === "/api/admin/purchase" ? t("Purchases") : (currentFilter?.label || t("Purchases"))}
          addButtonText={t("Add")}
          onEdit={(item) => navigate(`edit/${item._id}`)}
          showActions={true}
          onAdd={() => alert("Add new payment method clicked!")}
          addPath="add"
          moduleName={AppModules.PURCHASE}
        />
      )}

      <PurchaseReturnsModal
        purchaseId={returnModalData.purchaseId}
        isOpen={returnModalData.isOpen}
        onClose={() => setReturnModalData({ isOpen: false, purchaseId: null })}
      />

      {/* --- Dialog Modal الخاص بعرض تفاصيل الشراء بالتفصيل بناءً على الـ JSON Response --- */}
      <Dialog open={!!viewPurchaseId} onOpenChange={(open) => !open && setViewPurchaseId(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Receipt className="text-blue-600" size={24} />
              {t("Purchase Order Details")}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {isDetailsLoading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader />
              </div>
            ) : purchaseDetailData ? (
              <>
                {/* المعلومات الأساسية (الرقم المرجعي، المورد، المخزن، التاريخ) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{t("Reference")}</p>
                      <p className="text-sm font-black text-gray-900">{purchaseDetailData.reference || "---"}</p>
                      <p className="text-[10px] text-gray-400">
                        {purchaseDetailData.date ? new Date(purchaseDetailData.date).toLocaleDateString() : '---'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{t("Supplier")}</p>
                      <p className="text-sm font-black text-gray-900">
                        {purchaseDetailData.supplier_id?.company_name || purchaseDetailData.supplier_id?.username || "---"}
                      </p>
                      <p className="text-[10px] text-gray-400">{purchaseDetailData.supplier_id?.phone_number || "---"}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                      <Warehouse size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{t("Warehouse")}</p>
                      <p className="text-sm font-black text-gray-900">
                        {purchaseDetailData.warehouse_id?.name || "---"}
                      </p>
                      <p className="text-[10px] text-gray-400">{purchaseDetailData.warehouse_id?.phone || "---"}</p>
                    </div>
                  </div>
                </div>

                {/* قائمة المنتجات مع دعم الخيارات (Options / Variants) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={16} />
                    {t("Purchased Items")} ({purchaseDetailData.items?.length || 0})
                  </h4>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                        <tr>
                          <th className="p-3">{t("Product")}</th>
                          <th className="p-3 text-center">{t("Unit Cost")}</th>
                          <th className="p-3 text-center">{t("Total Qty")}</th>
                          <th className="p-3 text-right">{t("Subtotal")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {purchaseDetailData.items?.map((item) => (
                          <Fragment key={item._id}>
                            <tr className="hover:bg-gray-50/50">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {item.product_id?.image && (
                                    <img
                                      src={item.product_id.image}
                                      alt={item.product_id?.name}
                                      className="w-9 h-9 rounded-xl object-cover border border-gray-100"
                                    />
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {isArabic
                                        ? item.product_id?.ar_name || item.product_id?.name
                                        : item.product_id?.name || "---"}
                                    </p>
                                    <span className="text-[10px] text-gray-400">{item.item_type || "product"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center font-bold text-gray-600">{item.unit_cost} EGP</td>
                              <td className="p-3 text-center font-black text-gray-800">{item.quantity}</td>
                              <td className="p-3 text-right font-black text-gray-900">{item.subtotal} EGP</td>
                            </tr>

                            {/* عرض تفاصيل الـ Variants / Options إن وجدت */}
                            {item.options && item.options.length > 0 && (
                              <tr className="bg-blue-50/30">
                                <td colSpan={4} className="p-3 pl-8">
                                  <div className="space-y-1.5 border-l-2 border-blue-200 pl-3">
                                    <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                      <Layers size={12} /> {t("Product Variants")}:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                      {item.options.map((opt) => (
                                        <div key={opt._id} className="bg-white p-2 rounded-lg border border-gray-100 flex justify-between items-center shadow-2xs">
                                          <div>
                                            <span className="font-mono text-[10px] text-gray-400">{opt.product_price_id?.code || "No Code"}</span>
                                            <p className="font-bold text-gray-700">{t("Cost")}: {opt.product_price_id?.cost || 0} EGP</p>
                                          </div>
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-md text-[10px]">
                                            {t("Qty")}: {opt.quantity}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* الحسابات والملخص المالي */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <p className="font-bold text-gray-400 uppercase text-[10px] mb-2">{t("Invoice Payments")}</p>
                    {purchaseDetailData.invoices && purchaseDetailData.invoices.length > 0 ? (
                      purchaseDetailData.invoices.map((inv) => (
                        <div key={inv._id} className="flex justify-between items-center p-2 bg-white rounded-xl border border-gray-100">
                          <span className="text-gray-500 text-[11px]">{new Date(inv.date).toLocaleDateString()}</span>
                          <span className="font-black text-green-600">{inv.amount} EGP</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-2">{t("No payments recorded")}</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-900 text-white rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>{t("Subtotal")}:</span>
                        <span className="font-bold text-white">{purchaseDetailData.total || 0} EGP</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{t("Discount")}:</span>
                        <span className="font-bold text-white">{purchaseDetailData.discount || 0} EGP</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{t("Shipping")}:</span>
                        <span className="font-bold text-white">{purchaseDetailData.shipping_cost || 0} EGP</span>
                      </div>
                      <div className="flex justify-between text-gray-400 pt-1 border-t border-gray-800">
                        <span>{t("Payment Status")}:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${purchaseDetailData.payment_status === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {t(purchaseDetailData.payment_status || 'N/A')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-gray-800">
                      <span className="text-xs font-bold text-gray-400">{t("Grand Total")}:</span>
                      <span className="text-2xl font-black text-blue-400">
                        {purchaseDetailData.grand_total || 0} <span className="text-xs font-normal text-gray-400">EGP</span>
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 py-8">{t("No details available")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* المودال التفصيلي للأقساط (Invoices + Due Payments) */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-600 p-4 text-white flex justify-between items-center font-bold">
              <div className="flex items-center gap-2 text-sm"><Receipt size={18} /> {t("Financial Summary")}</div>
              <button onClick={() => setSelectedPurchase(null)}><X size={20} /></button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">{t("Paid History")}</h4>
              {selectedPurchase.invoices?.map((inv, i) => (
                <div key={i} className="flex justify-between p-3 bg-green-50 border border-green-100 rounded-xl mb-2">
                  <span className="text-xs font-bold text-gray-600">{new Date(inv.date).toLocaleDateString()}</span>
                  <span className="text-sm font-black text-green-700">{inv.amount} EGP</span>
                </div>
              ))}

              <h4 className="text-[10px] font-black text-gray-400 uppercase mt-4 mb-3 tracking-widest">
                {t("Future Dues")}
              </h4>

              {selectedPurchase.installments?.map((due, i) => {
                const isThisOne = payingInstallmentId === due._id;
                const isPaid = due.status === "paid";

                return (
                  <div key={i} className={`flex flex-col p-3 border rounded-xl mb-2 gap-3 transition-colors ${isPaid ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600">
                          {new Date(due.date).toLocaleDateString()}
                        </span>
                        <span className={`text-sm font-black ${isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                          {due.amount} EGP
                        </span>
                      </div>

                      {isPaid ? (
                        <span className="px-3 py-1 bg-green-200 text-green-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {t("Paid")}
                        </span>
                      ) : (
                        !isThisOne ? (
                          <button
                            onClick={() => setPayingInstallmentId(due._id)}
                            className="px-4 py-2 bg-orange-600 text-white text-[10px] font-bold rounded-lg hover:bg-orange-700 transition-all flex items-center gap-1"
                          >
                            <CreditCard size={12} />
                            {t("Pay Now")}
                          </button>
                        ) : (
                          <button
                            onClick={() => setPayingInstallmentId(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        )
                      )}
                    </div>

                    {!isPaid && isThisOne && (
                      <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                        <select
                          className="flex-1 border rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                          value={selectedAccountId}
                          onChange={(e) => setSelectedAccountId(e.target.value)}
                        >
                          <option value="">{t("Select Account")}</option>
                          {selection?.financial?.map((fin) => (
                            <option key={fin._id} value={fin._id}>
                              {fin.name}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={isPaying || !selectedAccountId}
                          onClick={() => handlePayInstallment(due._id)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          {isPaying ? "..." : t("Confirm")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setSelectedPurchase(null)} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold">{t("Done")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;