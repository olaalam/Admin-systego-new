import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export default function ReturnPurchaseAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: reference_no } = useParams(); // الـ Reference الممرر في الرابط

  const { postData, loading: postLoading } = usePost();
  
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // حقول الفورم بناءً على الصور والـ Payload المطلوب
  const [formData, setFormData] = useState({
    refund_account_id: "", // سيتم إدخاله كـ Input نصي كما طلبتِ
    reason: "Defective items",
    note: "",
    image: ""
  });

  // 1. جلب بيانات الفاتورة الأصلية عند تحميل الصفحة
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoading(true);
      // استخدام api/admin/return-purchase/purchase-for-return لجلب بيانات الفاتورة
      const res = await postData({ reference: reference_no }, "api/admin/return-purchase/purchase-for-return");
      
      if (res?.success && res?.data) {
        setPurchaseData(res.data);
        
        if (res.data.items) {
            const initialItems = res.data.items.map(item => ({
                ...item,
                return_quantity: 0, // القيمة الافتراضية 0 كما في الصورة
                isSelected: false
            }));
            setReturnItems(initialItems);
        }
      } else {
          toast.error(t("Purchase not found"));
          navigate("/purchase-return");
      }
      setIsInitialLoading(false);
    };

    if (reference_no) fetchInitialData();
  }, [reference_no]);

  // حساب الإجمالي للمنتجات المختارة
  const calculateGrandTotal = () => {
    return returnItems
      .filter(item => item.isSelected)
      .reduce((acc, item) => acc + (item.return_quantity * item.price), 0);
  };

  // 2. دالة الحفظ النهائي (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedItems = returnItems.filter(item => item.isSelected && item.return_quantity > 0);

    if (selectedItems.length === 0) {
        toast.error(t("Please select items and enter quantities"));
        return;
    }

    // تجهيز الـ Payload المطلوب للـ API
    const payload = {
        purchase_id: purchaseData?.purchase?._id,
        items: selectedItems.map(item => ({
            product_id: item.product?._id,
            product_price_id: item.product_price?._id || null, 
            quantity: item.return_quantity
        })),
        reason: formData.reason,
        note: formData.note,
        refund_account_id: formData.refund_account_id, // القيمة من الـ Input
        image: formData.image
    };

    // نداء API الـ create-return للحفظ
    const res = await postData(payload, "api/admin/return-purchase/create-return");
    if (res?.success) {
        toast.success(t("Return created successfully"));
        navigate("/purchase-return");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-xl font-bold mb-6">{t("Add Return")}</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Order Table - جدول المنتجات */}
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">{t("Order Table *")}</h3>
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>{t("Name")}</TableHead>
                            <TableHead>{t("Code")}</TableHead>
                            <TableHead className="text-center">{t("Quantity")}</TableHead>
                            <TableHead>{t("Net Unit Cost")}</TableHead>
                            <TableHead>{t("SubTotal")}</TableHead>
                            <TableHead className="text-center">{t("Choose")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {returnItems.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{item.product?.name}</TableCell>
                                <TableCell className="text-gray-500 text-xs">{item.product?._id?.substring(0,8)}</TableCell>
                                <TableCell className="w-24">
                                    <Input 
                                        type="number" 
                                        className="h-8 text-center"
                                        value={item.return_quantity}
                                        max={item.available_to_return}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(Number(e.target.value), item.available_to_return));
                                            const updated = [...returnItems];
                                            updated[idx].return_quantity = val;
                                            if (val > 0) updated[idx].isSelected = true;
                                            setReturnItems(updated);
                                        }}
                                    />
                                    <p className="text-[10px] text-center text-blue-500 mt-1">Max: {item.available_to_return}</p>
                                </TableCell>
                                <TableCell>{item.price?.toFixed(2)}</TableCell>
                                <TableCell className="font-bold">{(item.return_quantity * item.price).toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={item.isSelected}
                                        onChange={(e) => {
                                            const updated = [...returnItems];
                                            updated[idx].isSelected = e.target.checked;
                                            setReturnItems(updated);
                                        }}
                                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        {/* الحقول الإضافية أسفل الجدول */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">{t("Account ID / Name")} *</label>
                <Input 
                    placeholder={t("Enter Account ID")} 
                    value={formData.refund_account_id}
                    onChange={(e) => setFormData({...formData, refund_account_id: e.target.value})}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t("Return Reason")}</label>
                <Input 
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium">{t("Return Note")}</label>
            <Textarea 
                placeholder={t("Enter notes here...")}
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
        </div>

        <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-12" disabled={postLoading}>
            {postLoading && <Loader2 className="animate-spin mr-2" size={18} />}
            {t("Submit")}
        </Button>

        {/* شريط الإجماليات السفلي */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border rounded-lg bg-slate-50 mt-10 text-center">
            <div className="p-4 border-r">
                <p className="text-[10px] text-gray-400 uppercase font-bold">{t("Items")}</p>
                <p className="font-bold text-lg">{returnItems.filter(i => i.isSelected).length}</p>
            </div>
            <div className="p-4 border-r">
                <p className="text-[10px] text-gray-400 uppercase font-bold">{t("Total Items Qty")}</p>
                <p className="font-bold text-lg">
                    {returnItems.filter(i => i.isSelected).reduce((acc, i) => acc + i.return_quantity, 0)}
                </p>
            </div>
            <div className="p-4 bg-white">
                <p className="text-[10px] text-purple-600 uppercase font-black">{t("Grand Total")}</p>
                <p className="font-black text-xl text-purple-700">{calculateGrandTotal().toFixed(2)}</p>
            </div>
        </div>
      </form>
    </div>
  );
}