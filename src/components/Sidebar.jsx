import { Link } from "react-router-dom";
import { Menu, ChevronDown, ChevronUp, MapPin, Search, X } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { useTranslation } from "react-i18next";
import { AppModules } from "@/config/modules";

import {
  LayoutDashboard,
  Package,
  Layers,       // Product Management
  CreditCard,   // Financial
  Megaphone,    // Marketing
  Settings,     // Settings
  Warehouse,    // Inventory
  Contact2,     // CRM
  Users,        // HRM (بقيت كما هي لأنها معبرة)
  BarChart3,    // Reports
  History,
  Puzzle,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "Product Management",
    icon: Layers, // تم التغيير من Package إلى Layers لتعبر عن إدارة التصنيفات والمنتجات
    children: [
      { name: "Products", path: "/product", module: AppModules.PRODUCT },
      { name: "Category", path: "/category", module: AppModules.CATEGORY },
      { name: "Brand", path: "/brand", module: AppModules.BRAND },
      { name: "Attribute", path: "/attribute", module: AppModules.VARIATION },
      { name: "Unit", path: "/unit", module: AppModules.UNITS },
    ],
  },
  {
    name: "Financial",
    icon: CreditCard, // تم التغيير من BookOpen لتعبر عن المعاملات المالية
    children: [
      { name: "Financial", path: "/accounting", module: AppModules.FINANCIAL_ACCOUNT },
      { name: "Taxes", path: "/taxes", module: AppModules.TAXES },
      { name: "Discount", path: "/discount", module: AppModules.DISCOUNT },
      { name: "Expenses", path: "/expense", module: AppModules.EXPENSE_ADMIN },
      { name: "ExpensesCategory", path: "/expense-category", module: AppModules.EXPENSE_CATEGORY },
      { name: "Revenue", path: "/revenue", module: AppModules.REVENUE },
      { name: "PaymentMethod", path: "/payment_method", module: AppModules.PAYMENT_METHOD },
      { name: "Payments", path: "/payments", module: AppModules.PAYMENT },
    ],
  },
  {
    name: "Marketing",
    icon: Megaphone, // تم التغيير لتعبر عن الحملات التسويقية والـ Popups
    children: [
      { name: "Popup", path: "/popup", module: AppModules.POPUP },
      { name: "Point", path: "/point", module: AppModules.POINT },
      { name: "RedeemPoint", path: "/redeem-point", module: AppModules.REDEEM_POINTS },
      { name: "Bundels", path: "/pandel", module: AppModules.PANDEL },
      { name: "Coupon", path: "/coupon", module: AppModules.COUPON },
    ],
  },
  {
    name: "Settings",
    icon: Settings, // تم التغيير من SlidersHorizontal لشكل الترس التقليدي للإعدادات
    children: [
      { name: "Barcode", path: "/barcode", module: AppModules.PRODUCT },
      { name: "City", path: "/city", module: AppModules.CITY },
      { name: "Country", path: "/country", module: AppModules.COUNTRY },
      { name: "Zone", path: "/zone", module: AppModules.ZONE },
      { name: "Permission", path: "/permission", module: AppModules.PERMISSION },
      { name: "Currency", path: "/currency", module: AppModules.CURRENCY },
    ],
  },
  {
    name: "Inventory",
    icon: Warehouse, // تم التغيير من Factory إلى Warehouse لتعبر عن المخازن بشكل مباشر
    children: [
      { name: "WareHouse", path: "/warehouse", module: AppModules.WAREHOUSE },
      { name: "Transfer", path: "/transfer", module: AppModules.TRANSFER },
      { name: "Purchase", path: "/purchase", module: AppModules.PURCHASE },
      { name: "Return", path: "/purchase-return", module: AppModules.PURCHASE_RETURN },
    ],
  },
  {
    name: "CRM",
    icon: Contact2, // تم التغيير لتمييزها عن HRM، فهي تعبر عن جهات الاتصال والعملاء
    children: [
      { name: "Supplier", path: "/supplier", module: AppModules.SUPPLIER },
      { name: "Customer", path: "/customer", module: AppModules.CUSTOMER },
      { name: "CustomerGroup", path: "/customer-group", module: AppModules.CUSTOMER_GROUP },
    ],
  },
  {
    name: "HRM",
    icon: Users, // بقيت كما هي لأنها تعبر عن الموظفين (الأدمن والكاشير)
    children: [
      { name: "Admin", path: "/admin", module: AppModules.ADMIN },
      { name: "Cashier", path: "/cashier", module: AppModules.CASHIER },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3, // تم التغيير من FileText لتعبر عن الإحصائيات والرسوم البيانية
    children: [
      { name: "Cashier Shift", path: "/cashier-shift", module: AppModules.CASHIER_SHIFT_REPORT },
    ],
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userPermissions = user.permissions || [];
  const isSuperAdmin = user.role === "superadmin";



  // 1. Core access check (Uses your existing hasAccess logic)
  const canViewModule = (moduleName) => {
    if (isSuperAdmin || !moduleName) return true;
    // We check for "View" action specifically for the sidebar
    return userPermissions.some(
      (p) => p.module.toLowerCase() === moduleName.toLowerCase() &&
        p.actions.some(a => a.action === "View")
    );
  };

  // 2. Filter the main menuItems array
  const authorizedMenuItems = menuItems
    .map((item) => {
      // If it has children, filter the children first
      if (item.children) {
        const allowedChildren = item.children.filter((child) => canViewModule(child.module));

        // Only return the parent if it has at least one allowed child
        if (allowedChildren.length > 0) {
          return { ...item, children: allowedChildren };
        }
        return null;
      }

      // For top-level items without children (like Dashboard)
      return canViewModule(item.module || item.name.toLowerCase()) ? item : null;
    })
    .filter(Boolean); // Remove null entries

  // Filter menu items based on search query
  const filterMenuItems = (items, query) => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items
      .map((item) => {
        // Check if parent matches
        const parentMatches = t(item.name).toLowerCase().includes(lowerQuery);

        // Check if any child matches
        if (item.children) {
          const matchingChildren = item.children.filter((child) =>
            child.name.toLowerCase().includes(lowerQuery)
          );

          if (matchingChildren.length > 0) {
            return { ...item, children: matchingChildren };
          }
        }

        // Return item if parent matches
        if (parentMatches) return item;

        return null;
      })
      .filter(Boolean);
  };

  // 3. Apply the search filter on top of the authorized items
  const filteredMenuItems = filterMenuItems(authorizedMenuItems, searchQuery);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // ✨ Auto-open dropdowns when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      // Open all parent items that have matching children
      const itemsToOpen = filteredMenuItems
        .filter((item) => item.children && item.children.length > 0)
        .map((item) => item.name);

      if (itemsToOpen.length > 0) {
        // Open the first matching parent
        setOpenDropdown(itemsToOpen[0]);
      }
    } else {
      // Close all when search is cleared
      setOpenDropdown(null);
    }
  }, [searchQuery, filteredMenuItems]);

  const renderMenuItems = (items, isMobile = false) => {
    return items.map((item, index) => {
      if (item.children) {
        // Auto-open if searching and has matching children
        const shouldBeOpen = searchQuery.trim() && openDropdown === item.name;

        return (
          <li key={index}>
            <div
              onClick={() => toggleDropdown(item.name)}
              className="flex items-center justify-between p-3 mx-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!desktopCollapsed || isMobile) && (
                  <span className="truncate">{t(item.name)}</span>
                )}
              </div>
              {(!desktopCollapsed || isMobile) &&
                (shouldBeOpen || openDropdown === item.name ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                ))}
            </div>
            {(!desktopCollapsed || isMobile) &&
              (shouldBeOpen || openDropdown === item.name) && (
                <ul className="pl-8">
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Link
                        to={child.path}
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        onClick={() => {
                          setMobileOpen(false);
                          setSearchQuery(""); // Clear search after navigation
                        }}
                      >
                        {t(child.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        );
      } else {
        return (
          <li key={index}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 mx-2 rounded-lg hover:bg-gray-100 transition-colors ${desktopCollapsed && !isMobile ? "justify-center" : ""
                }`}
              title={desktopCollapsed && !isMobile ? item.name : ""}
              onClick={() => {
                setMobileOpen(false);
                setSearchQuery(""); // Clear search after navigation
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!desktopCollapsed || isMobile) && (
                <span className="truncate">{t(item.name)}</span>
              )}
            </Link>
          </li>
        );
      }
    });
  };

  return (
    <>
      {/* ✅ Mobile toggle */}
      <div className="md:hidden p-2 border-b">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 overflow-y-auto scrollbar-width-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <nav className="h-full bg-white border-r flex flex-col">
              <img src={logo} alt="logo" className="p-10 flex-shrink-0" />

              {/* Search Box - Mobile */}
              <div className="px-4 pb-4 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              <ul className="flex-1 overflow-y-auto pb-4">
                {filteredMenuItems.length > 0 ? (
                  renderMenuItems(filteredMenuItems, true)
                ) : (
                  <li className="p-4 text-center text-gray-500 text-sm">
                    {t("Noresultsfound")}
                  </li>
                )}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* ✅ Desktop sidebar with toggle */}
      <aside
        className={`hidden md:block h-screen bg-white border-r transition-all duration-300 flex flex-col overflow-y-auto scrollbar-width-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${desktopCollapsed ? "w-16" : "w-64"
          }`}
      >
        <div
          className={`flex items-center p-6 border-b flex-shrink-0 ${desktopCollapsed ? "justify-center" : "justify-start"
            }`}
        >
          {desktopCollapsed ? (
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <img
              src={logo}
              alt="logo"
              className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            />
          )}
        </div>

        {/* Search Box - Desktop */}
        {!desktopCollapsed && (
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("Searchmenu")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-width-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ul className="pt-2">
            {filteredMenuItems.length > 0 ? (
              renderMenuItems(filteredMenuItems, false)
            ) : (
              <li className="p-4 text-center text-gray-500 text-sm">
                {t("Noresultsfound")}
              </li>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
}
