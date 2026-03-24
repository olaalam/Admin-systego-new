import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  LayoutDashboard,
  Layers,
  CreditCard,
  Megaphone,
  ShoppingCart,
  Warehouse,
  MonitorPlay,
  Contact2,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.jpg";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/analytics" },
  {
    name: "Product Management",
    icon: Layers,
    children: [
      { name: "Products", path: "/product", module: AppModules.PRODUCT },
      { name: "Category", path: "/category", module: AppModules.CATEGORY },
      { name: "Brand", path: "/brand", module: AppModules.BRAND },
      { name: "Attribute", path: "/attribute", module: AppModules.VARIATION },
      { name: "Units", path: "/unit", module: AppModules.UNITS },
    ],
  },
  {
    name: "Financial",
    icon: CreditCard,
    children: [
      { name: "Financial", path: "/accounting", module: AppModules.FINANCIAL_ACCOUNT },
      { name: "Taxes", path: "/taxes", module: AppModules.TAXES },
      { name: "Expenses", path: "/expense", module: AppModules.EXPENSE_ADMIN },
      { name: "Expense Categories", path: "/expense-category", module: AppModules.EXPENSE_CATEGORY },
      { name: "Revenue", path: "/revenue", module: AppModules.REVENUE },
      { name: "Payment Methods", path: "/payment_method", module: AppModules.PAYMENT_METHOD },
      { name: "Payments", path: "/payments", module: AppModules.PAYMENT },
      { name: "Payment Ecommerce", path: "/payment-eco", module: AppModules.PAYMENT_ECO },
    ],
  },
  {
    name: "Marketing",
    icon: Megaphone,
    children: [
      { name: "Popups", path: "/popup", module: AppModules.POPUP },
      { name: "Points", path: "/point", module: AppModules.POINT },
      { name: "Redeem Points", path: "/redeem-point", module: AppModules.REDEEM_POINTS },
      { name: "Bundles", path: "/pandel", module: AppModules.PANDEL },
      { name: "Coupon", path: "/coupon", module: AppModules.COUPON },
      { name: "Banner", path: "/banner", module: AppModules.BANNER },
      { name: "Discounts", path: "/discount", module: AppModules.DISCOUNT },
      { name: "Shipping", path: "/shipping", module: AppModules.SHIPPING },
      { name: "Free Shipping Products", path: "/free-shipping-products", module: AppModules.FREE_SHIPPING_PRODUCTS },

    ],
  },
  {
    name: "Ecommerce",
    icon: ShoppingCart,
    path: "/ecommerce",
  },
  {
    name: "Inventory",
    icon: Warehouse,
    children: [
      { name: "Warehouse", path: "/warehouse", module: AppModules.WAREHOUSE },
      { name: "Transfers", path: "/transfer", module: AppModules.TRANSFER },
      { name: "Purchase", path: "/purchase", module: AppModules.PURCHASE },
      { name: "Returns", path: "/purchase-return", module: AppModules.PURCHASE_RETURN },
    ],
  },
  {
    name: "POS",
    icon: MonitorPlay,
    children: [
      { name: "Cashier", path: "/cashier", module: AppModules.CASHIER },
    ],
  },
  {
    name: "CRM",
    icon: Contact2,
    children: [
      { name: "Suppliers", path: "/supplier", module: AppModules.SUPPLIER },
      { name: "Customers", path: "/customer", module: AppModules.CUSTOMER },
      { name: "Customer Groups", path: "/customer-group", module: AppModules.CUSTOMER_GROUP },
    ],
  },
  {
    name: "HRM",
    icon: Users,
    children: [
      { name: "Admin", path: "/admin", module: AppModules.ADMIN },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Cashier Shifts", path: "/cashier-shift", module: AppModules.CASHIER_SHIFT_REPORT },
      { name: "Orders Report", path: "/orders-reports", module: AppModules.ORDERS_REPORT },
      { name: "Product Report", path: "/product-reports", module: AppModules.PRODUCT_REPORT },
      { name: "Financial Report", path: "/financial-reports", module: AppModules.FINANCIAL_REPORT },
      { name: "Product Movement Report", path: "/product-movement-report", module: AppModules.PRODUCT_MOVEMENT },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "Barcode", path: "/barcode", module: AppModules.PRODUCT },
      { name: "Cities", path: "/city", module: AppModules.CITY },
      { name: "Country", path: "/country", module: AppModules.COUNTRY },
      { name: "Zones", path: "/zone", module: AppModules.ZONE },
      { name: "Permissions", path: "/permission", module: AppModules.PERMISSION },
      { name: "Currencies", path: "/currency", module: AppModules.CURRENCY },
      { name: "Decimal Settings", path: "/decimal-setting", module: AppModules.DECIMAL_SETTING },
      { name: "Service Fees", path: "/service-fees", module: AppModules.SERVICE_FEES },
      { name: "Couriers", path: "/courier", module: AppModules.COURIER },
    ],
  },
];

// Colour accent per module
const moduleAccents = {
  "Dashboard": "text-blue-500   bg-blue-50",
  "Product Management": "text-rose-500   bg-rose-50",
  "Financial": "text-emerald-500 bg-emerald-50",
  "Marketing": "text-amber-500  bg-amber-50",
  "Ecommerce": "text-indigo-500 bg-indigo-50",
  "Inventory": "text-orange-500 bg-orange-50",
  "POS": "text-cyan-500   bg-cyan-50",
  "CRM": "text-violet-500 bg-violet-50",
  "HRM": "text-pink-500   bg-pink-50",
  "Reports": "text-slate-700  bg-slate-100",
  "Settings": "text-gray-600   bg-gray-100",
};

const moduleIconBg = {
  "Dashboard": "bg-blue-500",
  "Product Management": "bg-rose-500",
  "Financial": "bg-emerald-500",
  "Marketing": "bg-amber-500",
  "Ecommerce": "bg-indigo-500",
  "Inventory": "bg-orange-500",
  "POS": "bg-cyan-500",
  "CRM": "bg-violet-500",
  "HRM": "bg-pink-500",
  "Reports": "bg-slate-700",
  "Settings": "bg-gray-600",
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userPermissions = user.permissions || [];
  const isSuperAdmin = user.role === "superadmin" || user.role_name?.toLowerCase() === "super admin";

  // Permission check
  const canViewModule = (moduleName) => {
    if (isSuperAdmin || !moduleName) return true;
    return userPermissions.some(
      (p) => p.module.toLowerCase() === moduleName.toLowerCase() &&
        p.actions.some(a => a.action === "View")
    );
  };

  // Find which module group the current path belongs to
  const activeModuleGroup = menuItems.find(item =>
    item.children?.some(child => {
      // Use exact match for shallow paths to avoid prefix overlap (e.g., /product vs /product-movement)
      if (child.path === location.pathname) return true;
      // For children with sub-paths (like /product/add), check if the base matches
      const pathParts = location.pathname.split('/');
      const childParts = child.path.split('/');
      return childParts[1] === pathParts[1] && childParts.length <= pathParts.length;
    }) ||
    (item.path && location.pathname === item.path && item.path !== "/analytics")

  );

  // Items to show: only the active module's children
  const moduleChildren = activeModuleGroup?.children
    ? activeModuleGroup.children.filter(child => canViewModule(child.module))
    : activeModuleGroup
      ? [{ name: activeModuleGroup.name, path: activeModuleGroup.path }]
      : [];

  // Filtered by search
  const filteredChildren = searchQuery.trim()
    ? moduleChildren.filter(child =>
      t(child.name).toLowerCase().includes(searchQuery.toLowerCase())
    )
    : moduleChildren;

  const ModuleIcon = activeModuleGroup?.icon;
  const accentClass = activeModuleGroup ? moduleAccents[activeModuleGroup.name] || "text-slate-600 bg-slate-100" : "";
  const iconBgClass = activeModuleGroup ? moduleIconBg[activeModuleGroup.name] || "bg-slate-600" : "";

  // ── Shared sidebar content ─────────────────────────────────────────────────
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo + collapse button */}
      <div className={`flex items-center h-20 px-5 border-b border-slate-100 flex-shrink-0 ${desktopCollapsed && !isMobile ? "justify-center" : "justify-between"}`}>
        {(!desktopCollapsed || isMobile) && (
          <img src={logo} alt="logo" className="h-10 object-contain" />
        )}
        {!isMobile && (
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Module header */}
      {activeModuleGroup && (!desktopCollapsed || isMobile) && (
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <div className={`flex items-center gap-3 p-3 rounded-2xl ${accentClass}`}>
            {ModuleIcon && (
              <div className={`w-8 h-8 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0`}>
                <ModuleIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-black text-sm tracking-tight truncate">
              {t(activeModuleGroup.name)}
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      {(!desktopCollapsed || isMobile) && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t("Searchmenu")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-200 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {filteredChildren.length > 0 ? (
          filteredChildren.map((child, i) => {
            const isActive = location.pathname === child.path || (child.path !== "/" && location.pathname.startsWith(child.path + "/"));

            return (
              <Link
                key={i}
                to={child.path}
                onClick={() => { setMobileOpen(false); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${isActive
                  ? `${accentClass} font-bold shadow-sm`
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  } ${desktopCollapsed && !isMobile ? "justify-center px-2" : ""}`}
                title={desktopCollapsed && !isMobile ? t(child.name) : ""}
              >
                {(!desktopCollapsed || isMobile) && (
                  <span className="truncate">{t(child.name)}</span>
                )}
                {desktopCollapsed && !isMobile && (
                  <span className="text-[10px] text-center leading-tight">{t(child.name).slice(0, 2)}</span>
                )}
              </Link>
            );
          })
        ) : (
          <p className="text-center text-slate-400 text-xs py-6 italic">{t("Noresultsfound")}</p>
        )}
      </nav>

      {/* Back to Control Panel */}
      <div className="px-3 pb-5 flex-shrink-0 border-t border-slate-100 pt-4">
        <button
          onClick={() => { navigate("/"); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium ${desktopCollapsed && !isMobile ? "justify-center" : ""
            }`}
          title={desktopCollapsed && !isMobile ? t("ControlPanel") : ""}
        >
          <LayoutGrid className="w-4 h-4 flex-shrink-0" />
          {(!desktopCollapsed || isMobile) && (
            <span className="truncate">{t("ControlPanel")}</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-50">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        {activeModuleGroup && (
          <span className="text-sm font-black text-slate-700">{t(activeModuleGroup.name)}</span>
        )}
        {!activeModuleGroup && <img src={logo} alt="logo" className="h-7" />}
        <div className="w-9" />
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <div className="h-full bg-white">
            <SidebarContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-white border-r border-slate-100 transition-all duration-300 relative z-40 flex-shrink-0 ${desktopCollapsed ? "w-16" : "w-64"
          }`}
      >
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
}
