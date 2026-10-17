import React, { useState, useEffect } from "react";
import { useTenantInfo } from "@/context/TenantContext";
import api from "@/api/api";
import { Lock, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

const CYCLES = [
  { key: "monthly", label: "Monthly", field: "monthly_price" },
  { key: "quarterly", label: "Quarterly", field: "quarterly_price" },
  { key: "half_yearly", label: "Half Yearly", field: "half_yearly_price" },
  { key: "yearly", label: "Yearly", field: "yearly_price" },
];

export default function PaymentRequired() {
  const { packageInfo, subscription, refetch } = useTenantInfo();
  const [cycle, setCycle] = useState("monthly");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const loadStatus = async () => {
    try {
      const res = await api.get("/api/admin/subscription/payment-status");
      const data = res.data?.data || res.data;
      setStatus(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const priceFor = (c) => {
    const field = CYCLES.find((x) => x.key === c)?.field;
    return packageInfo?.[field] ?? "-";
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      await api.post("/api/admin/subscription/submit-payment", {
        payment_cycle: cycle,
        screenshot,
      });
      setMessage("Payment submitted. Waiting for approval.");
      await loadStatus();
      await refetch();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = status?.status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="ltr">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        <div className="relative mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-200">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Subscription Expired / Payment Required
        </h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
          Your subscription has expired. Please choose a plan cycle, pay, and upload a screenshot of your payment to reactivate your account.
        </p>

        {packageInfo?.name && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-6">
            Current Plan: {packageInfo.name}
          </div>
        )}

        {isPending ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Clock className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-bold text-amber-700">Payment pending approval</p>
            <p className="text-xs text-slate-500">Amount: {status?.amount} — {status?.payment_cycle}</p>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing cycle</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              >
                {CYCLES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} — {priceFor(c.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount to pay</label>
              <div className="px-3 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-800">
                {priceFor(cycle)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment screenshot</label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-3 py-4 cursor-pointer hover:bg-slate-50">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">{screenshot ? "Screenshot selected" : "Choose file"}</span>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              {preview && (
                <img src={preview} alt="preview" className="mt-2 max-h-40 mx-auto rounded-lg border" />
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !screenshot}
              className="w-full px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit Payment"}
            </button>

            {message && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
