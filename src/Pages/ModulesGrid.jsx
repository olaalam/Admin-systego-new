import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
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
  ChevronRight,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTenantInfo } from "@/context/TenantContext";
import { toast } from "react-toastify";

const modules = [
  {
    name: "Dashboard",
    items: ["Dashboard"],
    icon: LayoutDashboard,
    path: "/analytics",
    color: "bg-blue-500",
    shadow: "shadow-blue-100",
  },
  {
    name: "Product Management",
    items: ["Product", "Category", "Brand", "Attribute", "Units", "Expiring"],
    icon: Layers,
    path: "/product",
    color: "bg-rose-500",
    shadow: "shadow-rose-100",
  },
  {
    name: "Financial",
    items: ["Financial", "Taxes", "Expenses", "Expense Categories", "Revenue", "Payment Methods", "Payments", "Payment Ecommerce", "Payable", "Recevible", "Ledger"],
    icon: CreditCard,
    path: "/accounting",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-100",
  },
  {
    name: "Marketing",
    items: ["Popups", "Points", "Redeem Points", "Bundles", "Coupon", "Banner", "Discounts", "Shipping", "Free Shipping Products"],
    icon: Megaphone,
    path: "/popup",
    color: "bg-amber-500",
    shadow: "shadow-amber-100",
  },
  // {
  //   name: "Ecommerce",
  //   items: ["Online Store"],
  //   icon: ShoppingCart,
  //   path: "/ecommerce",
  //   color: "bg-indigo-500",
  //   shadow: "shadow-indigo-100",
  // },
  {
    name: "Inventory",
    items: ["Branch", "Transfers", "Purchase", "Returns", "Stock Take"],
    icon: Warehouse,
    path: "/warehouse",
    color: "bg-orange-500",
    shadow: "shadow-orange-100",
  },
  {
    name: "POS",
    items: ["Cashier", "Reserve"],
    icon: MonitorPlay,
    path: "/cashier",
    color: "bg-cyan-500",
    shadow: "shadow-cyan-100",
  },
  {
    name: "CRM",
    items: ["Suppliers", "Customers", "Customer Groups"],
    icon: Contact2,
    path: "/supplier",
    color: "bg-violet-500",
    shadow: "shadow-violet-100",
  },
  {
    name: "HRM",
    items: ["Admin", "Profile"],
    icon: Users,
    path: "/admin",
    color: "bg-pink-500",
    shadow: "shadow-pink-100",
  },
  {
    name: "Reports",
    items: ["Cashier Shifts", "Orders Report", "Product Report", "Financial Report", "Product Movement Report"],
    icon: BarChart3,
    path: "/orders-reports",
    color: "bg-slate-700",
    shadow: "shadow-slate-200",
  },
  {
    name: "Settings",
    items: ["Barcode", "Cities", "Country", "Zones", "Permissions", "Currencies", "Decimal", "Service Fees", "Couriers"],
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

  const filteredModules = modules.filter((module) => {
    if (!searchQuery) return true;

    // Check module name
    const moduleName = t(module.name).toLowerCase();
    if (moduleName.includes(searchQuery)) return true;

    // Check sub-items
    return module.items.some(item => t(item).toLowerCase().includes(searchQuery));
  });

  const handleModuleClick = (module) => {
    const isLocked = !tenantLoading && module.name === "Reports" && !features.haveReports;
    if (isLocked) {
      return;
    }
    navigate(module.path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 bg-red-600 rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">System Core</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {t("ControlPanel")}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t("SelectModuleToManage")}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map((module, idx) => {
              const isLocked = !tenantLoading && module.name === "Reports" && !features.haveReports;

              return (
                <div
                  key={idx}
                  onClick={() => handleModuleClick(module)}
                  className={`group relative bg-white rounded-[2.5rem] p-6 border transition-all duration-500 overflow-hidden flex flex-col aspect-square select-none ${
                    isLocked
                      ? "cursor-not-allowed opacity-60 bg-slate-50/70 border-slate-200/90 shadow-none"
                      : "cursor-pointer border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 active:scale-[0.97]"
                  }`}
                  title={
                    isLocked
                      ? (i18n.language === "ar"
                          ? "قسم التقارير معطّل في باقتك الحالية (يتطلب ترقية)"
                          : "Reports module is disabled in your current plan (requires upgrade)")
                      : undefined
                  }
                >
                  {/* Locked Top Badge */}
                  {isLocked && (
                    <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-slate-200/80 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs">
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span>{i18n.language === "ar" ? "معطّل بالباقة" : "Disabled in Plan"}</span>
                    </div>
                  )}

                  {/* Animated Background Gradient */}
                  {!isLocked && (
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 ${module.color}`} />
                  )}

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      {/* Icon Section */}
                      <div className={`w-12 h-12 rounded-2xl ${module.color} flex items-center justify-center mb-4 shadow-lg ${module.shadow} ${
                        isLocked
                          ? "opacity-50 grayscale"
                          : "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                      }`}>
                        <module.icon className="text-white w-6 h-6" />
                      </div>

                      {/* Title Section */}
                      <h3 className={`text-xl font-black mb-3 tracking-tight leading-tight transition-colors ${
                        isLocked
                          ? "text-slate-400"
                          : "text-slate-800 group-hover:text-red-600"
                      }`}>
                        {t(module.name)}
                      </h3>

                      {/* Distribution in 2 cols */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {module.items.map((item, i) => {
                          const isSubItemLocked =
                            (module.name === "Inventory" && item === "Stock Take" && !tenantLoading && !features.haveStockTake) ||
                            isLocked;

                          return (
                            <div key={i} className={`flex items-center gap-1.5 group/item ${isSubItemLocked ? "opacity-60" : ""}`}>
                              {isSubItemLocked ? (
                                <Lock className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <div className="min-w-[4px] h-[4px] rounded-full bg-slate-300 group-hover/item:bg-red-400 transition-colors" />
                              )}
                              <span className={`text-[9px] font-bold uppercase tracking-wider truncate transition-colors ${
                                isSubItemLocked
                                  ? "text-slate-400 line-through decoration-amber-400"
                                  : "text-slate-400 group-hover/item:text-slate-600"
                              }`}>
                                {t(item)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explore Section */}
                    <div className="flex items-center justify-between pt-2">
                      {isLocked ? (
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          <Lock className="w-3 h-3 mr-1.5" />
                          <span>{i18n.language === "ar" ? "معطّل بالباقة" : "Plan Disabled"}</span>
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
