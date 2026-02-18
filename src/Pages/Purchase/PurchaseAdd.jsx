import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useTranslation } from "react-i18next";
import { Trash2, Wallet, Calendar, User, Warehouse, Info, Calculator, X, Plus } from "lucide-react";
import { toast } from "react-toastify";
import SmartSearch from "@/components/SmartSearch";

const PurchaseAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { postData, loading } = usePost("/api/admin/purchase");
  const { data: selection } = useGet("api/admin/purchase/selection");

  const [searchProduct, setSearchProduct] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    warehouse_id: "",
    supplier_id: "",
    tax_id: "",
    payment_status: "full",
    shipping_cost: 0,
    discount: 0,
    exchange_rate: 1,
    purchase_items: [],
    financials: [{ financial_id: "", payment_amount: 0 }],
    installments: [],
  });

  const currencyCode = selection?.currency?.code || "EGP";

  useEffect(() => {
    if (formData.payment_status === "full") {
      setFormData(prev => ({
        ...prev,
        installments: [],
        financials: prev.financials.length > 0 ? prev.financials : [{ financial_id: "", payment_amount: 0 }]
      }));
    } else if (formData.payment_status === "later") {
      setFormData(prev => ({ ...prev, financials: [] }));
    } else if (formData.payment_status === "partial") {
      if (formData.financials.length === 0) {
        setFormData(prev => ({ ...prev, financials: [{ financial_id: "", payment_amount: 0 }] }));
      }
    }
  }, [formData.payment_status]);

  const totals = useMemo(() => {
    let itemsTotalBeforeAll = 0;

    const processedItems = formData.purchase_items.map(item => {
      const qty = Number(item.quantity || 0);
      const cost = Number(item.unit_cost || 0);
      const itemDisc = Number(item.discount || 0);
      const itemTax = Number(item.tax || 0);

      const subtotal = (cost - itemDisc + itemTax) * qty;
      itemsTotalBeforeAll += subtotal;

      return { ...item, subtotal, date: formData.date };
    });

    const selectedTax = selection?.tax?.find(tx => tx._id === formData.tax_id);
    const generalTaxAmount = selectedTax ? (itemsTotalBeforeAll * (selectedTax.amount / 100)) : 0;

    const grandTotal = itemsTotalBeforeAll + generalTaxAmount + Number(formData.shipping_cost) - Number(formData.discount);

    const paidAmount = formData.financials.reduce((acc, curr) => acc + Number(curr.payment_amount || 0), 0);
    const remainingToPay = Math.max(0, grandTotal - paidAmount);

    const itemsWithNetCost = processedItems.map(item => {
      const weight = itemsTotalBeforeAll > 0 ? (item.subtotal / itemsTotalBeforeAll) : 0;
      const shareOfGeneralDiscount = Number(formData.discount) * weight;
      const shareOfShipping = Number(formData.shipping_cost) * weight;
      const shareOfGeneralTax = itemsTotalBeforeAll * (selectedTax ? (selectedTax.amount / 100) : 0) * weight;

      const netTotalForItem = item.subtotal - shareOfGeneralDiscount + shareOfShipping + shareOfGeneralTax;
      const netUnitCost = item.quantity > 0 ? (netTotalForItem / item.quantity) : 0;

      return { ...item, netUnitCost };
    });

    return { itemsTotalBeforeAll, generalTaxAmount, grandTotal, itemsWithNetCost, remainingToPay };
  }, [formData, selection]);

  const addFinancialRow = () => {
    setFormData(prev => ({
      ...prev,
      financials: [...prev.financials, { financial_id: "", payment_amount: totals.remainingToPay }]
    }));
  };

  const removeFinancialRow = (index) => {
    const newFins = formData.financials.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      financials: newFins.length > 0 ? newFins : [{ financial_id: "", payment_amount: 0 }]
    });
  };

  const suggestions = useMemo(() => {
    const term = searchProduct.toLowerCase().trim();
    if (!term) return [];
    return selection?.products?.filter(p =>
      p.name?.toLowerCase().includes(term) || p.code?.toString().includes(term)
    ).slice(0, 8) || [];
  }, [searchProduct, selection]);

  const handleSelectProduct = (p) => {
    if (formData.purchase_items.find(item => item.product_id === (p._id || p.id))) {
      return toast.warning(t("ProductAlreadyAdded"));
    }
    setFormData(prev => ({
      ...prev,
      purchase_items: [...prev.purchase_items, {
        product_id: p._id || p.id,
        name: p.name,
        quantity: 1,
        unit_cost: p.price || 0,
        tax: 0,
        discount: 0,
        exp_ability: p.exp_ability || false, // حفظ الحالة للتحقق
        expiry_date: p.exp_ability ? "" : null // تهيئة حقل التاريخ
      }]
    }));
    setSearchProduct("");
  };

  const handleSave = async () => {
    // 1. التحقق من تاريخ الصلاحية للمنتجات المطلوبة
    const missingExpiry = totals.itemsWithNetCost.find(item => item.exp_ability && !item.expiry_date);
    if (missingExpiry) {
      return toast.error(`${t("Expiry date is required for product")}: ${missingExpiry.name}`);
    }

    // 2. تجهيز البيانات الأساسية
    const payload = {
      ...formData,
      total: totals.itemsTotalBeforeAll,
      grand_total: totals.grandTotal,
      // تنظيف المنتجات: حذف name, netUnitCost, و expiry_date إذا كان غير مطلوب
      purchase_items: totals.itemsWithNetCost.map(({ name, netUnitCost, exp_ability, ...rest }) => {
        const item = { ...rest };
        if (!exp_ability) {
          delete item.expiry_date; // حذف التاريخ إذا كان المنتج لا يدعم الصلاحية
        }
        return item;
      }),
      financials: formData.financials.filter(f => f.financial_id !== "" && Number(f.payment_amount) > 0),
      installments: [...formData.installments]
    };

    // التحقق مما إذا كان هناك قسط مكتوب في الخانات ولم يتم الضغط على +
    const qDate = document.getElementById('q_date')?.value;
    const qAmt = document.getElementById('q_amt')?.value;
    if (qDate && qAmt) {
      payload.installments.push({ date: qDate, amount: qAmt });
    }

    // 3. حذف tax_id إذا كان فارغاً
    if (!payload.tax_id) {
      delete payload.tax_id;
    }

    // 4. التحقق من الحقول الإجبارية
    if (!payload.warehouse_id || !payload.supplier_id || payload.purchase_items.length === 0) {
      return toast.error(t("PleaseCompleteRequiredFields"));
    }

    // 5. إرسال البيانات والتحويل لصفحة القائمة عند النجاح
    try {
      const response = await postData(payload);
      // ملاحظة: تأكدي أن postData ترجع true أو البيانات عند النجاح
      if (response) {
        toast.success(t("PurchaseAddedSuccessfully"));
        navigate("/purchase");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-8 border">

        {/* المورد والمخزن */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2"><Warehouse size={16} /> {t("Warehouse")}</label>
            <select className="w-full border rounded-xl p-3 bg-white" value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}>
              <option value="">{t("Select Warehouse")}</option>
              {selection?.warehouse?.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2"><User size={16} /> {t("Supplier")}</label>
            <select className="w-full border rounded-xl p-3 bg-white" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}>
              <option value="">{t("Select Supplier")}</option>
              {selection?.supplier?.map(s => <option key={s._id} value={s._id}>{s.name || s.username}</option>)}
            </select>
          </div>
        </div>

        {/* البحث عن المنتجات */}
        <div className="relative z-40 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">{t("Search Products")}</label>
          <SmartSearch value={searchProduct} onChange={setSearchProduct} />
          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border shadow-2xl rounded-xl mt-1 overflow-hidden z-50">
              {suggestions.map(p => (
                <div key={p._id} onClick={() => handleSelectProduct(p)} className="p-4 hover:bg-teal-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    {p.exp_ability && <span className="text-[10px] text-orange-500 font-bold tracking-tighter uppercase">Requires Expiry</span>}
                  </div>
                  <span className="font-bold text-teal-600">{p.price} {currencyCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* جدول المشتريات */}
        <div className="overflow-x-auto border rounded-2xl mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">{t("Product")}</th>
                <th className="p-4 w-32 text-center text-orange-600">{t("Expiry Date")}</th>
                <th className="p-4 w-20 text-center">{t("Qty")}</th>
                <th className="p-4 w-24 text-center">{t("Cost")}</th>
                <th className="p-4 w-24 text-orange-600">{t("Disc/Item")}</th>
                <th className="p-4 w-24 text-blue-600">{t("Tax/Item")}</th>
                <th className="p-4 text-teal-700 bg-teal-50 font-bold">{t("Net Cost")}</th>
                <th className="p-4 text-right">{t("Subtotal")}</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totals.itemsWithNetCost.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold">{item.name}</td>
                  <td className="p-4">
                    {item.exp_ability ? (
                      <input
                        type="date"
                        className="w-full border border-orange-300 rounded p-1.5 text-xs bg-orange-50/30"
                        value={item.expiry_date}
                        onChange={(e) => {
                          const newItems = [...formData.purchase_items];
                          newItems[idx].expiry_date = e.target.value;
                          setFormData({ ...formData, purchase_items: newItems });
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-300">—</div>
                    )}
                  </td>
                  <td className="p-4">
                    <input type="number" className="w-full border rounded p-1 text-center" value={item.quantity} onChange={(e) => {
                      const items = [...formData.purchase_items];
                      items[idx].quantity = e.target.value;
                      setFormData({ ...formData, purchase_items: items });
                    }} />
                  </td>
                  <td className="p-4 text-center font-mono">{item.unit_cost}</td>
                  <td className="p-4">
                    <input type="number" className="w-full border border-orange-200 rounded p-1 text-center" value={item.discount} onChange={(e) => {
                      const items = [...formData.purchase_items];
                      items[idx].discount = e.target.value;
                      setFormData({ ...formData, purchase_items: items });
                    }} />
                  </td>
                  <td className="p-4">
                    <input type="number" className="w-full border border-blue-200 rounded p-1 text-center" value={item.tax} onChange={(e) => {
                      const items = [...formData.purchase_items];
                      items[idx].tax = e.target.value;
                      setFormData({ ...formData, purchase_items: items });
                    }} />
                  </td>
                  <td className="p-4 text-center font-black text-teal-700 bg-teal-50/30">
                    {item.netUnitCost.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-gray-700">{item.subtotal.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setFormData({ ...formData, purchase_items: formData.purchase_items.filter((_, i) => i !== idx) })} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* قسم الدفع والإجماليات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div className="space-y-6">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
              {['full', 'partial', 'later'].map(m => (
                <button key={m} onClick={() => setFormData({ ...formData, payment_status: m })}
                  className={`flex-1 py-3 rounded-xl font-black transition-all ${formData.payment_status === m ? "bg-white text-teal-600 shadow-md" : "text-gray-400"}`}>
                  {t(m.toUpperCase())}
                </button>
              ))}
            </div>

            {formData.payment_status !== 'later' && (
              <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Wallet size={16} className="text-teal-600" /> {t("Split Payment Methods")}</label>
                  <button onClick={addFinancialRow} className="bg-teal-50 text-teal-600 p-1.5 rounded-full hover:bg-teal-100 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>

                {formData.financials.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center animate-in slide-in-from-top-1">
                    <select className="flex-1 border rounded-xl p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" value={f.financial_id} onChange={(e) => {
                      const fins = [...formData.financials];
                      fins[i].financial_id = e.target.value;
                      setFormData({ ...formData, financials: fins });
                    }}>
                      <option value="">{t("Select Account")}</option>
                      {selection?.financial?.map(fin => <option key={fin._id} value={fin._id}>{fin.name}</option>)}
                    </select>
                    <div className="relative">
                      <input type="number" className="w-32 border rounded-xl p-3 font-bold pr-12 text-right focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" value={f.payment_amount} onChange={(e) => {
                        const fins = [...formData.financials];
                        fins[i].payment_amount = e.target.value;
                        setFormData({ ...formData, financials: fins });
                      }} />
                      <span className="absolute right-3 top-3.5 text-[10px] text-gray-400 font-bold">{currencyCode}</span>
                    </div>
                    <button onClick={() => removeFinancialRow(i)} className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}

                {totals.remainingToPay > 0 && (
                  <div className="bg-teal-50/50 p-2 rounded-lg flex justify-between items-center px-4">
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">{t("Remaining to allocate")}</span>
                    <span className="text-sm font-black text-teal-700">{totals.remainingToPay} {currencyCode}</span>
                  </div>
                )}
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

          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-400 text-sm">{t("Items Total")}</span>
                <span className="font-mono text-lg">{totals.itemsTotalBeforeAll}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{t("General Tax")}</span>
                  <Info size={14} className="text-gray-600" />
                </div>
                <select className="bg-gray-800 text-xs border-none rounded-lg p-2 outline-none" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}>
                  <option value="">{t("No General Tax")}</option>
                  {selection?.tax?.map(tx => <option key={tx._id} value={tx._id}>{tx.name} ({tx.amount}%)</option>)}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t("Shipping Cost")}</span>
                <input type="number" className="w-24 bg-gray-800 border-none rounded-lg p-2 text-right font-bold" value={formData.shipping_cost} onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{t("General Discount")}</span>
                <input type="number" className="w-24 bg-gray-800 border-none rounded-lg p-2 text-right font-bold text-orange-400" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-800 flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("Payable Amount")}</p>
                <span className="text-gray-400 font-bold">{t("Grand Total")}</span>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-teal-400 font-mono tracking-tighter">
                  {totals.grandTotal}
                </span>
                <span className="text-teal-700 ml-2 font-bold">{currencyCode}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full mt-12 bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-teal-100/50 flex items-center justify-center gap-3">
          {loading ? t("Processing...") : <><Calculator size={24} /> {t("Confirm & Save Purchase")}</>}
        </button>
      </div>
    </div>
  );
};

export default PurchaseAdd;