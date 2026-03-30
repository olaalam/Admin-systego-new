import React, { useState } from "react";
import DataTable from "@/components/DataTable";
import { useTranslation } from "react-i18next";
import { DollarSign, X } from "lucide-react";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";

export default function Payable() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    // States للنافذة المنبثقة (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [transactionData, setTransactionData] = useState({
        financial_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0], // تاريخ اليوم كقيمة افتراضية
    });

    // 1. جلب بيانات المدفوعات
    const { data: payablesResponse, isLoading, refetch } = useGet("/api/admin/payable");
    const payablesList = payablesResponse?.rows || [];
    console.log(payablesResponse);

    // 2. جلب بيانات الحسابات البنكية / الخزن للـ Dropdown
    const { data: bankAccountsResponse } = useGet("/api/admin/bank_account");
    const bankAccounts = bankAccountsResponse?.bankAccounts || [];

    // 3. Hook الإرسال (POST) لإضافة معاملة مالية
    // نستخدم دالة عامة ونمرر لها الرابط الديناميكي عند الاستدعاء
    const { postData: addTransaction, isLoading: isSubmitting } = usePost();

    // تعريف أعمدة الجدول
    const columns = [
        { key: "row_no", header: "#" },
        { key: "supplier_name", header: t("Supplier Name"), filterable: true },
        { key: "amount", header: t("Amount") },
        { key: "remaining", header: t("Remaining") },
        { key: "currency", header: t("Currency"), filterable: true },
        {
            key: "due_date",
            header: t("Due Date"),
            render: (val) => new Date(val).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US"),
        },
        {
            key: "status",
            header: t("Status"),
            filterable: true,
            render: (val) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${val === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                >
                    {t(val)}
                </span>
            ),
        },
    ];

    // فتح المودال وتجهيز البيانات
    const handleOpenTransactionModal = (item) => {
        setSelectedInstallment(item);
        setTransactionData({
            financial_id: "",
            amount: item.remaining, // نضع القيمة المتبقية كقيمة افتراضية
            date: new Date().toISOString().split("T")[0],
        });
        setIsModalOpen(true);
    };

    // إرسال الطلب
    const handleSubmitTransaction = async (e) => {
        e.preventDefault();
        if (!transactionData.financial_id) {
            toast.error(t("Please select a financial account"));
            return;
        }

        // تجهيز البيانات (Body)
        const body = {
            financial_id: transactionData.financial_id,
            amount: Number(transactionData.amount),
            date: transactionData.date,
        };

        // تجهيز الرابط (Custom URL)
        const url = `/api/admin/payable/installment/${selectedInstallment.installment_id}/transaction`;

        try {
            // استدعاء الدالة حسب ترتيب البارامترات في usePost.js
            const result = await addTransaction(body, url);

            // الـ Hook داخلياً يعالج Success Toast ويرجع res.data لو نجح
            if (result) {
                setIsModalOpen(false);
                refetch(); // تحديث الجدول
            }
        } catch (err) {
            // الـ Hook داخلياً يعالج Error Toast، لكن لو أردت عمل شيء إضافي عند الخطأ:
            console.error("Transaction Error:", err);
        }
    };

    return (
        <div className="p-6">
            <DataTable
                title={t("Payables")}
                data={payablesList}
                columns={columns}
                searchable={true}
                filterable={true}
                showActions={true}
                moduleName="payable" // للتحكم في الصلاحيات إن وجدت داخل الـ DataTable
                // إضافة زر الدفع في خانة الـ Actions
                extraActions={(item) =>
                    item.can_add_transaction ? (
                        <button
                            onClick={() => handleOpenTransactionModal(item)}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                            title={t("Add Transaction")}
                        >
                            <DollarSign size={16} />
                        </button>
                    ) : null
                }
            />

            {/* النافذة المنبثقة (Modal) لإضافة الدفعة */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            {t("Add Transaction")}
                        </h3>

                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                            <p><strong>{t("Supplier")}:</strong> {selectedInstallment?.supplier_name}</p>
                            <p><strong>{t("Remaining Amount")}:</strong> {selectedInstallment?.remaining} {selectedInstallment?.currency}</p>
                        </div>

                        <form onSubmit={handleSubmitTransaction} className="space-y-4">
                            {/* اختيار الحساب البنكي / الخزنة */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("Financial Account")} *
                                </label>
                                <select
                                    required
                                    value={transactionData.financial_id}
                                    onChange={(e) =>
                                        setTransactionData({ ...transactionData, financial_id: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    <option value="">{t("Select Account")}</option>
                                    {bankAccounts.map((acc) => (
                                        <option key={acc._id || acc.id} value={acc._id || acc.id}>
                                            {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* المبلغ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("Amount")} *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedInstallment?.remaining}
                                    value={transactionData.amount}
                                    onChange={(e) =>
                                        setTransactionData({ ...transactionData, amount: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            {/* التاريخ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("Date")} *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={transactionData.date}
                                    onChange={(e) =>
                                        setTransactionData({ ...transactionData, date: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? t("Processing...") : t("Confirm Payment")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}