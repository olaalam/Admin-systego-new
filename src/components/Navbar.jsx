import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../translation/i18n';
import NotificationDropdown from "./NotificationDropdown";
import { hasPermission } from "@/lib/checkPermission";
import usePost from "@/hooks/usePost";

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // استخدام الـ Hook الخاص بالـ Post لعمل الـ API Calls
  const { postData, loading: apiLoading } = usePost();

  // حالة لعرض الـ Loader الكبير وقت التحديث
  const [isUpdating, setIsUpdating] = useState(false);

  // شرط لإظهار الزرار فقط أثناء التطوير على localhost
  const isLocalhost = window.location.hostname === "localhost" || window.location.origin.includes("localhost:5173");

  const handleBack = () => navigate(-1);

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

  /**
   * دالة لجلب اسم العميل من الرابط
   * مثال: olaa.systego.net -> clientName: "olaa"
   * مثال: systego.net -> {} (فاضي)
   */
  const getClientPayload = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // لو الرابط فيه Subdomain (أكثر من جزأين وغير "www" أو "systego")
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'systego') {
      return { clientName: parts[0] };
    }
    return {}; // لا نرسل clientName في حالة الدومين الأساسي أو localhost
  };

  const handleUpdateVersion = async () => {
    try {
      setIsUpdating(true);
      const payload = getClientPayload();

      // 1. طلب فحص النسخة (Check Version)
      const checkData = await postData(payload, "/api/admin/version-updater");

      if (checkData?.success && checkData?.data?.result?.success) {
        const { frontend, backend } = checkData.data.result.data;

        // التحقق من المصفوفات الفارغة بناءً على طلبك
        const isFrontAddedEmpty = frontend?.diff?.added?.length === 0;
        const isBackAddedEmpty = backend?.diff?.added?.length === 0;

        let syncEndpoint = "";

        // تحديد الـ Endpoint المناسب للمزامنة
        if (isFrontAddedEmpty && isBackAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync";
        } else if (isFrontAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync-frontend";
        } else if (isBackAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync-backend";
        } else {
          syncEndpoint = "/api/admin/version-updater/sync";
        }

        // 2. طلب المزامنة الفعلي (Sync)
        const syncData = await postData(payload, syncEndpoint);

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

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative z-10">
        {/* زر العودة */}
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-secondary">{t("navbar.back")}</span>
        </button>

        {/* عنوان الموقع */}
        <h1 className="text-lg font-bold text-secondary">SysteGo</h1>

        <div className="flex items-center gap-4">

          {/* زر التحديث - يظهر فقط في البيئة المحلية (localhost) ومع الصلاحية */}
          {isLocalhost && hasPermission("version", "Update") && (
            <button
              onClick={handleUpdateVersion}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-2 text-secondary hover:text-blue-600 cursor-pointer disabled:opacity-50"
              title="Update Version"
            >
              <RefreshCw className={`w-5 h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
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
          <button onClick={handleLogout} className="flex items-center gap-2 text-secondary hover:text-purple-600 cursor-pointer">
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