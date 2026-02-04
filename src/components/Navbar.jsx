import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../translation/i18n';
export default function Navbar() {
  const navigate = useNavigate();
  const { t ,i18n } = useTranslation();

  const handleBack = () => {
    navigate(-1); // 👈 يرجع خطوة ورا
  };

  const handleLogout = () => {
    // احذف بيانات اليوزر (token/session)
    localStorage.removeItem("token");
    localStorage.clear();
    // روح لصفحة الـ login
    navigate("/login");
  };
const handleLanguage = (event) => {
  const newLang = event.target.value;
  i18n.changeLanguage(newLang);
  localStorage.setItem('language', newLang);
  
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
};
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 text-secondary" />
        <span className="text-sm font-medium text-secondary">{t("navbar.back")}</span>
      </button>

      {/* Logo / Title */}
      <h1 className="text-lg font-bold text-secondary">SysteGo</h1>
  {/* Language Selector */}
      <select
        onChange={handleLanguage}
        value={i18n.language}
        className="flex gap-1 items-center justify-center bg-black text-white px-2 py-1 rounded"
      >
        <option value='ar'>AR</option>
        <option value='en'>EN</option>
      </select>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-secondary hover:text-purple-600 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">{t("navbar.logout")}</span>
      </button>
    </nav>
  );
}
