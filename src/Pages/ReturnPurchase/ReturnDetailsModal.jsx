import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useGet from "@/hooks/useGet";
import { useTranslation } from "react-i18next";
import { Loader2, Calendar, User, Building2, Package, CreditCard, ClipboardList } from "lucide-react";

export default function ReturnDetailsModal({ id, isOpen, onClose }) {
  const { t } = useTranslation();
  const { data: res, loading } = useGet(id ? `api/admin/return-purchase/return-by-id/${id}` : null);
  const data = res?.return;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="flex justify-between items-center">
            <span className="text-xl font-bold">{t("Return Summary")}</span>
           
          </DialogTitle>
          
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : (
          <div className="p-6 space-y-8 bg-white">
            {/* بطاقات المعلومات السريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
              <InfoCard icon={<Calendar size={18}/>} label={t("Date")} value={new Date(data?.date).toLocaleDateString()} color="blue" />
              <InfoCard icon={<Building2 size={18}/>} label={t("Supplier")} value={data?.supplier_id?.company_name} color="purple" />
              <InfoCard icon={<Package size={18}/>} label={t("Warehouse")} value={data?.warehouse_id?.name} color="orange" />
              <InfoCard icon={<User size={18}/>} label={t("Created By")} value={data?.user_id?.email} color="slate" />
              <InfoCard icon={<CreditCard size={18}/>} label={t("Refund Method")} value={data?.refund_method} color="green" />
              <InfoCard icon={<ClipboardList size={18}/>} label={t("Purchase Ref")} value={data?.purchase_reference} color="pink" />
            </div>

            {/* عرض المنتجات بشكل بطاقات (Cards) */}
            <div className="space-y-4">
               <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
               <Package className="text-purple-600" /> {t("Returned Items")}
              </h3>
              <div className="grid gap-3">
                {data?.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <img src={item.product_id?.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-white border" />
                      <div>
                        <p className="font-bold text-slate-800">{item.product_id?.name}</p>
                        <p className="text-xs text-slate-500">{item.product_id?.ar_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-slate-400">{t("Qty")}:</span> <span className="font-bold text-purple-600">{item.returned_quantity}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{item.subtotal} $</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الفوتر والإجمالي */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t">
              <div className="text-sm text-slate-500 max-w-md">
                <strong>{t("Notes")}:</strong> {data?.note || t("No notes added.")}
              </div>
              <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-center">
                <p className="text-xs opacity-70 uppercase tracking-wider">{t("Grand Total")}</p>
                <p className="text-2xl font-black">{data?.total_amount} $</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// مكون فرعي للبطاقات الصغيرة
function InfoCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-50 text-slate-600",
    green: "bg-green-50 text-green-600",
    pink: "bg-pink-50 text-pink-600",
  };
  return (
    <div className={`p-3 rounded-xl flex items-center gap-3 ${colors[color] || colors.slate}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold opacity-70">{label}</p>
        <p className="text-sm font-bold truncate max-w-[120px]">{value || "---"}</p>
      </div>
    </div>
  );
}