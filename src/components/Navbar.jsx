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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const inputRef = useRef(null);

  // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù€ Hook Ø§Ù„Ø®Ø§Øµ Ø¨Ø§Ù„Ù€ Post Ù„Ø¹Ù…Ù„ Ø§Ù„Ù€ API Calls
  const { postData, loading: apiLoading } = usePost();

  // Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù€ Tenant Ùˆ Ø§Ù„Ù€ features
  const { features, refreshTenant } = useTenantInfo();
  const [isRefreshingTenant, setIsRefreshingTenant] = useState(false);

  // Ø­Ø§Ù„Ø© Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù€ Loader Ø§Ù„ÙƒØ¨ÙŠØ± ÙˆÙ‚Øª Ø§Ù„ØªØ­Ø¯ÙŠØ«
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
  // 1. Ø¶Ø¹ÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ù…ØªØºÙŠØ±Ø§Øª Ù‡Ù†Ø§ (Ø®Ø§Ø±Ø¬ Ø£ÙŠ Ø¯Ø§Ù„Ø©) Ù„ÙƒÙŠ ÙŠØ±Ø§Ù‡Ø§ Ø§Ù„Ù€ return
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Ø´Ø±Ø· Ø§Ù„Ù„ÙˆÙƒØ§Ù„ Ù‡ÙˆØ³Øª ÙˆØ§Ù„Ù€ Subdomain
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isSubdomain = parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'systego';
  const isMainDomain = hostname === "systego.net";
  const showMasterRefreshBtn = isLocal || isMainDomain;
  // Ø§Ù„Ù…ØªØºÙŠØ± Ø§Ù„Ø°ÙŠ Ø³Ù†Ø³ØªØ®Ø¯Ù…Ù‡ ÙÙŠ Ø§Ù„Ø£Ø³ÙÙ„ Ù„Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²Ø±Ø§Ø±
  const showUpdateBtn = isLocal || isSubdomain;

  /**
   * Ø¯Ø§Ù„Ø© Ù„Ø¬Ù„Ø¨ Ø§Ø³Ù… Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù…Ù† Ø§Ù„Ø±Ø§Ø¨Ø·
   */
  const getClientPayload = () => {
    // Ù†Ø³ØªØ®Ø¯Ù… Ù†ÙØ³ Ø§Ù„Ù…Ù†Ø·Ù‚ Ø§Ù„Ù„ÙŠ Ø­Ø¯Ø¯Ù†Ø§Ù‡ ÙÙˆÙ‚
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

      // 1. Ø·Ù„Ø¨ ÙØ­Øµ Ø§Ù„Ù†Ø³Ø®Ø© (Check Version)
      const checkData = await postData(payload, "/api/admin/version-updater");

      if (checkData?.success && checkData?.data?.result?.success) {

        // 2. Ø·Ù„Ø¨ Ø§Ù„Ù…Ø²Ø§Ù…Ù†Ø© Ø§Ù„ÙØ¹Ù„ÙŠ Ù„Ù„Ø¬Ù‡ØªÙŠÙ† (Sync) Ù„Ø¶Ù…Ø§Ù† Ø¹Ø¯Ù… ÙˆØ¬ÙˆØ¯ Ø£ÙŠ ÙÙ‚Ø¯ ÙÙŠ Ø§Ù„Ù…Ù„ÙØ§Øª
        const syncData = await postData(payload, "/api/admin/version-updater/sync");

        if (syncData) {
          // Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± Ù‚Ù„ÙŠÙ„Ø§Ù‹ Ù„ÙŠÙ‚Ø±Ø£ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­ Ù…Ù† Ø§Ù„Ù€ Toast Ø«Ù… Ø¹Ù…Ù„ Reload
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
  // Ø¯Ø§Ù„Ø© ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø§Ø³ØªØ±
  const handleRefreshMaster = async () => {
    try {
      setIsUpdating(true);

      // Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ù…Ø¹ Ø§Ù„Ù€ API Key ÙÙŠ Ø§Ù„Ù€ Headers
      // Ù…Ù„Ø§Ø­Ø¸Ø©: ØªØ£ÙƒØ¯ÙŠ Ø£Ù† usePost ØªØ¯Ø¹Ù… ØªÙ…Ø±ÙŠØ± Ø§Ù„Ù€ HeadersØŒ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù„Ø§ ØªØ¯Ø¹Ù…Ù‡Ø§
      // Ù‚Ø¯ ØªØ­ØªØ§Ø¬ÙŠÙ† Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… fetch Ù…Ø¨Ø§Ø´Ø±Ø© Ø£Ùˆ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù€ hook
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

  // Ø¯Ø§Ù„Ø© Ø±ÙŠÙØ±ÙŠØ´ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù€ Tenant
  const handleRefreshTenant = async () => {
    try {
      setIsRefreshingTenant(true);
      await refreshTenant();
      toast.success(
        i18n.language === "ar"
          ? "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³Ø© ÙˆØ§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø¨Ù†Ø¬Ø§Ø­"
          : "Tenant info refreshed successfully"
      );
    } catch (error) {
      console.error("Refresh Tenant failed:", error);
      toast.error(
        i18n.language === "ar"
          ? "ÙØ´Ù„ ØªØ­Ø¯ÙŠØ« Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³Ø©"
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
          ? "Ù†Ø¸Ø§Ù… Ù†Ù‚Ø§Ø· Ø§Ù„Ø¨ÙŠØ¹ (POS) ØºÙŠØ± Ù…ØªØ§Ø­ ÙÙŠ Ø¨Ø§Ù‚ØªÙƒ Ø§Ù„Ø­Ø§Ù„ÙŠØ©"
          : "POS is not available in your current package"
      );
      return;
    }
    // Ø¨ÙŠØ¬ÙŠØ¨ Ø§Ù„Ù€ origin Ø§Ù„Ø­Ø§Ù„ÙŠ ÙˆÙŠØ¶ÙŠÙ Ø¹Ù„ÙŠÙ‡ Ø§Ù„Ù…Ø³Ø§Ø±
    const posUrl = `${window.location.origin}/point-of-sale`;
    // '_blank' Ø¨ØªØ®Ù„ÙŠ Ø§Ù„Ù…ØªØµÙØ­ ÙŠÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· ÙÙŠ ØªØ§Ø¨ Ø¬Ø¯ÙŠØ¯Ø©
    window.open(posUrl, '_blank');
  };

  return (
    <>
      <nav className="bg-white shadow-md px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center relative z-10 gap-2">

        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {!isControlPanel && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-slate-700"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {isControlPanel ? (
            /* Search area - only on Control Panel */
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
            /* Back button - on all other pages */
            <button onClick={handleBack} className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-gray-900 p-1">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary rtl:rotate-180" />
              <span className="text-xs sm:text-sm font-medium text-secondary hidden xs:inline">{t("navbar.back")}</span>
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center flex-shrink-0">
          <img src={logo} alt="SysteGo Logo" className="h-8 sm:h-12 w-auto object-contain" />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

          {/* Ø²Ø± POS ÙˆØ´Ø§Ø±Ø© Ø§Ù„ØªØ±Ù‚ÙŠØ© Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù…ÙŠØ²Ø© ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© */}
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
                  ? (i18n.language === "ar" ? "Ù†Ø¸Ø§Ù… Ù†Ù‚Ø§Ø· Ø§Ù„Ø¨ÙŠØ¹ (POS) ØºÙŠØ± Ù…ØªØ§Ø­ ÙÙŠ Ø¨Ø§Ù‚ØªÙƒ - ÙŠØªØ·Ù„Ø¨ ØªØ±Ù‚ÙŠØ©" : "POS requires plan upgrade")
                  : "POS"
              }
            >
              {!features?.havePOS && <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />}
              <span>POS</span>
            </button>

            {!features?.havePOS && (
              <span
                className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg cursor-default select-none shadow-xs"
              title="This feature requires a plan upgrade"
              >
                <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 flex-shrink-0" />
                <span>{i18n.language === "ar" ? "ØªØ±Ù‚ÙŠØ©" : "Upgrade"}</span>
              </span>
            )}
          </div>

          {/* Admin Panel upgrade indicator */}
          {features?.haveAdminPanel === false && (
            <span
              className="hidden sm:flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg cursor-default select-none shadow-xs"
              title="Admin Panel requires plan upgrade"
            >
              <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 flex-shrink-0" />
              <span>Admin Panel - Upgrade</span>
            </span>
          )}

          {/* Ø²Ø± Ø±ÙŠÙØ±ÙŠØ´ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù€ Tenant */}
          <button
            onClick={handleRefreshTenant}
            disabled={isRefreshingTenant}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50 transition-colors p-1 sm:p-1.5 hover:bg-emerald-50 rounded-lg"
              title="Refresh Tenant Info"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshingTenant ? "animate-spin" : ""}`} />
            <span className="hidden md:inline text-[10px] font-bold">TENANT</span>
          </button>

          {/* Ø²Ø± Ø§Ù„ØªØ­Ø¯ÙŠØ« - ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„Ù€ localhost ÙˆØ§Ù„Ù€ subdomains ÙÙ‚Ø· */}
          {showUpdateBtn && (
            <button
              onClick={handleUpdateVersion}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-1 text-secondary hover:text-blue-600 cursor-pointer disabled:opacity-50 p-1 rounded-lg hover:bg-slate-50"
              title="Update Version"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
            </button>
          )}

          {/* Ø²Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø§Ø³ØªØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯ */}
          {showMasterRefreshBtn && (
            <button
              onClick={handleRefreshMaster}
              disabled={isUpdating || apiLoading}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 cursor-pointer disabled:opacity-50 p-1 sm:p-1.5 rounded-lg hover:bg-orange-50"
              title="Refresh Master (Demos)"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${(isUpdating || apiLoading) ? "animate-spin" : ""}`} />
              <span className="hidden md:inline text-[10px] font-bold">MASTER</span>
            </button>
          )}

          {/* Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª */}
          {hasPermission("notification", "View") && <NotificationDropdown />}

          {/* Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù„ØºØ© */}
          <select
            onChange={handleLanguage}
            value={i18n.language}
            className="bg-transparent text-secondary font-semibold text-xs sm:text-sm px-1 sm:px-2 py-1 outline-none cursor-pointer"
          >
            <option value='ar'>AR</option>
            <option value='en'>EN</option>
          </select>

          {/* Ø²Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ */}
          <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-2 text-secondary hover:text-gray-900 cursor-pointer p-1">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">{t("navbar.logout")}</span>
          </button>
        </div>
      </nav>

      {/* Ø´Ø§Ø´Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø£Ø«Ù†Ø§Ø¡ Ø¹Ù…Ù„ÙŠØ© Ø§Ù„ØªØ­Ø¯ÙŠØ« */}
      {(isUpdating || apiLoading) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl">
            <RefreshCw className="w-12 h-12 text-secondary animate-spin mb-4" />
            <p className="text-lg font-bold text-gray-800">
              {i18n.language === 'ar' ? 'Ø¬Ø§Ø±ÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†Ø¸Ø§Ù…ØŒ Ø¨Ø±Ø¬Ø§Ø¡ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±...' : 'Updating system, please wait...'}
            </p>
          </div>
        </div>
      )}

    </>
  );
}

