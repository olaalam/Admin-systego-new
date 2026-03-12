import React, { useState, useMemo } from 'react';
import useGet from '@/hooks/useGet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Package, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductMovementReport() {
    const { t } = useTranslation();

    // 1. إدارة حالات الفلاتر
    const [selectedProduct, setSelectedProduct] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State للاحتفاظ برابط التقرير
    const [reportUrl, setReportUrl] = useState(null);

    // 2. استخدام الـ Hook لجلب قائمة المنتجات
    const { data: selectionData, loading: loadingProducts } = useGet("/api/admin/product-movement/selection");
    const productsList = selectionData?.products || [];

    // 3. استخدام الـ Hook لجلب بيانات التقرير
    const { data: reportData, loading: loadingReport } = useGet(reportUrl);

    // دالة زر البحث
    const handleGenerateReport = () => {
        if (!selectedProduct || !startDate || !endDate) {
            alert(t("Please select product and dates"));
            return;
        }

        const queryUrl = `/api/admin/product-movement?product_id=${selectedProduct}&start_date=${startDate}&end_date=${endDate}`;
        setReportUrl(queryUrl);
    };

    // 4. تجهيز الداتا للجدول (تفكيك المبيعات والمشتريات لكل يوم لتُعرض في أسطر منفصلة)
    const displayMovements = useMemo(() => {
        if (!reportData?.movements) return [];

        const flatList = [];
        reportData.movements.forEach((day) => {
            // إضافة سطر المشتريات إذا كانت الكمية أكبر من 0
            if (day.purchases && day.purchases.quantity > 0) {
                flatList.push({
                    id: `${day.date}-purchase`,
                    date: day.date,
                    type: 'purchase',
                    qty: day.purchases.quantity,
                    price: day.purchases.unit_cost, // لاحظي أن الرد يستخدم unit_cost هنا
                    total: day.purchases.total
                });
            }
            // إضافة سطر المبيعات إذا كانت الكمية أكبر من 0
            if (day.sales && day.sales.quantity > 0) {
                flatList.push({
                    id: `${day.date}-sale`,
                    date: day.date,
                    type: 'sale',
                    qty: day.sales.quantity,
                    price: day.sales.price, // الرد يستخدم price هنا
                    total: day.sales.total
                });
            }
        });

        return flatList;
    }, [reportData]);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

            {/* الفلاتر (Filters) */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">{t("Select Product")}</label>
                        <Select onValueChange={setSelectedProduct} value={selectedProduct} disabled={loadingProducts}>
                            <SelectTrigger className="w-full h-auto min-h-[40px] whitespace-normal text-right py-2">
                                <SelectValue placeholder={loadingProducts ? t("Loading products...") : t("Select product...")} />
                            </SelectTrigger>
                            <SelectContent>
                                {productsList.map((product) => (
                                    <SelectItem key={product._id} value={product._id} className="h-auto whitespace-normal py-3 break-words">
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("Start Date")}</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("End Date")}</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleGenerateReport}
                        disabled={loadingReport || !selectedProduct}
                        className="flex items-center gap-2"
                    >
                        {loadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {t("Generate Report")}
                    </Button>
                </CardContent>
            </Card>

            {/* عرض بيانات التقرير */}
            {reportData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl border shadow-sm gap-4">
                        <div className="flex items-center gap-4">
                            <img src={reportData.product?.image} alt={reportData.product?.name} className="w-16 h-16 rounded-lg object-cover border" />
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">{reportData.product?.name}</h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-4 h-4" /> {t("Current Stock")}: {reportData.product?.quantity || 0} {t("pieces")}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span>{t("Code")}: {reportData.product?.code}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right md:text-left bg-slate-50 p-3 rounded-lg border">
                            <p className="text-sm font-medium text-slate-700">{t("Report Period")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {reportData.period?.start_date} <span className="mx-1">-</span> {reportData.period?.end_date}
                            </p>
                        </div>
                    </div>

                    {/* الكروت الإجمالية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-green-200 bg-green-50/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-green-700">{t("Total Purchases")}</CardTitle>
                                <ArrowDownCircle className="text-green-600 w-5 h-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-green-800">
                                    {reportData.summary?.total_purchases?.amount?.toLocaleString() || 0} {t("EGP")}
                                </div>
                                <p className="text-sm text-green-600 font-medium mt-1">
                                    {t("Amount Received")}: {reportData.summary?.total_purchases?.quantity || 0} {t("pieces")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-red-700">{t("Total Sales")}</CardTitle>
                                <ArrowUpCircle className="text-red-600 w-5 h-5" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-red-800">
                                    {reportData.summary?.total_sales?.amount?.toLocaleString() || 0} {t("EGP")}
                                </div>
                                <p className="text-sm text-red-600 font-medium mt-1">
                                    {t("Amount Sold")}: {reportData.summary?.total_sales?.quantity || 0} {t("pieces")}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* جدول تفاصيل الحركات */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg text-slate-800">{t("Daily Movement Details")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-right py-4 px-4">{t("Date")}</TableHead>
                                        <TableHead className="text-right py-4 px-4">{t("Movement Type")}</TableHead>
                                        <TableHead className="text-center py-4 px-4">{t("Quantity")}</TableHead>
                                        <TableHead className="text-center py-4 px-4">{t("Unit Price")}</TableHead>
                                        <TableHead className="text-left py-4 px-4">{t("Total")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayMovements.length > 0 ? (
                                        displayMovements.map((move) => (
                                            <TableRow key={move.id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium px-4">{move.date}</TableCell>
                                                <TableCell className="px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-medium px-3 py-1 ${move.type === 'purchase'
                                                            ? 'border-green-300 bg-green-50 text-green-700'
                                                            : 'border-red-300 bg-red-50 text-red-700'
                                                            }`}
                                                    >
                                                        {move.type === 'purchase' ? t('Purchase') : t('Sale')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-bold px-4">{move.qty}</TableCell>
                                                <TableCell className="text-center font-mono text-slate-600 px-4">
                                                    {move.price?.toLocaleString()} {t("EGP")}
                                                </TableCell>
                                                <TableCell className="text-left font-black text-slate-800 px-4">
                                                    {move.total?.toLocaleString()} {t("EGP")}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground bg-slate-50">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <Package className="w-8 h-8 text-slate-300" />
                                                    <p className="font-medium text-slate-500">{t("No movements found")}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}