import React from "react";
import DataTable from "@/components/DataTable";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";

export default function Recevible() {
    const { t } = useTranslation();

    // 1. جلب بيانات المدفوعات (العملاء)
    const { data: payablesResponse, isLoading, refetch } = useGet("/api/admin/receivable");

    // استخراج مصفوفة البيانات بشكل صحيح بناءً على هيكل الـ Response
    const payablesList = payablesResponse?.rows || [];

    // تعريف أعمدة الجدول
    const columns = [
        {
            key: "client",
            header: t("Customer Name"),
            filterable: true
        },
        {
            key: "phone",
            header: t("Phone Number"),
            filterable: true
        },
        {
            key: "type",
            header: t("Type"), // ستعرض كلمة "Customer"
            filterable: true
        },
        {
            key: "total_amount",
            header: t("Total Amount")
        },
        {
            key: "paid",
            header: t("Paid Amount")
        },
        {
            key: "remaining",
            header: t("Remaining")
        },
        {
            key: "status",
            header: t("Status"),
            filterable: true,
            render: (val) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${val === "paid"
                        ? "bg-green-100 text-green-700"
                        : val === "later"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {t(val)}
                </span>
            ),
        },
    ];

    return (
        <div className="p-6">
            <DataTable
                title={t("Receivables")}
                data={payablesList}
                columns={columns}
                searchable={true}
                filterable={true}
                showActions={true}
                moduleName="recevible"
                isLoading={isLoading} // تمرير حالة التحميل للجدول إن كان يدعمها
            />
        </div>
    );
}