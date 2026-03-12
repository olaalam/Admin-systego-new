import React, { useState, useEffect } from "react";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <img src={logo} alt="logo" className="w-32 h-32 mx-auto mb-8 object-contain" />
        </div>

        {/* Icon & Error Code */}
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <p className="text-xl font-semibold text-gray-700 mb-4">{t("unauthorized_access") || "Unauthorized Access"}</p>
        </div>

        {/* Message */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-gray-500 mb-8 px-4">
            {t("unauthorized_description") || "You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error."}
          </p>
        </div>

        {/* Buttons */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 px-6 rounded-xl font-medium hover:bg-slate-700 transition-all shadow-sm active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>{t("go_home") || "Back to Dashboard"}</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 py-3 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("go_back") || "Go Back"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
