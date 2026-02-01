import { Link } from "react-router-dom";
import { Menu, ChevronDown, ChevronUp, MapPin, Search, X } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Handshake,
  Wallet,
  Scale,
  UserRound,
  FileText,
  Factory,
  SlidersHorizontal,
  Puzzle,
  BookOpen,
  History,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { useTranslation } from "react-i18next";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "Product",
    icon: Package,
    children: [
      { name: "Products", path: "/product" },
      { name: "Category", path: "/category" },
      { name: "Brand", path: "/brand" },
      { name: "Attribute", path: "/attribute" },
      { name: "Unit", path: "/unit" },
      { name: "Barcode", path: "/barcode" },
      { name: "Taxes", path: "/taxes" },
      { name: "Bundels", path: "/pandel" },
    ],
  },
  {
    name: "Purchase",
    icon: ShoppingCart,
    children: [
      { name: "List", path: "/purchase" },

    ],
  },
  {
    name: "Locations",
    icon: MapPin,
    children: [
      { name: "City", path: "/city" },
      { name: "Country", path: "/country" },
      { name: "Zone", path: "/zone" },
    ],
  },
  {
    name: "Sale",
    icon: TrendingUp,
    children: [
      { name: "List", path: "/sale/list" },
      { name: "Discount", path: "/discount" },
      { name: "Currency", path: "/currency" },
      { name: "Coupon", path: "/coupon" },


    ],
  },
  {
    name: "Expense",
    icon: Wallet,
    children: [
      { name: "List", path: "/expense" },
      { name: "ExpensesCategory", path: "/expense-category" },
    ],
  },
  {
    name: "Revenue",
    icon: Handshake,
    children: [{ name: "List", path: "/revenue" }],
  },
  {
    name: "Quotation",
    icon: FileText,
    children: [
      { name: "List", path: "/quotation/list" },
      { name: "Add", path: "/quotation/add" },
    ],
  },
  { name: "Transfer", icon: Puzzle, path: "/transfer" },
  { name: "Return", icon: Scale, path: "/return" },
  { name: "Cashier Shift", icon: History, path: "/cashier-shift" },
  {
    name: "Accounting",
    icon: BookOpen,
    children: [
      { name: "List", path: "/accounting" },
      { name: "PaymentMethod", path: "/payment_method" },
      { name: "Payments", path: "/payments" },
    ],
  },
  {
    name: "HRM",
    icon: UserRound,
    children: [
      { name: "List", path: "/hrm/list" },
      { name: "Add", path: "/hrm/add" },
    ],
  },
  {
    name: "People",
    icon: Users,
    children: [
      { name: "Admin", path: "/admin" },
      { name: "Supplier", path: "/supplier" },
      { name: "Customer", path: "/customer" },
      { name: "CustomerGroup", path: "/customer-group" },
      { name: "Cashier", path: "/cashier" },
      { name: "Permission", path: "/permission" },
    ],
  },
  {
    name: "Reports",
    icon: FileText,
    children: [
      { name: "List", path: "/reports/list" },
      { name: "Popup", path: "/popup" },
      { name: "Point", path: "/point" },
      { name: "RedeemPoint", path: "/redeem-point" },
    ],
  },
  { name: "Addons", icon: Puzzle, path: "/addons" },
  {
    name: "Manufacturing",
    icon: Factory,
    children: [
      { name: "List", path: "/manufacturing/list" },
      { name: "WareHouse", path: "/warehouse" },

    ],
  },
  {
    name: "Settings",
    icon: SlidersHorizontal,
    children: [
      { name: "List", path: "/settings/list" },
      { name: "Add", path: "/settings/add" },
    ],
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

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

  const filteredMenuItems = filterMenuItems(menuItems, searchQuery);

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
