// src/Pages/FeatureLocked.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ArrowRight, Sparkles, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTenantInfo } from "@/context/TenantContext";

export default function FeatureLocked({ featureName = "Feature" }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { packageInfo } = useTenantInfo();

  return (
    <div
      className="min-h-[75vh] flex items-center justify-center p-6"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Floating Lock Icon */}
        <div className="relative mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-200">
          <Lock className="w-10 h-10 text-white" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {isArabic ? "الميزة غير متوفرة في باقتك الحالية" : "Feature Locked / Upgrade Required"}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
          {isArabic
            ? `قسم "${t(featureName) || featureName}" غير مدرج في باقة اشتراكك الحالية${
                packageInfo?.name ? ` (${packageInfo.name})` : ""
              }. يرجى التواصل مع فريق الدعم الفني لترقية باقتك وتفعيل الميزة.`
            : `The "${t(featureName) || featureName}" module is not included in your current subscription plan${
                packageInfo?.name ? ` (${packageInfo.name})` : ""
              }. Please contact support to upgrade your plan and activate this feature.`}
        </p>

        {/* Package Badge */}
        {packageInfo?.name && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-6">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isArabic ? "الباقة الحالية:" : "Current Plan:"} {packageInfo.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isArabic ? "العودة للوحة التحكم" : "Back to Control Panel"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
