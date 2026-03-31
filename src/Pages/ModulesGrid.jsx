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
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
    items: ["Product", "Category", "Brand", "Attribute", "Units"],
    icon: Layers,
    path: "/product",
    color: "bg-rose-500",
    shadow: "shadow-rose-100",
  },
  {
    name: "Financial",
    items: ["Financial", "Taxes", "Expenses", "Expense Categories", "Revenue", "Payment Methods", "Payments", "Payment Ecommerce", "Paymob", "Geidea", "Payable", "Recevible"],
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
    items: ["Warehouse", "Transfers", "Purchase", "Returns"],
    icon: Warehouse,
    path: "/warehouse",
    color: "bg-orange-500",
    shadow: "shadow-orange-100",
  },
  {
    name: "POS",
    items: ["Cashier"],
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
    items: ["Admin"],
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
  const { t } = useTranslation();

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const filteredModules = modules.filter((module) => {
    if (!searchQuery) return true;

    // Check module name
    const moduleName = t(module.name).toLowerCase();
    if (moduleName.includes(searchQuery)) return true;

    // Check sub-items
    return module.items.some(item => t(item).toLowerCase().includes(searchQuery));
  });

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
            filteredModules.map((module, idx) => (
              <div
                key={idx}
                onClick={() => navigate(module.path)}
                className="group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col aspect-square active:scale-[0.97]"
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 ${module.color}`} />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Icon Section */}
                    <div className={`w-12 h-12 rounded-2xl ${module.color} flex items-center justify-center mb-4 shadow-lg ${module.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <module.icon className="text-white w-6 h-6" />
                    </div>

                    {/* Title Section */}
                    <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-red-600 transition-colors tracking-tight leading-tight">
                      {t(module.name)}
                    </h3>

                    {/* ✅ توزيع العناصر في شبكة من عمودين لتقليل الارتفاع والحفاظ على المربع */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {module.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 group/item">
                          <div className="min-w-[4px] h-[4px] rounded-full bg-slate-300 group-hover/item:bg-red-400 transition-colors" />
                          <span className="text-[9px] font-bold text-slate-400 group-hover/item:text-slate-600 transition-colors uppercase tracking-wider truncate">
                            {t(item)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explore Section */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-red-500 transition-colors">
                      <span>{t("Explore")}</span>
                      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))
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
