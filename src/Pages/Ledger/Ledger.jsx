import React from "react";
import DataTable from "@/components/DataTable";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";

export default function Ledger() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    // 1. جلب بيانات دفتر الأستاذ (Ledger)
    const { data: response, isLoading } = useGet("/api/admin/ledger");

    // استخراج المصفوفة بناءً على الهيكل الجديد: response.data.data.ledgers
    const ledgerList = response?.data?.ledgers || [];

    // تعريف أعمدة الجدول
    const columns = [
        {
            key: "date",
            header: t("Date"),
            render: (val) => new Date(val).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
            filterable: true
        },
        {
            key: "transactionType",
            header: t("Transaction Type"),
            filterable: true,
            render: (val) => (
                <span className="font-semibold">{t(val)}</span>
            )
        },
        {
            key: "actionType",
            header: t("Action Type"),
            filterable: true,
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs ${val === "credit" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                    {t(val)}
                </span>
            )
        },
        {
            key: "amount",
            header: t("Amount"),
            render: (val) => val?.toLocaleString() || 0
        },
        {
            key: "reference",
            header: t("Reference"),
            filterable: true
        },

    ];

    return (
        <div className="p-6">
            <DataTable
                title={t("Ledger")}
                data={ledgerList}
                columns={columns}
                searchable={true}
                filterable={true}
                showActions={true}
                moduleName="ledger"
                isLoading={isLoading}
            />
        </div>
    );
}