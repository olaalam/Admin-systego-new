import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../translation/i18n';
import NotificationDropdown from "./NotificationDropdown";
import { hasPermission } from "@/lib/checkPermission";
import usePost from "@/hooks/usePost"; // استيراد الـ Hook الخاص بك

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // استخدام الـ Hook الخاص بالـ Post
  const { postData, loading: apiLoading } = usePost();

  // حالة محلية للتحكم في الـ Full Screen Loader (اختياري، يمكن الاعتماد على apiLoading)
  const [isUpdating, setIsUpdating] = useState(false);

  // شرط الظهور على localhost فقط
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

  const getClientPayload = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    if (subdomain === 'systego' || subdomain === 'localhost') return {};
    return { clientName: subdomain };
  };

  const handleUpdateVersion = async () => {
    try {
      setIsUpdating(true);
      const payload = getClientPayload();

      // 1. طلب فحص النسخة (Check Version)
      // نستخدم postData ونمرر الـ URL يدوياً
      const checkData = await postData(payload, "/api/admin/version-updater");

      if (checkData?.success && checkData?.data?.result?.success) {
        const { frontend, backend } = checkData.data.result.data;

        const isFrontAddedEmpty = frontend?.diff?.added?.length === 0;
        const isBackAddedEmpty = backend?.diff?.added?.length === 0;

        let syncEndpoint = "";

        // تحديد الـ Endpoint بناءً على الشروط المطلوبة
        if (isFrontAddedEmpty && isBackAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync";
        } else if (isFrontAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync-frontend";
        } else if (isBackAddedEmpty) {
          syncEndpoint = "/api/admin/version-updater/sync-backend";
        } else {
          syncEndpoint = "/api/admin/version-updater/sync";
        }

        // 2. طلب المزامنة (Sync)
        const syncData = await postData(payload, syncEndpoint);

        // 3. لو الطلب نجح (usePost سيعيد الـ data لو success: true)
        if (syncData) {
          // استخدام reload بعد ثانية بسيطة لإعطاء فرصة للمستخدم لرؤية رسالة النجاح من الـ Toast
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setIsUpdating(false);
        }
      } else {
        setIsUpdating(false);
      }
    } catch (error) {
      console.error("Update Process Failed:", error);
      setIsUpdating(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative z-10">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-secondary">{t("navbar.back")}</span>
        </button>

        <h1 className="text-lg font-bold text-secondary">SysteGo</h1>

        <div className="flex items-center gap-4">

          {/* زرار التحديث يظهر فقط في الـ localhost */}
          {isLocalhost && (
            <button
              onClick={handleUpdateVersion}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-2 text-secondary hover:text-blue-600 cursor-pointer disabled:opacity-50"
              title="Update Version"
            >
              <RefreshCw className={`w-5 h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
            </button>
          )}

          {hasPermission("notification", "View") && <NotificationDropdown />}

          <select
            onChange={handleLanguage}
            value={i18n.language}
            className="bg-transparent text-secondary font-semibold px-2 py-1 outline-none cursor-pointer"
          >
            <option value='ar'>AR</option>
            <option value='en'>EN</option>
          </select>

          <button onClick={handleLogout} className="flex items-center gap-2 text-secondary hover:text-purple-600">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t("navbar.logout")}</span>
          </button>
        </div>
      </nav>

      {/* الـ Full Screen Loader يظهر أثناء العملية */}
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