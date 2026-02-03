import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useGet from "@/hooks/useGet";
import { Loader2, ReceiptText, Calendar, Package } from "lucide-react";

export default function PurchaseReturnsModal({ purchaseId, isOpen, onClose }) {
  const { t } = useTranslation();
  
  // مناداة الـ API الخاص بجلب المرتجعات لفاتورة معينة
  const { data: res, loading } = useGet(
    purchaseId ? `api/admin/return-purchase/purchase-returns/${purchaseId}` : null
  );

  const returns = res?.returns || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <ReceiptText size={20} />
            {t("Returns for Purchase")} #{res?.purchase_id?.substring(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-purple-600" size={32} />
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{t("No returns found for this purchase.")}</div>
        ) : (
          <div className="space-y-6 pt-4">
            {returns.map((ret) => (
              <div key={ret._id} className="border rounded-xl p-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-[10px] rounded-bl-lg font-bold">
                  {ret.reference}
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} />
                    {new Date(ret.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs font-bold text-purple-700">
                    {t("Total Returned")}: {ret.total_amount} EGP
                  </div>
                </div>

                {/* عرض المنتجات داخل المرتجع الواحد */}
                <div className="bg-white rounded-lg border divide-y">
                  {ret.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.product_id?.image} alt="" className="w-10 h-10 rounded object-cover border" />
                        <div>
                          <p className="font-bold">{item.product_id?.name}</p>
                          <p className="text-[10px] text-gray-400">{item.product_id?.ar_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{t("Qty")}: <span className="text-black font-bold">{item.returned_quantity}</span></p>
                        <p className="font-bold text-purple-600">{item.subtotal} EGP</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {ret.note && (
                  <p className="mt-3 text-[11px] text-gray-500 italic">
                    <strong>{t("Note")}:</strong> {ret.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}