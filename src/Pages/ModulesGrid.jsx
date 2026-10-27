import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  Megaphone,
  Warehouse,
  MonitorPlay,
  Contact2,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTenantInfo } from "@/context/TenantContext";
import { AppModules, ModuleActions } from "@/config/modules";
import { hasPermission, isSuperAdminUser } from "@/lib/checkPermission";

const modules = [
  {
    name: "Dashboard",
    items: [
      {
        name: "Dashboard",
        path: "/analytics",
        moduleKey: [AppModules.HOME, AppModules.Dashboard],
      },
    ],
    icon: LayoutDashboard,
    path: "/analytics",
    color: "bg-blue-500",
    shadow: "shadow-blue-100",
  },
  {
    name: "Product Management",
    items: [
      { name: "Product", path: "/product", moduleKey: AppModules.PRODUCT },
      { name: "Category", path: "/category", moduleKey: AppModules.CATEGORY },
      { name: "Brand", path: "/brand", moduleKey: AppModules.BRAND },
      {
        name: "Attribute",
        path: "/attribute",
        moduleKey: AppModules.VARIATION,
      },
      { name: "Units", path: "/unit", moduleKey: AppModules.UNITS },
      { name: "Expiring", path: "/expiring", moduleKey: AppModules.EXPIRING },
    ],
    icon: Layers,
    path: "/product",
    color: "bg-rose-500",
    shadow: "shadow-rose-100",
  },
  {
    name: "Financial",
    items: [
      {
        name: "Financial",
        path: "/accounting",
        moduleKey: AppModules.FINANCIAL_ACCOUNT,
      },
      { name: "Taxes", path: "/taxes", moduleKey: AppModules.TAXES },
      {
        name: "Expenses",
        path: "/expense",
        moduleKey: AppModules.EXPENSE_ADMIN,
      },
      {
        name: "Expense Categories",
        path: "/expense-category",
        moduleKey: AppModules.EXPENSE_CATEGORY,
      },
      { name: "Revenue", path: "/revenue", moduleKey: AppModules.REVENUE },
      {
        name: "Payment Methods",
        path: "/payment_method",
        moduleKey: AppModules.PAYMENT_METHOD,
      },
      { name: "Payments", path: "/payments", moduleKey: AppModules.PAYMENT },
      {
        name: "Payment Ecommerce",
        path: "/payment-eco",
        moduleKey: AppModules.PAYMENT_ECO,
      },
      { name: "Payable", path: "/payable", moduleKey: AppModules.PAYABLE },
      {
        name: "Recevible",
        path: "/recevible",
        moduleKey: AppModules.RECEVIBLE,
      },
      {
        name: "Installments",
        path: "/installments",
        moduleKey: [AppModules.INSTALLMENTS, AppModules.ADMIN, AppModules.POS],
      },
      { name: "Ledger", path: "/ledger", moduleKey: AppModules.LEDGER },
    ],
    icon: CreditCard,
    path: "/accounting",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-100",
  },
  {
    name: "Marketing",
    items: [
      { name: "Popups", path: "/popup", moduleKey: AppModules.POPUP },
      { name: "Points", path: "/point", moduleKey: AppModules.POINT },
      {
        name: "Redeem Points",
        path: "/redeem-point",
        moduleKey: AppModules.REDEEM_POINTS,
      },
      { name: "Bundles", path: "/pandel", moduleKey: AppModules.PANDEL },
      { name: "Coupon", path: "/coupon", moduleKey: AppModules.COUPON },
      { name: "Banner", path: "/banner", moduleKey: AppModules.BANNER },
      { name: "Discounts", path: "/discount", moduleKey: AppModules.DISCOUNT },
      { name: "Shipping", path: "/shipping", moduleKey: AppModules.SHIPPING },
      {
        name: "Free Shipping Products",
        path: "/free-shipping-products",
        moduleKey: AppModules.FREE_SHIPPING_PRODUCTS,
      },
      {
        name: "E-commerce",
        path: "/ecommerce",
        moduleKey: AppModules.ECOMMERCE,
      },
    ],
    icon: Megaphone,
    path: "/popup",
    color: "bg-amber-500",
    shadow: "shadow-amber-100",
  },
  {
    name: "Inventory",
    items: [
      { name: "Branch", path: "/warehouse", moduleKey: AppModules.WAREHOUSE },
      {
        name: "Pickup Points",
        path: "/pickup-point",
        moduleKey: AppModules.PICKUP_POINT,
      },
      { name: "Transfers", path: "/transfer", moduleKey: AppModules.TRANSFER },
      { name: "Purchase", path: "/purchase", moduleKey: AppModules.PURCHASE },
      {
        name: "Returns",
        path: "/purchase-return",
        moduleKey: AppModules.PURCHASE_RETURN,
      },
      {
        name: "Stock Take",
        path: "/stocktake",
        moduleKey: AppModules.STOCKTAKE,
      },
      { name: "Wasted", path: "/wasted", moduleKey: AppModules.WASTED },
    ],
    icon: Warehouse,
    path: "/warehouse",
    color: "bg-orange-500",
    shadow: "shadow-orange-100",
  },
  {
    name: "POS",
    items: [
      { name: "Cashier", path: "/cashier", moduleKey: AppModules.CASHIER },
      { name: "Reserve", path: "/reserve", moduleKey: AppModules.RESERVE },
    ],
    icon: MonitorPlay,
    path: "/cashier",
    color: "bg-cyan-500",
    shadow: "shadow-cyan-100",
  },
  {
    name: "CRM",
    items: [
      { name: "Suppliers", path: "/supplier", moduleKey: AppModules.SUPPLIER },
      { name: "Customers", path: "/customer", moduleKey: AppModules.CUSTOMER },
      {
        name: "Customer Groups",
        path: "/customer-group",
        moduleKey: AppModules.CUSTOMER_GROUP,
      },
    ],
    icon: Contact2,
    path: "/supplier",
    color: "bg-violet-500",
    shadow: "shadow-violet-100",
  },
  {
    name: "HRM",
    items: [
      { name: "Admin", path: "/admin", moduleKey: AppModules.ADMIN },
      {
        name: "Delivery Man",
        path: "/delivery-man",
        moduleKey: AppModules.DELIVERY_MAN,
      },
      { name: "Profile", path: "/profile", moduleKey: AppModules.PROFILE },
    ],
    icon: Users,
    path: "/admin",
    color: "bg-pink-500",
    shadow: "shadow-pink-100",
  },
  {
    name: "Reports",
    items: [
      {
        name: "Cashier Shifts",
        path: "/cashier-shift",
        moduleKey: AppModules.CASHIER_SHIFT_REPORT,
        adminOnly: true,
      },
      {
        name: "Orders Report",
        path: "/orders-reports",
        moduleKey: AppModules.ORDERS_REPORT,
        adminOnly: true,
      },
      {
        name: "Product Report",
        path: "/product-reports",
        moduleKey: AppModules.PRODUCT_REPORT,
        adminOnly: true,
      },
      {
        name: "Financial Report",
        path: "/financial-reports",
        moduleKey: AppModules.FINANCIAL_REPORT,
        adminOnly: true,
      },
      {
        name: "Product Movement Report",
        path: "/product-movement-report",
        moduleKey: AppModules.PRODUCT_MOVEMENT,
        adminOnly: true,
      },
      {
        name: "All Returns",
        path: "/all-returns",
        moduleKey: AppModules.ALL_RETURNS,
        adminOnly: true,
      },
    ],
    icon: BarChart3,
    path: "/orders-reports",
    color: "bg-slate-700",
    shadow: "shadow-slate-200",
  },
  {
    name: "Settings",
    items: [
      // 👑 Barcode — admin only
      {
        name: "Barcode",
        path: "/barcode",
        moduleKey: AppModules.PRODUCT,
        adminOnly: true,
      },
      { name: "Cities", path: "/city", moduleKey: AppModules.CITY },
      { name: "Country", path: "/country", moduleKey: AppModules.COUNTRY },
      { name: "Zones", path: "/zone", moduleKey: AppModules.ZONE },
      {
        name: "Permissions",
        path: "/permission",
        moduleKey: AppModules.PERMISSION,
      },
      { name: "Currencies", path: "/currency", moduleKey: AppModules.CURRENCY },
      {
        name: "Decimal",
        path: "/decimal-setting",
        moduleKey: AppModules.DECIMAL_SETTING,
      },
      {
        name: "Service Fees",
        path: "/service-fees",
        moduleKey: AppModules.SERVICE_FEES,
      },
      { name: "Couriers", path: "/courier", moduleKey: AppModules.COURIER },
      // 👑 Data — admin only
      { name: "Data", path: "/data", moduleKey: null, adminOnly: true },
    ],
    icon: Settings,
    path: "/barcode",
    color: "bg-gray-600",
    shadow: "shadow-gray-200",
  },
];

export default function ModulesGrid() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { features, loading: tenantLoading } = useTenantInfo();

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  // ✅ فلترة العناصر حسب صلاحية VIEW + adminOnly
  const visibleModules = useMemo(() => {
    const superAdmin = isSuperAdminUser();

    return modules
      .map((m) => {
        const visibleItems = m.items.filter((item) => {
          // 👑 عناصر الأدمن فقط
          if (item.adminOnly) return superAdmin;
          if (!item.moduleKey) return true; // زي Data (لو مش adminOnly)
          return hasPermission(item.moduleKey, ModuleActions.VIEW);
        });
        return { ...m, items: visibleItems };
      })
      .filter((m) => m.items.length > 0); // اخفي الموديول لو فاضي
  }, []);

  // ✅ فلترة البحث
  const filteredModules = visibleModules.filter((module) => {
    if (!searchQuery) return true;
    const moduleName = t(module.name).toLowerCase();
    if (moduleName.includes(searchQuery)) return true;
    return module.items.some((item) =>
      t(item.name).toLowerCase().includes(searchQuery),
    );
  });

  const handleModuleClick = (module) => {
    const isLocked =
      !tenantLoading && module.name === "Reports" && !features.haveReports;
    if (isLocked) return;

    const firstAvailable = module.items[0];
    if (firstAvailable?.path) navigate(firstAvailable.path);
  };

  const handleItemClick = (e, item, isSubItemLocked) => {
    e.stopPropagation();
    if (isSubItemLocked) return;
    if (item?.path) navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-red-600 rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
              System Core
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {t("ControlPanel")}
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
            {t("SelectModuleToManage")}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map((module, idx) => {
              const isLocked =
                !tenantLoading &&
                module.name === "Reports" &&
                !features.haveReports;

              return (
                <div
                  key={idx}
                  onClick={() => handleModuleClick(module)}
                  className={`group relative bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 border transition-all duration-500 overflow-hidden flex flex-col sm:aspect-square select-none ${
                    isLocked
                      ? "cursor-not-allowed opacity-60 bg-slate-50/70 border-slate-200/90 shadow-none"
                      : "cursor-pointer border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 active:scale-[0.97]"
                  }`}
                  title={
                    isLocked
                      ? i18n.language === "ar"
                        ? "قسم التقارير معطّل في باقتك الحالية (يتطلب ترقية)"
                        : "Reports module is disabled in your current plan (requires upgrade)"
                      : undefined
                  }
                >
                  {isLocked && (
                    <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-slate-200/80 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs">
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span>
                        {i18n.language === "ar"
                          ? "معطّل بالباقة"
                          : "Disabled in Plan"}
                      </span>
                    </div>
                  )}

                  {!isLocked && (
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 ${module.color}`}
                    />
                  )}

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div
                        className={`w-12 h-12 rounded-2xl ${module.color} flex items-center justify-center mb-4 shadow-lg ${module.shadow} ${
                          isLocked
                            ? "opacity-50 grayscale"
                            : "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                        }`}
                      >
                        <module.icon className="text-white w-6 h-6" />
                      </div>

                      <h3
                        className={`text-xl font-black mb-3 tracking-tight leading-tight transition-colors ${
                          isLocked
                            ? "text-slate-400"
                            : "text-slate-800 group-hover:text-red-600"
                        }`}
                      >
                        {t(module.name)}
                      </h3>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {module.items.map((item, i) => {
                          const itemName = item.name;
                          const isSubItemLocked =
                            (module.name === "Inventory" &&
                              itemName === "Stock Take" &&
                              !tenantLoading &&
                              !features.haveStockTake) ||
                            isLocked;

                          return (
                            <div
                              key={i}
                              onClick={(e) =>
                                handleItemClick(e, item, isSubItemLocked)
                              }
                              className={`flex items-center gap-1.5 group/item py-0.5 px-1.5 -mx-1.5 rounded-md transition-all ${
                                isSubItemLocked
                                  ? "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer hover:bg-slate-100/70 active:scale-95"
                              }`}
                              title={
                                isSubItemLocked
                                  ? i18n.language === "ar"
                                    ? `${t(itemName)} (معطّل في باقتك الحالية)`
                                    : `${t(itemName)} (Disabled in your plan)`
                                  : t(itemName)
                              }
                            >
                              {isSubItemLocked ? (
                                <Lock className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <div className="min-w-[4px] h-[4px] rounded-full bg-slate-300 group-hover/item:bg-red-500 group-hover/item:scale-125 transition-all flex-shrink-0" />
                              )}
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider truncate transition-colors ${
                                  isSubItemLocked
                                    ? "text-slate-400 line-through decoration-amber-400"
                                    : "text-slate-400 group-hover/item:text-slate-800"
                                }`}
                              >
                                {t(itemName)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {isLocked ? (
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          <Lock className="w-3 h-3 mr-1.5" />
                          <span>
                            {i18n.language === "ar"
                              ? "معطّل بالباقة"
                              : "Plan Disabled"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-red-500 transition-colors">
                          <span>{t("Explore")}</span>
                          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-medium italic">
                {t("Noresultsfound")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
