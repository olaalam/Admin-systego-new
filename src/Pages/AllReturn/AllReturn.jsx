import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Filter,
  Package,
  RotateCcw,
  Eye,
  Warehouse,
  User,
  Receipt,
  CreditCard,
  Hash,
} from "lucide-react";
import useGet from "@/hooks/useGet";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AppModules } from "@/config/modules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



const AllReturn = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Default dates (today)
  const today = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState({
    start_date: today,
    end_date: today,
    category_id: null,
    product_id: null,
    warehouse_id: null,
    cashier_id: null,
  });

  const { data: responseData, loading, refetch } = useGet(
    "/api/admin/return-sale/all-returns",
    {
      params: {
        startDate: filters.start_date,
        endDate: filters.end_date,
        category_id: filters.category_id || null,
        product_id: filters.product_id || null,
        warehouse_id: filters.warehouse_id || null,
        cashier_id: filters.cashier_id || null,
      },
    }
  );

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract nested API Data
  const reportData = responseData|| {};

  
  const returnsList = reportData?.returns || [];
  const summary = reportData?.summary || {};

  const fetchReport = () => {
    const params = {
      startDate: filters.start_date,
      endDate: filters.end_date,
      category_id: filters.category_id || null,
      product_id: filters.product_id || null,
      warehouse_id: filters.warehouse_id || null,
      cashier_id: filters.cashier_id || null,
    };
    refetch({ params });
  };

  const handleViewDetails = (item) => {
    setSelectedReturn(item);
    setIsModalOpen(true);
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

  const formatCurrency = (val) => {
    return (Number(val) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columns = useMemo(
    () => [
      {
        key: "reference",
        header: t("Return Ref"),
        render: (val, item) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">
              {val || "—"}
            </span>
            {item.sale_reference && (
              <span className="text-[10px] text-gray-400 mt-1">
                {t("Sale Ref")}: <span className="font-mono text-gray-600">{item.sale_reference}</span>
              </span>
            )}
          </div>
        ),
      },
      {
        key: "items",
        header: t("Returned Products"),
        render: (val) => {
          const firstItem = val?.[0];
          const product = firstItem?.product_id;
          const totalQty = val?.reduce((acc, curr) => acc + (curr.returned_quantity || 0), 0) || 0;

          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                {product?.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={18} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 line-clamp-1 text-xs">
                  {isArabic ? product?.ar_name || product?.name : product?.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {t("Qty")}: <span className="font-bold text-gray-700">{totalQty}</span>
                  {val?.length > 1 && ` (+${val.length - 1} ${t("more items")})`}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "warehouse_id",
        header: t("Warehouse"),
        render: (val) => (
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
            {val?.name || "—"}
          </span>
        ),
      },
      {
        key: "total_amount",
        header: t("Total Amount"),
        render: (val) => (
          <div className="flex items-center gap-1">
            <span className="font-black text-rose-600">{formatCurrency(val)}</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase">EGP</span>
          </div>
        ),
      },
      {
        key: "refund_method",
        header: t("Refund Method"),
        render: (val) => (
          <span className="text-xs font-bold text-gray-700 capitalize bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
            {val ? val.replace("_", " ") : "—"}
          </span>
        ),
      },
      {
        key: "date",
        header: t("Date"),
        render: (val) => (
          <span className="text-gray-500 font-medium text-xs">
            {formatDate(val)}
          </span>
        ),
      },

    ],
    [t, isArabic]
  );



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header & Filters */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <RotateCcw className="text-amber-600" size={32} />
              {t("Sales Returns Report")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {t("Track and analyze all product sales returns and refunds")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-2 border-r border-gray-100">
              <Calendar size={16} className="text-gray-400" />
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, start_date: e.target.value }))
                }
                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
              />
            </div>
            <div className="flex items-center gap-2 px-2 border-r border-gray-100">
              <Calendar size={16} className="text-gray-400" />
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, end_date: e.target.value }))
                }
                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
              />
            </div>

            <Button
              onClick={fetchReport}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 h-9"
            >
              <Filter size={16} className="mr-2" />
              {t("Filter")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 tracking-tight">
          <SummaryCard
            title={t("Total Returns Count")}
            value={summary.total_returns}
            icon={<RotateCcw size={24} />}
            color="text-amber-600"
            bgColor="bg-amber-50"
            isNumber={true}
          />
          <SummaryCard
            title={t("Total Refunded Amount")}
            value={summary.total_amount}
            icon={<CreditCard size={24} />}
            color="text-rose-600"
            bgColor="bg-rose-50"
            suffix="EGP"
          />
        </div>

        {/* Table Section */}
        <div className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          {loading && !responseData ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <DataTable
              data={returnsList}
              columns={columns}
              title={t("All Sales Returns")}
              showActions={false}
              searchable={true}
              moduleName={AppModules.PRODUCT_REPORT}
              onRowClick={handleViewDetails}

            />
          )}
        </div>
      </div>

      {/* Return Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <RotateCcw className="text-amber-600" />
              {t("Return Invoice Details")}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {selectedReturn && (
              <>
                {/* Header Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailSection title={t("Return Info")}>
                    <DetailItem label={t("Return Ref")} value={selectedReturn.reference} isBold />
                    <DetailItem label={t("Original Sale Ref")} value={selectedReturn.sale_reference || "—"} />
                    <DetailItem label={t("Refund Method")} value={selectedReturn.refund_method?.replace("_", " ")} />
                    <DetailItem label={t("Date")} value={formatDate(selectedReturn.date)} />
                  </DetailSection>

                  <DetailSection title={t("Location & Admin")}>
                    <DetailItem label={t("Warehouse")} value={selectedReturn.warehouse_id?.name || "—"} isBold />
                    <DetailItem label={t("POS Cashier")} value={selectedReturn.shift_id?.cashier_id?.name || "—"} />
                    <DetailItem label={t("Admin Manager")} value={selectedReturn.shift_id?.cashierman_id?.username || "—"} />
                  </DetailSection>
                </div>

                {/* Returned Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    {t("Returned Products")} ({selectedReturn.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedReturn.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                            {item.product_id?.image ? (
                              <img
                                src={item.product_id.image}
                                alt={item.product_id.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              {isArabic ? item.product_id?.ar_name || item.product_id?.name : item.product_id?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {t("Price")}: {formatCurrency(item.price)} EGP
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-sm text-gray-900">
                            x{item.returned_quantity}
                          </p>
                          <p className="text-xs font-black text-rose-600">
                            {formatCurrency(item.subtotal)} EGP
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Amount Footer */}
                <div className="p-4 bg-gray-900 text-white rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-bold">{t("Total Returned Amount")}</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatCurrency(selectedReturn.total_amount)} <span className="text-xs font-normal text-gray-400">EGP</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailSection = ({ title, children }) => (
  <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2.5">
    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
      <div className="w-1 h-3 bg-amber-500 rounded-full" />
      {title}
    </h4>
    {children}
  </div>
);

const DetailItem = ({ label, value, isBold = false, color = "text-gray-900" }) => (
  <div className="flex justify-between items-center gap-2 text-xs">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className={`${isBold ? "font-black" : "font-semibold"} ${color} text-right capitalize`}>
      {value}
    </span>
  </div>
);

const SummaryCard = ({ title, value, icon, color, bgColor, suffix = "", isNumber = false }) => {
  return (
    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>{icon}</div>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-gray-900">
              {isNumber ? value || 0 : (value || 0).toLocaleString()}
            </h3>
            {suffix && <span className="text-xs font-bold text-gray-400 uppercase">{suffix}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllReturn;