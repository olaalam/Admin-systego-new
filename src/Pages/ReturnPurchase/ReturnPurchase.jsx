import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DataTable from "@/components/DataTable"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost"; // ✅ 1. تم استدعاء usePost

export default function PurchaseReturnList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reference, setReference] = useState("");

  // جلب قائمة المرتجعات للعرض في الجدول
  const { data, loading: getLoading } = useGet("api/admin/return-purchase/all-returns");
  
  // ✅ 2. استخدام usePost للتحقق من الفاتورة قبل الانتقال
  const { postData, loading: postLoading } = usePost();

  const columns = [
    { 
      header: t("Date"), 
      key: "date",
      render: (val) => new Date(val).toLocaleDateString()
    },
    { header: t("Reference"), key: "reference" },
    { header: t("Purchase Reference"), key: "purchase_reference" },
    { header: t("Supplier"), key: "supplier_name" }, 
    { header: t("Total Amount"), key: "total_amount" },
    { 
        header: t("Payment Status"), 
        key: "payment_status",
        render: (val) => (
          <span className={`px-2 py-1 rounded text-xs ${
            val === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {val}
          </span>
        )
    },
  ];

  // ✅ 3. دالة التعامل مع الزر Submit المعدلة
  const handleGoToCreate = async (e) => {
    e.preventDefault();
    if (!reference) return;

    // إرسال Reference للباك إند للتحقق (تأكد من الرابط الصحيح في الباك إند)
    // نرسل { reference: reference }
    const response = await postData(
      { reference: reference }, 
      "api/admin/return-purchase/purchase-for-return" 
    );

    // إذا عاد الباك إند بنجاح (success: true) ننتقل للصفحة
    if (response?.success) {
        setIsModalOpen(false);
        navigate(`/purchase-return/add/${reference}`);
    }
    // ملاحظة: لو فشل، usePost سيظهر رسالة الخطأ تلقائياً ولن يتم تنفيذ الكود أعلاه
  };

  return (
    <div className="p-6">
      <DataTable
        title={t("Purchase Return List")}
        data={data?.returns || []} 
        columns={columns}
        addButtonText={t("Add Return")}
        onAdd={() => setIsModalOpen(true)}
        searchable={true}
        loading={getLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add Purchase Return")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGoToCreate} className="space-y-4">
            <p className="text-sm text-gray-500 italic">
              {t("The field labels marked with * are required input fields.")}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Purchase Reference *")}</label>
              <Input 
                value={reference} 
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 01158665" 
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-purple-600 w-full text-white"
                disabled={postLoading} // تعطيل الزر أثناء التحميل
              >
                {postLoading ? t("Checking...") : t("Submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}