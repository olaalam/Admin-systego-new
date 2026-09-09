import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, LogOut, RefreshCw, Search, X, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../translation/i18n';
import NotificationDropdown from "./NotificationDropdown";
import { hasPermission } from "@/lib/checkPermission";
import usePost from "@/hooks/usePost";
import { useTenantInfo } from "@/context/TenantContext";
import { toast } from "react-toastify";
import logo from "@/assets/logo.jpg";
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isControlPanel = location.pathname === "/";
  const { t, i18n } = useTranslation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const inputRef = useRef(null);

  // استخدام الـ Hook الخاص بالـ Post لعمل الـ API Calls
  const { postData, loading: apiLoading } = usePost();

  // جلب بيانات الـ Tenant و الـ features
  const { features, refreshTenant } = useTenantInfo();
  const [isRefreshingTenant, setIsRefreshingTenant] = useState(false);

  // حالة لعرض الـ Loader الكبير وقت التحديث
  const [isUpdating, setIsUpdating] = useState(false);


  const handleBack = () => navigate(-1);

  // Open/close search
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

  // Reset when leaving Control Panel
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
    localStorage.setItem('language', newLang);
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };
  // 1. ضعي هذه المتغيرات هنا (خارج أي دالة) لكي يراها الـ return
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // شرط اللوكال هوست والـ Subdomain
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isSubdomain = parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'systego';
  const isMainDomain = hostname === "systego.net";
  const showMasterRefreshBtn = isLocal || isMainDomain;
  // المتغير الذي سنستخدمه في الأسفل لإظهار الزرار
  const showUpdateBtn = isLocal || isSubdomain;

  /**
   * دالة لجلب اسم العميل من الرابط
   */
  const getClientPayload = () => {
    // نستخدم نفس المنطق اللي حددناه فوق
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

      // 1. طلب فحص النسخة (Check Version)
      const checkData = await postData(payload, "/api/admin/version-updater");

      if (checkData?.success && checkData?.data?.result?.success) {

        // 2. طلب المزامنة الفعلي للجهتين (Sync) لضمان عدم وجود أي فقد في الملفات
        const syncData = await postData(payload, "/api/admin/version-updater/sync");

        if (syncData) {
          // الانتظار قليلاً ليقرأ المستخدم رسالة النجاح من الـ Toast ثم عمل Reload
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
  // دالة تحديث الماستر
  const handleRefreshMaster = async () => {
    try {
      setIsUpdating(true);

      // إرسال الطلب مع الـ API Key في الـ Headers
      // ملاحظة: تأكدي أن usePost تدعم تمرير الـ Headers، إذا كانت لا تدعمها
      // قد تحتاجين لاستخدام fetch مباشرة أو تعديل الـ hook
      const response = await postData({}, "https://updater.systego.net/api/update/refresh-master", {
        headers: {
          "x-api-key": import.meta.env.VITE_REFRESH_MASTER_KEY
        }
      });

      if (response) {
        console.log("Master Refreshed Successfully");
      }
    } catch (error) {
      console.error("Refresh Master failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // دالة ريفريش بيانات الـ Tenant
  const handleRefreshTenant = async () => {
    try {
      setIsRefreshingTenant(true);
      await refreshTenant();
      toast.success(
        i18n.language === "ar"
          ? "تم تحديث بيانات المؤسسة والاشتراك بنجاح"
          : "Tenant info refreshed successfully"
      );
    } catch (error) {
      console.error("Refresh Tenant failed:", error);
      toast.error(
        i18n.language === "ar"
          ? "فشل تحديث بيانات المؤسسة"
          : "Failed to refresh tenant info"
      );
    } finally {
      setIsRefreshingTenant(false);
    }
  };

  const handleGoToPOS = () => {
    if (!features?.havePOS) {
      toast.warning(
        i18n.language === "ar"
          ? "نظام نقاط البيع (POS) غير متاح في باقتك الحالية"
          : "POS is not available in your current package"
      );
      return;
    }
    // بيجيب الـ origin الحالي ويضيف عليه المسار
    const posUrl = `${window.location.origin}/point-of-sale`;
    // '_blank' بتخلي المتصفح يفتح الرابط في تاب جديدة
    window.open(posUrl, '_blank');
  };

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative z-10">

        {/* Left side */}
        <div className="flex items-center gap-3">
          {isControlPanel ? (
            /* Search area - only on Control Panel */
            searchOpen ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64 transition-all">
                <Search className="w-6 h-6 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={t("Searchmenu") + "..."}
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button onClick={closeSearch}>
                  <X className="w-6 h-6 text-slate-400 hover:text-slate-700 transition-colors" />
                </button>
              </div>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all text-sm font-medium border border-slate-200"
              >
                <Search className="w-6 h-6" />
                <span className="hidden sm:inline">{t("Searchmenu")}</span>
              </button>
            )
          ) : (
            /* Back button - on all other pages */
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">{t("navbar.back")}</span>
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex items-center">
          <img src={logo} alt="SysteGo Logo" className="h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">

          {/* زر POS وشارة الترقية إذا كانت الميزة غير متوفرة */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToPOS}
              disabled={!features?.havePOS}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                features?.havePOS
                  ? "bg-secondary text-white hover:bg-opacity-90 cursor-pointer shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
              title={
                !features?.havePOS
                  ? (i18n.language === "ar" ? "نظام نقاط البيع (POS) غير متاح في باقتك - يتطلب ترقية" : "POS requires plan upgrade")
                  : "POS"
              }
            >
              {!features?.havePOS && <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              <span>POS</span>
            </button>

            {!features?.havePOS && (
              <span
                className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-1 rounded-lg cursor-default select-none shadow-xs"
                title={i18n.language === "ar" ? "هذه الميزة تتطلب ترقية باقتك الحالية" : "This feature requires a plan upgrade"}
              >
                <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                <span>{i18n.language === "ar" ? "يتطلب ترقية" : "Upgrade"}</span>
              </span>
            )}
          </div>

          {/* زر ريفريش بيانات الـ Tenant */}
          <button
            onClick={handleRefreshTenant}
            disabled={isRefreshingTenant}
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50 transition-colors p-1.5 hover:bg-emerald-50 rounded-lg"
            title={i18n.language === "ar" ? "تحديث بيانات المؤسسة والاشتراك" : "Refresh Tenant Info"}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingTenant ? "animate-spin" : ""}`} />
            <span className="text-[10px] font-bold">TENANT</span>
          </button>

          {/* زر التحديث - يظهر في الـ localhost والـ subdomains فقط */}
          {showUpdateBtn && (
            <button
              onClick={handleUpdateVersion}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-2 text-secondary hover:text-blue-600 cursor-pointer disabled:opacity-50"
              title="Update Version"
            >
              <RefreshCw className={`w-5 h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
            </button>
          )}
          {/* زر تحديث الماستر الجديد */}
          {showMasterRefreshBtn && (
            <button
              onClick={handleRefreshMaster}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 cursor-pointer disabled:opacity-50"
              title="Refresh Master (Demos)"
            >
              <RefreshCw className={`w-5 h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-bold">MASTER</span>
            </button>
          )}

          {/* قائمة الإشعارات */}
          {hasPermission("notification", "View") && <NotificationDropdown />}

          {/* اختيار اللغة */}
          <select
            onChange={handleLanguage}
            value={i18n.language}
            className="bg-transparent text-secondary font-semibold px-2 py-1 outline-none cursor-pointer"
          >
            <option value='ar'>AR</option>
            <option value='en'>EN</option>
          </select>

          {/* زر تسجيل الخروج */}
          <button onClick={handleLogout} className="flex items-center gap-2 text-secondary hover:text-gray-900 cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t("navbar.logout")}</span>
          </button>
        </div>
      </nav>

      {/* شاشة التحميل الكاملة أثناء عملية التحديث */}
      {(isUpdating || apiLoading) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl">
            <RefreshCw className="w-12 h-12 text-secondary animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">
              {i18n.language === 'ar' ? 'جاري تحديث النظام، برجاء الانتظار...' : 'Updating system, please wait...'}
            </p>
          </div>
        </div>
      )}

    </>
  );
}