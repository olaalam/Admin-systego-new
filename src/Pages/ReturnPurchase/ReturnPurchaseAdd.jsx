import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import usePost from "@/hooks/usePost"; 
import AddPage from "@/components/AddPage";

export default function ReturnPurchaseAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // هذا هو الـ Reference

  const { postData, loading } = usePost();
  
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. جلب بيانات الفاتورة فور دخول الصفحة باستخدام الـ Reference (id)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoading(true);
      // مناداة رابط الـ create-return لجلب تفاصيل الفاتورة بناءً على المرجع
      const res = await postData({ reference: id }, "api/admin/return-purchase/create-return");
      
      // بناءً على الـ JSON اللي بعتيه: الداتا موجودة داخل res.data.data
      if (res?.success && res?.data?.data) {
        const actualData = res.data.data;
        setPurchaseData(actualData);
        
        // التحقق من وجود المصفوفة داخل items
        if (actualData.items && Array.isArray(actualData.items)) {
            const initialItems = actualData.items.map(item => ({
                ...item,
                return_quantity: 0 // نبدأ الكمية بـ 0
            }));
            setReturnItems(initialItems);
        }
      } else {
          // إذا لم يجد بيانات أو حدث خطأ
          toast.error(t("Invoice not found"));
          navigate("/purchase-return");
      }
      setIsInitialLoading(false);
    };

    if (id) fetchInitialData();
  }, [id]);

  // 2. دالة الحفظ النهائي (Store)
  const handleFinalSubmit = async (formData) => {
    // تصفية العناصر التي تم إدخال كمية لها
    const selectedItems = returnItems.filter(item => item.return_quantity > 0);

    if (selectedItems.length === 0) {
        toast.error(t("Please enter quantity to return"));
        return;
    }

    // تجهيز الـ Payload حسب طلبك
    const payload = {
        purchase_id: purchaseData?.purchase?._id, // من بيانات الفاتورة التي جلبناها
        items: selectedItems.map(item => ({
            product_id: item.product?._id,
            product_price_id: item.options?.[0]?.purchase_item_id || null, // مثال للـ Variation
            quantity: item.return_quantity
        })),
        reason: formData.reason || "Defective items", // نأخذها من الفورم
        note: formData.note,
        date: formData.date,
        // refund_account_id: formData.refund_account_id, // أضيفيه إذا كان موجود في AddPage
    };

    const res = await postData(payload, "api/admin/return-purchase/store");
    if (res?.success) {
        navigate("/purchase-return");
    }
  };

  // تعريف الحقول لـ AddPage
  const formFields = [
    { key: "date", label: t("Date"), type: "date", required: true },
    { key: "reason", label: t("Return Reason"), type: "text", placeholder: t("e.g. Damaged goods") },
    { key: "note", label: t("Note"), type: "textarea" },
  ];

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="text-gray-500">{t("Fetching Invoice Data...")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b">
            <CardTitle>{t("Return Purchase Items")} - Ref: {id}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            {/* معلومات المورد والمخزن */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                    <p className="text-gray-500">{t("Supplier")}</p>
                    <p className="font-bold text-lg">{purchaseData?.purchase?.supplier?.company_name || purchaseData?.purchase?.supplier?.username}</p>
                    <p>{purchaseData?.purchase?.supplier?.email}</p>
                </div>
                <div className="md:text-right">
                    <p className="text-gray-500">{t("Warehouse")}</p>
                    <p className="font-bold text-lg">{purchaseData?.purchase?.warehouse?.name}</p>
                    <p>{t("Total Invoice")}: {purchaseData?.purchase?.grand_total} EGP</p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100">
                    <TableHead className="text-center w-12">#</TableHead>
                    <TableHead>{t("Product Name")}</TableHead>
                    <TableHead className="text-center">{t("Unit Price")}</TableHead>
                    <TableHead className="text-center">{t("Available Qty")}</TableHead>
                    <TableHead className="text-center w-[150px]">{t("Return Qty")}</TableHead>
                    <TableHead className="text-center">{t("Subtotal")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {returnItems.map((item, idx) => (
                    <TableRow key={item._id || idx}>
                        <TableCell className="text-center">{idx + 1}</TableCell>
                        <TableCell>
                            <div className="font-medium">{item.product?.name}</div>
                            <div className="text-xs text-gray-400">{item.product?.code}</div>
                        </TableCell>
                        <TableCell className="text-center">{item.price} EGP</TableCell>
                        <TableCell className="text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.available_to_return}
                            </span>
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="number" 
                                className="h-9 text-center border-purple-200 focus:border-purple-500"
                                value={item.return_quantity} 
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const max = item.available_to_return;
                                    const updated = [...returnItems];
                                    updated[idx] = {
                                        ...updated[idx],
                                        return_quantity: Math.max(0, Math.min(val, max))
                                    };
                                    setReturnItems(updated);
                                }} 
                            />
                        </TableCell>
                        <TableCell className="text-center font-bold text-purple-600">
                            {(item.return_quantity * item.price).toFixed(2)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <AddPage 
        title={t("Return Details")}
        description={t("Please provide the reason and date for this return")}
        fields={formFields}
        onSubmit={handleFinalSubmit}
        onCancel={() => navigate("/purchase-return")}
        loading={loading}
        submitButtonText={t("Create Return")}
        initialData={{ 
            date: new Date().toISOString().split('T')[0],
            reason: "Defective items" 
        }}
      />
    </div>
  );
}