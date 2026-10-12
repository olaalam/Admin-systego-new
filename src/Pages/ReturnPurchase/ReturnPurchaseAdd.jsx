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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";

export default function ReturnPurchaseAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: reference_no } = useParams();

  const { postData, loading: postLoading } = usePost();

  // جلب الحسابات البنكية
  const { data: bankAccountsData } = useGet("api/admin/bank_account");

  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    refund_account_id: "",
    reason: "Defective items",
    note: "",
    image: "",
  });

  // =========================================================
  // 1. جلب بيانات الفاتورة وتقسيم المنتجات بالاوبشن
  // =========================================================
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoading(true);

      const res = await postData(
        { reference: reference_no },
        "api/admin/return-purchase/purchase-for-return",
      );

      if (res?.success && res?.data) {
        setPurchaseData(res.data);

        if (res.data.items) {
          const flattened = [];

          res.data.items.forEach((item) => {
            // =============================================
            // المنتج له Options → كل option يبقى صف منفصل
            // =============================================
            if (item.options && item.options.length > 0) {
              item.options.forEach((option) => {
                const variationText = (option.variation_attributes || [])
                  .map((attr) => attr.option_name)
                  .join(" - ");

                const productName =
                  item.product?.name ||
                  option.product_price_id?.productId?.name ||
                  "Product";

                const displayName = option.display_name
                  ? option.display_name
                  : variationText
                    ? `${productName} - ${variationText}`
                    : productName;

                flattened.push({
                  ...item,

                  // ✅ purchase_item_id الأصلي
                  purchase_item_id: item._id,

                  // IDs
                  product_id: item.product?._id,

                  product_price_id:
                    option.product_price_id?._id ||
                    option.product_price_id ||
                    null,

                  option_id: option._id,

                  // الاسم
                  display_name: displayName,

                  // الكميات
                  quantity: Number(option.quantity) || 0,

                  available_to_return: Number(option.quantity) || 0,

                  // السعر
                  price: Number(item.price) || 0,

                  // State
                  return_quantity: 0,
                  isSelected: false,
                });
              });
            } else {
              // =============================================
              // منتج عادي بدون Options
              // =============================================
              flattened.push({
                ...item,

                // ✅ purchase_item_id الأصلي
                purchase_item_id: item._id,

                product_id: item.product?._id,

                product_price_id: null,

                option_id: null,

                display_name: item.product?.name || "Product",

                quantity: Number(item.quantity) || 0,

                available_to_return:
                  Number(item.available_to_return) ||
                  Number(item.quantity) ||
                  0,

                price: Number(item.price) || 0,

                return_quantity: 0,
                isSelected: false,
              });
            }
          });

          setReturnItems(flattened);
        }
      } else {
        toast.error(t("Purchase not found"));
        navigate("/purchase-return");
      }

      setIsInitialLoading(false);
    };

    if (reference_no) fetchInitialData();
  }, [reference_no]);

  // =========================================================
  // حساب الإجمالي
  // =========================================================
  const calculateGrandTotal = () => {
    return returnItems
      .filter((item) => item.isSelected)
      .reduce((acc, item) => acc + item.return_quantity * item.price, 0);
  };

  // =========================================================
  // 2. Submit
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItems = returnItems.filter(
      (item) => item.isSelected && item.return_quantity > 0,
    );

    if (selectedItems.length === 0) {
      toast.error(t("Please select items and enter quantities"));
      return;
    }

    if (!formData.refund_account_id) {
      toast.error(t("Please select a refund account"));
      return;
    }

    // =============================================
    // Payload: كل صف = item منفصل
    // purchase_item_id + product_id + product_price_id + quantity
    // =============================================
    const payload = {
      purchase_id: purchaseData?.purchase?._id,

      items: selectedItems.map((item) => ({
        purchase_item_id: item.purchase_item_id,
        product_id: item.product_id,
        product_price_id: item.product_price_id,
        quantity: item.return_quantity,
      })),

      reason: formData.reason,

      note: formData.note,

      refund_account_id: formData.refund_account_id,

      image: formData.image,
    };

    const res = await postData(
      payload,
      "api/admin/return-purchase/create-return",
    );

    if (res?.success) {
      toast.success(t("Return created successfully"));
      navigate("/purchase-return");
    }
  };

  // =========================================================
  // Loading
  // =========================================================
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-gray-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-xl font-bold mb-6">{t("Add Return")}</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===================================================
                    Order Table
                =================================================== */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">{t("Order Table *")}</h3>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>

                  <TableHead>{t("Available")}</TableHead>

                  <TableHead className="text-center">{t("Quantity")}</TableHead>

                  <TableHead>{t("Net Unit Cost")}</TableHead>

                  <TableHead>{t("SubTotal")}</TableHead>

                  <TableHead className="text-center">{t("Choose")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {returnItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {item.display_name}
                    </TableCell>

                    <TableCell className="text-gray-500 text-xs">
                      {item.available_to_return}
                    </TableCell>

                    <TableCell className="w-32">
                      <Input
                        type="number"
                        className="h-8 text-center"
                        value={item.return_quantity}
                        max={item.available_to_return}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(
                              Number(e.target.value),
                              item.available_to_return,
                            ),
                          );

                          const updated = [...returnItems];

                          updated[idx].return_quantity = val;

                          if (val > 0) updated[idx].isSelected = true;

                          setReturnItems(updated);
                        }}
                      />

                      <p className="text-[10px] text-center text-blue-500 mt-1">
                        Max: {item.available_to_return}
                      </p>
                    </TableCell>

                    <TableCell>{item.price?.toFixed(2)}</TableCell>

                    <TableCell className="font-bold">
                      {(item.return_quantity * item.price).toFixed(2)}
                    </TableCell>

                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={(e) => {
                          const updated = [...returnItems];

                          updated[idx].isSelected = e.target.checked;

                          setReturnItems(updated);
                        }}
                        className="w-4 h-4 accent-gray-600 cursor-pointer"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ===================================================
                    الحقول الإضافية
                =================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Account ID / Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("Account ID / Name")} *
            </label>

            <Select
              value={formData.refund_account_id}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  refund_account_id: val,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Enter Account ID")} />
              </SelectTrigger>

              <SelectContent>
                {bankAccountsData?.bankAccounts?.map((acc) => (
                  <SelectItem key={acc._id} value={acc._id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Return Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Return Reason")}</label>

            <Input
              value={formData.reason}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reason: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Return Note */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("Return Note")}</label>

          <Textarea
            placeholder={t("Enter notes here...")}
            value={formData.note}
            onChange={(e) =>
              setFormData({
                ...formData,
                note: e.target.value,
              })
            }
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="bg-gray-700 hover:bg-gray-800 text-white px-12"
          disabled={postLoading}
        >
          {postLoading && <Loader2 className="animate-spin mr-2" size={18} />}
          {t("Submit")}
        </Button>

        {/* ===================================================
                    الإجماليات
                =================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border rounded-lg bg-slate-50 mt-10 text-center">
          <div className="p-4 border-r">
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              {t("Items")}
            </p>

            <p className="font-bold text-lg">
              {returnItems.filter((i) => i.isSelected).length}
            </p>
          </div>

          <div className="p-4 border-r">
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              {t("Total Items Qty")}
            </p>

            <p className="font-bold text-lg">
              {returnItems
                .filter((i) => i.isSelected)
                .reduce((acc, i) => acc + i.return_quantity, 0)}
            </p>
          </div>

          <div className="p-4 bg-white">
            <p className="text-[10px] text-gray-600 uppercase font-black">
              {t("Grand Total")}
            </p>

            <p className="font-black text-xl text-gray-700">
              {calculateGrandTotal().toFixed(2)}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
