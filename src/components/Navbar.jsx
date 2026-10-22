import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, LogOut, RefreshCw, Search, X, Lock, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../translation/i18n';
import NotificationDropdown from "./NotificationDropdown";
import { hasPermission } from "@/lib/checkPermission";
import usePost from "@/hooks/usePost";
import { useTenantInfo } from "@/context/TenantContext";
import { toast } from "react-toastify";
import logo from "@/assets/logo.jpg";

export default function Navbar({ onToggleMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isControlPanel = location.pathname === "/";
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const inputRef = useRef(null);

  // hook خاص بعمل طلبات POST
  const { postData, loading: apiLoading } = usePost();

  // جلب بيانات المؤسسة والميزات
  const { features, refreshTenant } = useTenantInfo();
  const [isRefreshingTenant, setIsRefreshingTenant] = useState(false);

  // حالة عرض شاشة التحميل أثناء التحديث
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = () => navigate(-1);

  // فتح / إغلاق البحث
  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchParams({});
  };
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  // إعادة التهيئة عند الخروج من لوحة التحكم
  useEffect(() => {
    if (!isControlPanel) {
      setSearchOpen(false);
      setSearchValue("");
    }
  }, [isControlPanel]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  const handleLanguage = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.body.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  // بيانات النطاق الحالي (لوكال / سب دومين)
  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isSubdomain =
    parts.length > 2 && parts[0] !== "www" && parts[0] !== "systego";
  const isMainDomain = hostname === "systego.net";
  const showMasterRefreshBtn = isLocal || isMainDomain;
  // يظهر زر التحديث في اللوكال والسب دومين فقط
  const showUpdateBtn = isLocal || isSubdomain;

  /**
   * جلب اسم العميل من الرابط
   */
  const getClientPayload = () => {
    // نفس المنطق المستخدم بالأعلى
    if (isLocal) {
      return { clientName: "alexmuscle" };
    }
    if (isSubdomain) {
      return { clientName: parts[0] };
    }
    return {};
  };

  const handleUpdateVersion = async () => {
    try {
      setIsUpdating(true);
      const payload = getClientPayload();

      // 1. فحص النسخة (Check Version)
      const checkData = await postData(payload, "/api/admin/version-updater");

      if (checkData?.success && checkData?.data?.result?.success) {
        // 2. مزامنة الملفات بين الجهتين (Sync)
        const syncData = await postData(payload, "/api/admin/version-updater/sync");

        if (syncData) {
          // الانتظار قليلاً ليقرأ المستخدم رسالة النجاح ثم إعادة التحميل
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setIsUpdating(false);
        }
      } else {
        setIsUpdating(false);
      }
    } catch (error) {
      console.error("Update process failed:", error);
      setIsUpdating(false);
    }
  };

  // تحديث الماستر
  const handleRefreshMaster = async () => {
    try {
      setIsUpdating(true);

      // إرسال الطلب مع الـ API Key في الهيدر
      const response = await postData(
        {},
        "https://updater.systego.net/api/update/refresh-master",
        {
          headers: {
            "x-api-key": import.meta.env.VITE_REFRESH_MASTER_KEY,
          },
        },
      );

      if (response) {
        console.log("Master Refreshed Successfully");
      }
    } catch (error) {
      console.error("Refresh Master failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // تحديث بيانات المؤسسة
  const handleRefreshTenant = async () => {
    try {
      setIsRefreshingTenant(true);
      await refreshTenant();
      toast.success(
        isArabic
          ? "تم تحديث بيانات المؤسسة والاشتراك بنجاح"
          : "Tenant info refreshed successfully",
      );
    } catch (error) {
      console.error("Refresh Tenant failed:", error);
      toast.error(
        isArabic
          ? "فشل تحديث بيانات المؤسسة"
          : "Failed to refresh tenant info",
      );
    } finally {
      setIsRefreshingTenant(false);
    }
  };

  const handleGoToPOS = () => {
    if (!features?.havePOS) {
      toast.warning(
        isArabic
          ? "نظام نقاط البيع (POS) غير متاح في باقتك الحالية"
          : "POS is not available in your current package",
      );
      return;
    }
    // فتح نقطة البيع في تاب جديدة
    const posUrl = `${window.location.origin}/point-of-sale`;
    window.open(posUrl, "_blank");
  };

  return (
    <>
      <nav className="bg-white shadow-md px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center relative z-10 gap-2">
        {/* يسار الشريط */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {!isControlPanel && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-slate-700"
              title={isArabic ? "القائمة" : "Menu"}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {isControlPanel ? (
            /* البحث - في لوحة التحكم فقط */
            searchOpen ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={t("Searchmenu") + "..."}
                  className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button onClick={closeSearch} className="p-0.5">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-700 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all text-xs sm:text-sm font-medium border border-slate-200"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t("Searchmenu")}</span>
              </button>
            )
          ) : (
            /* زر الرجوع - في باقي الصفحات */
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-gray-900 p-1"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary rtl:rotate-180" />
              <span className="text-xs sm:text-sm font-medium text-secondary hidden xs:inline">
                {t("navbar.back")}
              </span>
            </button>
          )}
        </div>

        {/* المنتصف: اللوجو */}
        <div className="flex items-center justify-center flex-shrink-0">
          <img src={logo} alt="SysteGo Logo" className="h-8 sm:h-12 w-auto object-contain" />
        </div>

        {/* يمين الشريط */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* زر POS وشارة الترقية إذا كانت الميزة غير متوفرة */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleGoToPOS}
              disabled={!features?.havePOS}
              className={`flex items-center gap-1 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                features?.havePOS
                  ? "bg-secondary text-white hover:bg-opacity-90 cursor-pointer shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
              title={
                !features?.havePOS
                  ? isArabic
                    ? "نظام نقاط البيع (POS) غير متاح في باقتك - يتطلب ترقية"
                    : "POS requires plan upgrade"
                  : "POS"
              }
            >
              {!features?.havePOS && (
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
              )}
              <span>POS</span>
            </button>

            {!features?.havePOS && (
              <span
                className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg cursor-default select-none shadow-xs"
                title={isArabic ? "هذه الميزة تتطلب ترقية الباقة" : "This feature requires a plan upgrade"}
              >
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 flex-shrink-0" />
                <span>{isArabic ? "ترقية" : "Upgrade"}</span>
              </span>
            )}
          </div>

          {/* زر تحديث بيانات المؤسسة */}
          <button
            onClick={handleRefreshTenant}
            disabled={isRefreshingTenant}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50 transition-colors p-1 sm:p-1.5 hover:bg-emerald-50 rounded-lg"
            title={isArabic ? "تحديث بيانات المؤسسة" : "Refresh Tenant Info"}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshingTenant ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline text-[10px] font-bold">
              {isArabic ? "المؤسسة" : "TENANT"}
            </span>
          </button>

          {/* زر التحديث - يظهر في اللوكال والسب دومين فقط */}
          {showUpdateBtn && (
            <button
              onClick={handleUpdateVersion}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-1 text-secondary hover:text-blue-600 cursor-pointer disabled:opacity-50 p-1 rounded-lg hover:bg-slate-50"
              title={isArabic ? "تحديث الإصدار" : "Update Version"}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isUpdating || apiLoading ? "animate-spin" : ""}`}
              />
            </button>
          )}

          {/* زر تحديث الماستر */}
          {showMasterRefreshBtn && (
            <button
              onClick={handleRefreshMaster}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 cursor-pointer disabled:opacity-50 p-1 sm:p-1.5 rounded-lg hover:bg-orange-50"
              title={isArabic ? "تحديث الماستر (العروض التجريبية)" : "Refresh Master (Demos)"}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isUpdating || apiLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline text-[10px] font-bold">
                {isArabic ? "الماستر" : "MASTER"}
              </span>
            </button>
          )}

          {/* قائمة الإشعارات */}
          {hasPermission("notification", "View") && <NotificationDropdown />}

          {/* اختيار اللغة */}
          <select
            onChange={handleLanguage}
            value={i18n.language}
            className="bg-transparent text-secondary font-semibold text-xs sm:text-sm px-1 sm:px-2 py-1 outline-none cursor-pointer"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>

          {/* زر تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 text-secondary hover:text-gray-900 cursor-pointer p-1"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">
              {t("navbar.logout")}
            </span>
          </button>
        </div>
      </nav>

      {/* شاشة التحميل الكاملة أثناء التحديث */}
      {(isUpdating || apiLoading) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl">
            <RefreshCw className="w-12 h-12 text-secondary animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">
              {isArabic
                ? "جارٍ تحديث النظام، برجاء الانتظار..."
                : "Updating system, please wait..."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
