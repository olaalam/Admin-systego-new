import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Calendar,
    FileText,
    TrendingUp,
    ShoppingBag,
    Filter,
    ArrowUpRight,
    Package,
    ArrowRightLeft,
    Layers,
    Eye
} from "lucide-react";
import usePost from "@/hooks/usePost";
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

const ProductReports = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";

    // Default dates (today)
    const today = new Date().toISOString().split('T')[0];
    const [filters, setFilters] = useState({
        start_date: today,
        end_date: today,
        category_id: null,
        product_id: null,
        warehouse_id: null,
        cashier_id: null
    });

    // Fetch selection data
    const { data: selectionData } = useGet("/api/admin/product-report/selection");
    const { postData, loading } = usePost("/api/admin/product-report");
    const [reportData, setReportData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReport = async () => {
        // Prepare request body, convert nulls to undefined or handle as API expects
        const body = {
            ...filters,
            category_id: filters.category_id || null,
            product_id: filters.product_id || null,
            warehouse_id: filters.warehouse_id || null,
            cashier_id: filters.cashier_id || null
        };
        const res = await postData(body);
        if (res?.success) {
            setReportData(res.data);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const columns = useMemo(() => [
        {
            key: "rank",
            header: t("Rank"),
            render: (val) => <span className="font-bold text-gray-500">#{val}</span>
        },
        {
            key: "product_name",
            header: t("Product"),
            render: (_, item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 line-clamp-1 max-w-[250px]">
                            {isArabic ? item.product_ar_name || item.product_name : item.product_name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.product_code || "—"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "category",
            header: t("Category"),
            render: (val) => (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                    {isArabic ? val?.ar_name || val?.name : val?.name}
                </span>
            )
        },
        {
            key: "count",
            header: t("Count"),
            render: (val) => <span className="font-bold text-gray-900">{val?.toLocaleString()}</span>
        },
        {
            key: "total_price",
            header: t("Total Price"),
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <span className="font-black text-emerald-600">{val?.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold">EGP</span>
                </div>
            )
        },
        {
            key: "orders_count",
            header: t("Orders Count"),
            render: (val) => <span className="text-sm text-gray-600 font-semibold">{val}</span>
        },
        {
            key: "avg_price",
            header: t("Avg Price"),
            render: (val) => (
                <span className="text-xs text-gray-500 font-medium italic">
                    {val?.toLocaleString()} <span className="text-[8px]">EGP</span>
                </span>
            )
        },
        {
            key: "actions",
            header: t("dataTable.actions"),
            render: (_, item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(item)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                    <Eye size={16} />
                </Button>
            )
        }
    ], [t, isArabic]);

    const summary = reportData?.summary || {};

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header & Filters */}
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Layers className="text-blue-600" size={32} />
                            {t("Product Reports")}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{t("Analyze product sales performance and trends")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                            <Calendar size={16} className="text-gray-400" />
                            <Input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                            <Calendar size={16} className="text-gray-400" />
                            <Input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                                className="border-none focus-visible:ring-0 shadow-none w-36 text-sm p-0 h-8"
                            />
                        </div>

                        {/* Selections */}
                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none px-2 py-1"
                            value={filters.warehouse_id || ""}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                warehouse_id: e.target.value,
                                cashier_id: null // Reset cashier when warehouse changes
                            }))}
                        >
                            <option value="">{t("All Warehouses")}</option>
                            {selectionData?.warehouses?.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>

                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none px-2 py-1"
                            value={filters.cashier_id || ""}
                            onChange={(e) => setFilters(prev => ({ ...prev, cashier_id: e.target.value }))}
                        >
                            <option value="">{t("All Cashiers")}</option>
                            {selectionData?.cashier
                                ?.filter(c => !filters.warehouse_id || c.warehouse_id === filters.warehouse_id)
                                .map(c => (
                                    <option key={c._id} value={c._id}>{isArabic ? c.ar_name || c.name : c.name}</option>
                                ))
                            }
                        </select>

                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none px-2 py-1"
                            value={filters.category_id || ""}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                category_id: e.target.value,
                                product_id: null // Reset product when category changes
                            }))}
                        >
                            <option value="">{t("All Categories")}</option>
                            {selectionData?.categories?.map(c => (
                                <option key={c._id} value={c._id}>{isArabic ? c.ar_name || c.name : c.name}</option>
                            ))}
                        </select>

                        <select
                            className="bg-transparent text-sm font-medium focus:outline-none px-2 py-1 max-w-[150px]"
                            value={filters.product_id || ""}
                            onChange={(e) => setFilters(prev => ({ ...prev, product_id: e.target.value }))}
                        >
                            <option value="">{t("All Products")}</option>
                            {selectionData?.products
                                ?.filter(p => !filters.category_id || p.categoryId?.includes(filters.category_id))
                                .map(p => (
                                    <option key={p._id} value={p._id}>{isArabic ? p.ar_name || p.name : p.name}</option>
                                ))
                            }
                        </select>

                        <Button
                            onClick={fetchReport}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-9"
                        >
                            <Filter size={16} className="mr-2" />
                            {t("Filter")}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 tracking-tight">
                    <SummaryCard
                        title={t("Total Products")}
                        value={summary.total_products}
                        icon={<Package size={24} />}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                        isNumber={true}
                    />
                    <SummaryCard
                        title={t("Total Count")}
                        value={summary.total_count}
                        icon={<ArrowRightLeft size={24} />}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                        isNumber={true}
                    />
                    <SummaryCard
                        title={t("Total Revenue")}
                        value={summary.total_revenue}
                        icon={<TrendingUp size={24} />}
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                        suffix="EGP"
                    />
                </div>

                {/* Table Section */}
                <div className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {loading && !reportData ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader />
                        </div>
                    ) : (
                        <DataTable
                            data={reportData?.products || []}
                            columns={columns}
                            title={t("Product Performance")}
                            showActions={false}
                            searchable={true}
                            moduleName={AppModules.PRODUCT_REPORT}
                            onRowClick={handleViewDetails}
                        />
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <Package className="text-blue-600" />
                            {t("Product Details")}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        {selectedProduct && (
                            <div className="grid grid-cols-1 gap-4 py-4">
                                {/* Product Identity */}
                                <div className="space-y-6">
                                    {/* <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center"> */}
                                    {/* {selectedProduct.product_image ? (
                                            <img
                                                src={selectedProduct.product_image}
                                                alt={selectedProduct.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package size={80} className="text-gray-200" />
                                        )} */}

                                    {/* </div> */}

                                    <DetailSection title="Rank" >
                                        <DetailItem label={`#${selectedProduct.rank}`} />
                                    </DetailSection>

                                    <DetailSection title={t("Basic Information")}>
                                        <DetailItem label={t("Product")} value={isArabic ? selectedProduct.product_ar_name : selectedProduct.product_name} isBold />
                                        <DetailItem label={t("Product Code")} value={selectedProduct.product_code || "—"} />
                                        <DetailItem label={t("Category")} value={isArabic ? selectedProduct.category?.ar_name : selectedProduct.category?.name} />
                                    </DetailSection>
                                </div>

                                {/* Performance Stats */}
                                <div className="space-y-6">
                                    <DetailSection title={t("Product Performance Summary")} highlight>
                                        <DetailItem
                                            label={t("Count")}
                                            value={selectedProduct.count?.toLocaleString()}
                                            isBold
                                            large
                                        />
                                        <DetailItem
                                            label={t("Total Price")}
                                            value={`${(selectedProduct.total_price || 0).toLocaleString()} EGP`}
                                            color="text-emerald-600"
                                            isBold
                                        />
                                        <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
                                            <DetailItem label={t("Orders Count")} value={selectedProduct.orders_count} />
                                            <DetailItem label={t("Avg Price")} value={`${(selectedProduct.avg_price || 0).toLocaleString()} EGP`} />
                                        </div>
                                    </DetailSection>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const DetailSection = ({ title, children, highlight = false }) => (
    <div className={`p-5 rounded-3xl ${highlight ? 'bg-blue-50/50 border border-blue-100' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            {title}
        </h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, isBold = false, large = false, color = "text-gray-900" }) => (
    <div className="flex justify-between items-center gap-4">
        <span className="text-xs text-gray-400 font-bold uppercase">{label}</span>
        <span className={`${large ? 'text-lg' : 'text-sm'} ${isBold ? 'font-black' : 'font-medium'} ${color} text-right`}>
            {value}
        </span>
    </div>
);

const SummaryCard = ({ title, value, icon, color, bgColor, suffix = "", isNumber = false }) => {
    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${bgColor} ${color}`}>
                        {icon}
                    </div>
                    <ArrowUpRight size={20} className="text-gray-300" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-2xl font-black text-gray-900">
                            {isNumber ? value || 0 : (value || 0).toLocaleString()}
                        </h3>
                        {suffix && <span className="text-[10px] font-bold text-gray-400 uppercase">{suffix}</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductReports;
