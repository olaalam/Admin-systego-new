// src/Pages/DomainData/DomainData.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Globe,
  Server,
  Database,
  ShieldCheck,
  HardDrive,
  Activity,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Calendar,
  User,
  Hash,
  Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  extractDomain,
  deriveFrontendDomain,
  getSubscriptionInfo,
  createSiteMapping,
  parseSubscriptionStdout,
} from "@/api/pleskApi";

export default function DomainData() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Base URL from .env
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://bcknd.systego.net";
  const defaultBackendDomain = useMemo(() => extractDomain(envBaseUrl), [envBaseUrl]);

  // Target backend domain for subscription info
  const [targetDomain, setTargetDomain] = useState(defaultBackendDomain);
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [domainInputValue, setDomainInputValue] = useState(defaultBackendDomain);

  // Subscription Info State
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Link Client Domain State
  const [clientDomain, setClientDomain] = useState("");
  const [webspaceName, setWebspaceName] = useState("systego.net");
  const [wwwRoot, setWwwRoot] = useState(() => deriveFrontendDomain(defaultBackendDomain));
  const [isSubmittingSite, setIsSubmittingSite] = useState(false);
  const [siteResult, setSiteResult] = useState(null);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(isArabic ? "تم النسخ للحافظة" : "Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch subscription info
  const fetchSubscription = async (domainToQuery) => {
    const domain = domainToQuery || targetDomain;
    try {
      setLoadingInfo(true);
      setFetchError(null);
      const res = await getSubscriptionInfo(domain);
      setSubscriptionData(res);

      if (res?.stdout) {
        const parsed = parseSubscriptionStdout(res.stdout);
        setParsedData(parsed);

        // If Plesk returned an explicit --WWW-Root-- folder, prefill wwwRoot with it
        if (parsed?.wwwRootFolder) {
          setWwwRoot(parsed.wwwRootFolder);
        } else {
          setWwwRoot(deriveFrontendDomain(domain));
        }
      } else if (res?.message) {
        setFetchError(res.message);
      }
    } catch (err) {
      console.error("Subscription info error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (isArabic ? "فشل في جلب بيانات الاشتراك" : "Failed to fetch subscription info");
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchSubscription(targetDomain);
  }, [targetDomain]);

  // Update target domain manually
  const handleApplyCustomDomain = (e) => {
    e.preventDefault();
    const cleaned = extractDomain(domainInputValue);
    if (!cleaned) {
      toast.error(isArabic ? "يرجى إدخال نطاق صالح" : "Please enter a valid domain");
      return;
    }
    setTargetDomain(cleaned);
    setIsEditingDomain(false);
    // Update default derived www-root
    setWwwRoot(deriveFrontendDomain(cleaned));
  };

  // Handle Create / Link Domain API
  const handleCreateSite = async (e) => {
    e.preventDefault();

    if (!clientDomain.trim()) {
      toast.error(
        isArabic
          ? "يرجى إدخال نطاق العميل (مثال: client-domain.com)"
          : "Please enter the client domain (e.g. client-domain.com)"
      );
      return;
    }

    if (!wwwRoot.trim()) {
      toast.error(
        isArabic
          ? "يرجى تحديد الـ WWW-Root (الدومين الفرعي للفرونت)"
          : "Please specify the WWW-Root"
      );
      return;
    }

    try {
      setIsSubmittingSite(true);
      setSiteResult(null);

      const res = await createSiteMapping({
        clientDomain: clientDomain.trim(),
        webspaceName: webspaceName.trim(),
        wwwRoot: wwwRoot.trim(),
      });

      setSiteResult(res);

      if (res?.code === 0) {
        toast.success(
          isArabic
            ? `تم ربط النطاق ${clientDomain} بنجاح!`
            : `Domain ${clientDomain} linked successfully!`
        );
      } else if (res?.stderr) {
        toast.error(res.stderr);
      } else {
        toast.info(res?.stdout || res?.message || "Operation completed");
      }
    } catch (err) {
      console.error("Create site error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.stderr ||
        err?.message ||
        (isArabic ? "فشل في ربط النطاق" : "Failed to link domain");
      toast.error(msg);
      setSiteResult({
        code: -1,
        stderr: msg,
      });
    } finally {
      setIsSubmittingSite(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm border border-red-100">
              <Server size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {isArabic ? "بيانات النطاق والاشتراك" : "Domain & Subscription Data"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isArabic
                  ? "معلومات اشتراك السيرفر (Plesk) وربط النطاقات المخصصة للفرونت إند"
                  : "Plesk subscription details & client custom domain linking"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchSubscription(targetDomain)}
            disabled={loadingInfo}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={16} className={loadingInfo ? "animate-spin text-red-600" : ""} />
            <span>{isArabic ? "تحديث البيانات" : "Refresh Info"}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Resolution Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: VITE_API_BASE_URL */}
          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-mono">
              <span>{isArabic ? "المتغير بالبيئة (ENV)" : "Environment Base URL"}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300">
                VITE_API_BASE_URL
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-200 truncate font-mono" title={envBaseUrl}>
              {envBaseUrl}
            </p>
          </div>

          {/* Card 2: Extracted Backend Domain */}
          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Database size={13} className="text-red-400" />
                {isArabic ? "نطاق الباك إند النشط" : "Active Backend Domain"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingDomain(!isEditingDomain)}
                className="text-[11px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
              >
                {isEditingDomain
                  ? (isArabic ? "إلغاء" : "Cancel")
                  : (isArabic ? "تغيير النطاق" : "Change")}
              </button>
            </div>

            {isEditingDomain ? (
              <form onSubmit={handleApplyCustomDomain} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={domainInputValue}
                  onChange={(e) => setDomainInputValue(e.target.value)}
                  placeholder="e.g. salesbcknd.systego.net"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  {isArabic ? "تطبيق" : "Apply"}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white font-mono tracking-wide">
                  {targetDomain}
                </p>
                <button
                  onClick={() => handleCopy(targetDomain, "backend")}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy"
                >
                  {copiedKey === "backend" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Derived Frontend Subdomain */}
          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Globe size={13} className="text-emerald-400" />
                {isArabic ? "السب دومين المشتق للفرونت" : "Derived Frontend Subdomain"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                -www-root
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-400 font-mono tracking-wide">
                {wwwRoot || deriveFrontendDomain(targetDomain)}
              </p>
              <button
                onClick={() => handleCopy(wwwRoot || deriveFrontendDomain(targetDomain), "front")}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy"
              >
                {copiedKey === "front" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {isArabic
                ? "يتحول تلقائياً من (api-xyz → xyz) أو (xyzbcknd → xyz)"
                : "Auto-converted: api-xyz → xyz or xyzbcknd → xyz"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Link Domain Form, Right = Subscription Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column: Link Custom Domain (4 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isArabic ? "ربط نطاق عميل مخصص" : "Link Client Domain"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isArabic
                    ? "إنشاء موقع فرعي في Plesk وربط الدومين بالفرونت"
                    : "Create Plesk site mapping with -www-root"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateSite} className="space-y-4">
            {/* Field 1: client-domain.com */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isArabic ? "نطاق العميل المخصص (Client Domain)" : "Client Custom Domain"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={clientDomain}
                  onChange={(e) => setClientDomain(e.target.value)}
                  placeholder="client-domain.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {isArabic
                  ? "الدومين الخاص بالعميل بدون https (مثل: mybrand.com)"
                  : "The client's domain without https (e.g. mybrand.com)"}
              </p>
            </div>

            {/* Field 2: -www-root */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {isArabic ? "مجلد الويب روت (-www-root)" : "Frontend WWW-Root"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {isArabic ? "ديناميكي من الباك" : "Auto Dynamic"}
                </span>
              </div>
              <div className="relative">
                <HardDrive size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={wwwRoot}
                  onChange={(e) => setWwwRoot(e.target.value)}
                  placeholder="Sales.systego.net"
                  className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm font-mono text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {isArabic
                  ? "اسم المجلد المستهدف للفرونت إند (مشتق تلقائياً ويمكن تعديله)"
                  : "Target folder for frontend (auto-calculated from backend subdomain)"}
              </p>
            </div>

            {/* Field 3: -webspace-name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isArabic ? "اسم مساحة الويب (-webspace-name)" : "Webspace Name"}
              </label>
              <input
                type="text"
                required
                value={webspaceName}
                onChange={(e) => setWebspaceName(e.target.value)}
                placeholder="systego.net"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Params Preview Pill */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "معاينة الأمر المرسل (CLI Payload):" : "Generated CLI Payload:"}
              </span>
              <p className="text-[11px] text-slate-800 break-all">
                --create <span className="font-bold text-blue-600">{clientDomain || "client-domain.com"}</span> -webspace-name{" "}
                <span className="font-bold">{webspaceName}</span> -hosting true -www-root{" "}
                <span className="font-bold text-emerald-600">{wwwRoot || "Sales.systego.net"}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingSite || !clientDomain.trim()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmittingSite ? (
                <>
                  <Activity size={18} className="animate-spin" />
                  <span>{isArabic ? "جاري ربط النطاق..." : "Linking Domain..."}</span>
                </>
              ) : (
                <>
                  <Globe size={18} />
                  <span>{isArabic ? "تنفيذ ربط النطاق الآن" : "Link & Create Domain"}</span>
                </>
              )}
            </button>
          </form>

          {/* Result Alert */}
          {siteResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                siteResult.code === 0
                  ? "bg-green-50 border-green-200 text-green-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {siteResult.code === 0 ? (
                  <CheckCircle2 size={18} className="text-green-600" />
                ) : (
                  <AlertTriangle size={18} className="text-red-600" />
                )}
                <span>
                  {siteResult.code === 0
                    ? (isArabic ? "نجحت العملية في Plesk!" : "Operation Succeeded in Plesk!")
                    : (isArabic ? "حدث خطأ أثناء التنفيذ" : "Execution Error")}
                </span>
              </div>
              {siteResult.stdout && (
                <p className="font-mono bg-white/70 p-2.5 rounded-lg border border-green-200 whitespace-pre-wrap">
                  {siteResult.stdout}
                </p>
              )}
              {siteResult.stderr && (
                <p className="font-mono bg-white/70 p-2.5 rounded-lg border border-red-200 whitespace-pre-wrap">
                  {siteResult.stderr}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Subscription Info Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Database size={20} className="text-red-600" />
                  <span>{isArabic ? "بيانات الاشتراك الحالي" : "Current Subscription Info"}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isArabic
                    ? `مستخرجة مباشرة من Plesk للنطاق: ${targetDomain}`
                    : `Fetched directly from Plesk for: ${targetDomain}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRawOutput(!showRawOutput)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal size={14} />
                  <span>{showRawOutput ? (isArabic ? "عرض البطاقات" : "Card View") : (isArabic ? "التقرير الخام (Raw)" : "Raw CLI Output")}</span>
                </button>
              </div>
            </div>

            {loadingInfo ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Activity size={36} className="animate-spin text-red-600" />
                <p className="text-sm font-medium">
                  {isArabic ? "جاري استدعاء بيانات Plesk..." : "Loading Plesk Subscription Data..."}
                </p>
              </div>
            ) : fetchError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle size={18} className="text-red-600" />
                  <span>{isArabic ? "تعذر جلب البيانات" : "Failed to load data"}</span>
                </div>
                <p className="text-xs font-mono">{fetchError}</p>
                <button
                  onClick={() => fetchSubscription(targetDomain)}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                >
                  {isArabic ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            ) : showRawOutput ? (
              /* Raw View */
              <div className="relative">
                <button
                  onClick={() => handleCopy(subscriptionData?.stdout || "", "raw")}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "raw" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{isArabic ? "نسخ الكل" : "Copy All"}</span>
                </button>
                <pre className="bg-gray-950 text-emerald-400 p-5 rounded-xl text-xs font-mono overflow-x-auto max-h-[550px] leading-relaxed">
                  {subscriptionData?.stdout || (isArabic ? "لا توجد مخرجات" : "No output")}
                </pre>
              </div>
            ) : (
              /* Structured Cards View */
              <div className="space-y-5">
                {/* General Info Card */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info size={14} className="text-blue-500" />
                    <span>{isArabic ? "البيانات العامة (General)" : "General Info"}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "اسم النطاق" : "Domain Name"}</p>
                      <p className="font-semibold text-gray-900 font-mono mt-0.5 truncate">
                        {parsedData?.general?.["Domain name"] || targetDomain}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "معرّف النطاق (ID)" : "Domain ID"}</p>
                      <p className="font-semibold text-gray-900 font-mono mt-0.5">
                        {parsedData?.general?.["Domain ID"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "حالة النطاق" : "Status"}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 mt-0.5">
                        <CheckCircle2 size={11} />
                        {parsedData?.general?.["Domain status"] || "OK"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "اسم جهة الاتصال" : "Owner"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.general?.["Owner's contact name"] || "Systego"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "تاريخ الإنشاء" : "Creation Date"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.general?.["Creation date"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "تاريخ الانتهاء" : "Expiration"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.general?.["Expiration date"] || "Unlimited"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hosting & Resources Card */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Server size={14} className="text-purple-500" />
                    <span>{isArabic ? "الاستضافة والموارد (Hosting & Resources)" : "Hosting & Resources"}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "عنوان IP السيرفر" : "Server IP"}</p>
                      <p className="font-bold text-purple-700 font-mono mt-0.5">
                        {parsedData?.hosting?.["IP Address"] || "62.84.185.153"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "اسم مستخدم FTP" : "FTP Login"}</p>
                      <p className="font-semibold text-gray-900 font-mono mt-0.5">
                        {parsedData?.hosting?.["FTP Login"] || "systego"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "نوع الاستضافة" : "Hosting Type"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.hosting?.["Hosting type"] || "Physical hosting"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "حجم القرص المستخدم" : "Disk Space"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.general?.["Size"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "حجم الترافيك الشهري" : "Monthly Traffic"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.general?.["Traffic"] || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "دعم PHP / FastCGI" : "PHP / FastCGI"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.hosting?.["FastCGI support"] === "Yes" ? "FastCGI (On)" : "Yes"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security & Certificate Card */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>{isArabic ? "الأمان والشهادات (SSL/TLS Security)" : "Security & SSL"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "دعم SSL/TLS" : "SSL/TLS Support"}</p>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 mt-0.5">
                        <Lock size={12} />
                        {parsedData?.hosting?.["SSL/TLS support"] || "On"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "التحويل التلقائي لـ HTTPS" : "SEO 301 Redirect"}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {parsedData?.hosting?.["Permanent SEO-safe 301 redirect from HTTP to HTTPS"] || "On"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[11px]">{isArabic ? "شهادة الأمان الحالية" : "Certificate Name"}</p>
                      <p className="font-semibold text-gray-900 font-mono text-[11px] mt-0.5 truncate" title={parsedData?.hosting?.["Certificate"]}>
                        {parsedData?.hosting?.["Certificate"] || "Let's Encrypt"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WWW-Root & Webspace Card */}
                {parsedData?.wwwRoot && (
                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          {isArabic ? "مسار الويب روت المكتشف (--WWW-Root--)" : "Detected Server WWW-Root"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(parsedData.wwwRoot, "wwwRoot")}
                        className="text-emerald-700 hover:text-emerald-900 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "wwwRoot" ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isArabic ? "نسخ المسار" : "Copy Path"}</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-emerald-950 mt-1.5 break-all bg-white/70 p-2 rounded-lg border border-emerald-200">
                      {parsedData.wwwRoot}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
