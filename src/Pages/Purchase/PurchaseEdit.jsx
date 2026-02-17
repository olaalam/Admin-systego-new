import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import { useTranslation } from "react-i18next";
import { Trash2, Wallet, Calendar, User, Warehouse, Calculator, X, Plus, Percent, Tag } from "lucide-react";
import { toast } from "react-toastify";

const PurchaseEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: selection } = useGet("api/admin/purchase/selection");
  const { data: responseData, loading: fetching } = useGet(`api/admin/purchase/${id}`);
  const { putData, loading: updating } = usePut(`api/admin/purchase/${id}`);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    warehouse_id: "",
    supplier_id: "",
    tax_id: "",
    payment_status: "full",
    shipping_cost: 0,
    discount: 0,
    exchange_rate: 1,
    purchase_items: [],
    financials: [],
    installments: [],
  });

  useEffect(() => {
    const p = responseData?.purchase;
    if (p) {
      const initialData = {
        date: p.date ? p.date.split("T")[0] : "",
        warehouse_id: p.warehouse_id?._id || p.warehouse_id || "",
        supplier_id: p.supplier_id?._id || p.supplier_id || "",
        tax_id: p.tax_id?._id || p.tax_id || "",
        payment_status: p.payment_status || "full",
        shipping_cost: Number(p.shipping_cost) || 0,
        discount: Number(p.discount) || 0,
        exchange_rate: p.exchange_rate || 1,
        purchase_items: (p.items || []).map(item => ({
          product_id: item.product_id?._id || item.product_id,
          name: item.product_id?.name || item.name || "Product",
          quantity: Number(item.quantity) || 0,
          unit_cost: Number(item.unit_cost) || 0,
          tax: Number(item.tax) || 0,
          discount: Number(item.discount || item.discount_share) || 0,
          exp_ability: item.product_id?.exp_ability || (item.date_of_expiery ? true : false),
          expiry_date: item.date_of_expiery ? item.date_of_expiery.split("T")[0] : null
        })),
        financials: (p.invoices || []).map(inv => ({
          financial_id: Array.isArray(inv.financial_id) ? inv.financial_id[0] : inv.financial_id,
          payment_amount: Number(inv.amount) || 0
        })),
        installments: (p.duePayments || []).map(dp => ({
          date: dp.date ? dp.date.split("T")[0] : "",
          amount: Number(dp.amount) || 0
        })),
      };

      setFormData(initialData);
      setOriginalFormData(initialData); // حفظ النسخة الأصلية للمقارنة لاحقاً
    }
  }, [responseData]);

  const currencyCode = selection?.currency?.code || "EGP";

  const totals = useMemo(() => {
    let itemsTotalBeforeAll = 0;
    const processedItems = formData.purchase_items.map(item => {
      const qty = Number(item.quantity || 0);
      const cost = Number(item.unit_cost || 0);
      const itemDisc = Number(item.discount || 0);
      const itemTax = Number(item.tax || 0);
      // الحساب: (التكلفة - الخصم + الضريبة) * الكمية
      const subtotal = (cost - itemDisc + itemTax) * qty;
      itemsTotalBeforeAll += subtotal;
      return { ...item, subtotal };
    });

    const selectedTax = selection?.tax?.find(tx => tx._id === formData.tax_id);
    const taxRate = selectedTax ? Number(selectedTax.amount) : 0;
    const generalTaxAmount = itemsTotalBeforeAll * taxRate;
    const grandTotal = itemsTotalBeforeAll + generalTaxAmount + Number(formData.shipping_cost) - Number(formData.discount);
    const totalPaid = formData.financials.reduce((acc, curr) => acc + Number(curr.payment_amount || 0), 0);
    const remainingToPay = Math.max(0, grandTotal - totalPaid);

    return { itemsTotalBeforeAll, generalTaxAmount, grandTotal, processedItems, totalPaid, remainingToPay };
  }, [formData, selection]);

  const getChangedFields = (original, current) => {
    const changes = {};
    Object.keys(current).forEach(key => {
      // إذا كانت القيمة مختلفة عن القيمة الأصلية، أضفها لكائن التغييرات
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        changes[key] = current[key];
      }
    });
    return changes;
  };

  const handleUpdate = async () => {
    if (!originalFormData) return;

    // الحصول على الحقول المتغيرة فقط بالمقارنة مع النسخة المهيأة
    const changedFields = getChangedFields(originalFormData, formData);

    if (Object.keys(changedFields).length === 0) {
      toast.info(t("No changes detected"));
      return;
    }

    // ملاحظة هامة: المصفوفات (المنتجات، الحسابات، الأقساط) 
    // يفضل إرسالها كاملة إذا حدث فيها أي تغيير بسيط لضمان دقة البيانات في الـ Backend
    const finalPayload = { ...changedFields };

    try {
      const response = await putData(finalPayload);
      if (response) {
        toast.success(t("Updated successfully"));
        navigate("/purchase");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (fetching) return <div className="p-20 text-center font-black text-blue-600">{t("Loading...")}</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto bg-white rounded-3xl shadow-sm p-8 border border-gray-100">

        <div className="flex justify-between items-center mb-10 border-b pb-6">
          <h1 className="text-3xl font-black text-gray-900">{t("Edit Purchase Order")}</h1>
          <span className="text-lg font-mono font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl tracking-tighter">#{responseData?.purchase?.reference}</span>
        </div>

        {/* القسم العلوي: البيانات الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("Warehouse")}</label>
            <select className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500 transition-all" value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}>
              <option value="">{t("Select Warehouse")}</option>
              {selection?.warehouse?.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("Supplier")}</label>
            <select className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500 transition-all" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}>
              <option value="">{t("Select Supplier")}</option>
              {selection?.supplier?.map(s => <option key={s._id} value={s._id}>{s.name || s.username}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("Purchase Date")}</label>
            <input type="date" className="w-full border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>
        </div>

        {/* جدول المنتجات المطور: إظهار كافة الحقول لكل Item */}
        <div className="mb-10 overflow-hidden border-2 border-gray-100 rounded-[2rem] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500">
                  <th className="p-5 text-left font-black uppercase tracking-tighter">{t("Product")}</th>
                  <th className="p-5 text-center font-black uppercase tracking-tighter w-24">{t("Qty")}</th>
                  <th className="p-5 text-center font-black uppercase tracking-tighter w-28">{t("Cost")}</th>
                  <th className="p-5 text-center font-black uppercase tracking-tighter w-28 text-orange-500">{t("Disc/Item")}</th>
                  <th className="p-5 text-center font-black uppercase tracking-tighter w-28 text-teal-500">{t("Tax/Item")}</th>
                  <th className="p-5 text-center font-black uppercase tracking-tighter w-44">{t("Expiry Date")}</th>
                  <th className="p-5 text-right font-black uppercase tracking-tighter w-32">{t("Subtotal")}</th>
                  <th className="p-5 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.purchase_items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                    <td className="p-5 font-black text-gray-800">{item.name}</td>
                    <td className="p-5">
                      <input type="number" className="w-full border rounded-lg p-2 text-center font-bold" value={item.quantity} onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].quantity = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }} />
                    </td>
                    <td className="p-5">
                      <input type="number" className="w-full border rounded-lg p-2 text-center font-bold" value={item.unit_cost} onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].unit_cost = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }} />
                    </td>
                    <td className="p-5">
                      <input type="number" className="w-full border-orange-100 bg-orange-50/30 rounded-lg p-2 text-center font-bold text-orange-600" value={item.discount} onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].discount = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }} />
                    </td>
                    <td className="p-5">
                      <input type="number" className="w-full border-teal-100 bg-teal-50/30 rounded-lg p-2 text-center font-bold text-teal-600" value={item.tax} onChange={(e) => {
                        const items = [...formData.purchase_items];
                        items[idx].tax = e.target.value;
                        setFormData({ ...formData, purchase_items: items });
                      }} />
                    </td>
                    <td className="p-5">
                      {item.exp_ability ? (
                        <input type="date" className="w-full border-2 border-gray-100 rounded-lg p-2 text-xs font-bold" value={item.expiry_date || ""} onChange={(e) => {
                          const items = [...formData.purchase_items];
                          items[idx].expiry_date = e.target.value;
                          setFormData({ ...formData, purchase_items: items });
                        }} />
                      ) : (
                        <span className="text-gray-300 text-xs italic block text-center italic">{t("N/A")}</span>
                      )}
                    </td>
                    <td className="p-5 text-right font-black text-gray-900">
                      {((Number(item.unit_cost) - Number(item.discount) + Number(item.tax)) * Number(item.quantity)).toFixed(2)}
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => setFormData({ ...formData, purchase_items: formData.purchase_items.filter((_, i) => i !== idx) })} className="text-red-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* القسم السفلي: الدفع والإجماليات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">{t("Payment Status")}</label>
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                {['full', 'partial', 'later'].map(m => (
                  <button key={m} onClick={() => setFormData({ ...formData, payment_status: m })} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${formData.payment_status === m ? "bg-white text-blue-600 shadow-md" : "text-gray-400"}`}>{t(m.toUpperCase())}</button>
                ))}
              </div>
            </div>

            {/* الحسابات المالية */}
            {formData.payment_status !== 'later' && (
              <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-gray-800 flex items-center gap-2"><Wallet size={18} className="text-blue-500" /> {t("Payment Details")}</h3>
                  <button onClick={() => setFormData(p => ({ ...p, financials: [...p.financials, { financial_id: "", payment_amount: 0 }] }))} className="bg-blue-600 text-white p-2 rounded-full hover:rotate-90 transition-all"><Plus size={16} /></button>
                </div>
                {formData.financials.map((f, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <select className="flex-1 border-2 border-gray-100 rounded-2xl p-4 font-bold bg-gray-50 outline-none focus:bg-white focus:border-blue-500 transition-all" value={f.financial_id} onChange={(e) => {
                      const fins = [...formData.financials];
                      fins[i].financial_id = e.target.value;
                      setFormData({ ...formData, financials: fins });
                    }}>
                      <option value="">{t("Select Account")}</option>
                      {selection?.financial?.map(fin => <option key={fin._id} value={fin._id}>{fin.name}</option>)}
                    </select>
                    <input type="number" className="w-32 border-2 border-gray-100 rounded-2xl p-4 font-black text-right" value={f.payment_amount} onChange={(e) => {
                      const fins = [...formData.financials];
                      fins[i].payment_amount = e.target.value;
                      setFormData({ ...formData, financials: fins });
                    }} />
                    <button onClick={() => setFormData(p => ({ ...p, financials: p.financials.filter((_, idx) => idx !== i) }))} className="text-red-300 hover:text-red-500"><X size={20} /></button>
                  </div>
                ))}
              </div>
            )}

            {formData.payment_status !== 'full' && (
              <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-4">
                <label className="text-sm font-black text-orange-700 flex items-center gap-2"><Calendar size={16} /> {t("Installments Schedule")}</label>
                <div className="flex gap-2">
                  <input type="date" id="q_date" className="flex-1 border border-orange-200 rounded-xl p-2.5 text-sm" />
                  <input type="number" id="q_amt" className="w-32 border border-orange-200 rounded-xl p-2.5 text-sm" placeholder="Amount" />
                  <button onClick={() => {
                    const d = document.getElementById('q_date').value;
                    const a = document.getElementById('q_amt').value;
                    if (d && a) {
                      setFormData(prev => ({ ...prev, installments: [...prev.installments, { date: d, amount: a }] }));
                      document.getElementById('q_date').value = "";
                      document.getElementById('q_amt').value = "";
                    }
                  }} className="bg-orange-500 text-white px-4 rounded-xl font-bold hover:bg-orange-600 transition-colors">+</button>
                </div>
                <div className="space-y-2">
                  {formData.installments.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm text-xs border border-orange-100">
                      <span className="font-medium text-gray-500">{item.date}</span>
                      <span className="font-black text-orange-600">{item.amount} {currencyCode}</span>
                      <button onClick={() => setFormData({ ...formData, installments: formData.installments.filter((_, idx) => idx !== i) })} className="text-red-300 hover:text-red-500">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ملخص الفاتورة النهائي */}
          <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-gray-800 text-gray-400">
                <span className="font-bold uppercase text-xs tracking-widest">{t("Items Total (Inc. Item Tax/Disc)")}</span>
                <span className="text-2xl font-mono font-black text-white">{totals.itemsTotalBeforeAll.toFixed(2)}</span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{t("General Tax (%)")}</span>
                  <select className="bg-gray-800 border-none rounded-xl p-3 text-sm font-black text-white outline-none" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}>
                    <option value="">{t("No General Tax")}</option>
                    {selection?.tax?.map(tx => <option key={tx._id} value={tx._id}>{tx.name} ({Number(tx.amount) * 100}%)</option>)}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{t("General Shipping")}</span>
                  <input type="number" className="w-32 bg-gray-800 border-none rounded-xl p-3 text-right font-black text-white outline-none focus:ring-1 focus:ring-blue-500" value={formData.shipping_cost} onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{t("General Discount")}</span>
                  <input type="number" className="w-32 bg-gray-800 border-none rounded-xl p-3 text-right font-black text-orange-400 outline-none focus:ring-1 focus:ring-orange-500" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-end">
              <div>
                <span className="block text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-2">{t("Net Amount")}</span>
                <span className="text-4xl font-black">{t("Grand Total")}</span>
              </div>
              <div className="text-right">
                <span className="text-6xl font-black text-blue-400 font-mono tracking-tighter block">{totals.grandTotal.toFixed(2)}</span>
                <span className="text-blue-700 font-black text-lg uppercase">{currencyCode}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleUpdate} disabled={updating} className="w-full mt-12 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-2xl transition-all shadow-xl flex items-center justify-center gap-4 group">
          {updating ? t("Saving...") : <><Calculator size={28} className="group-hover:rotate-12 transition-transform" /> {t("Save Changes")}</>}
        </button>
      </div>
    </div>
  );
};

export default PurchaseEdit;