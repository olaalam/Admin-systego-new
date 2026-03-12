import React from "react";
import { useNavigate } from "react-router-dom";
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
    items: ["Financial", "Taxes", "Discounts", "Expenses", "Expense Categories", "Revenue", "Payment Methods", "Payments"],
    icon: CreditCard,
    path: "/accounting",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-100",
  },
  {
    name: "Marketing",
    items: ["Popups", "Points", "Redeem Points", "Bundles", "Coupon"],
    icon: Megaphone,
    path: "/popup",
    color: "bg-amber-500",
    shadow: "shadow-amber-100",
  },
  {
    name: "Ecommerce",
    items: ["Online Store"],
    icon: ShoppingCart,
    path: "/ecommerce",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-100",
  },
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
    items: ["Cashier Shifts", "Orders Report", "Product Report", "Financial Report"],
    icon: BarChart3,
    path: "/orders-reports",
    color: "bg-slate-700",
    shadow: "shadow-slate-200",
  },
  {
    name: "Settings",
    items: ["Barcode", "Cities", "Country", "Zones", "Permissions", "Currencies"],
    icon: Settings,
    path: "/barcode",
    color: "bg-gray-600",
    shadow: "shadow-gray-200",
  },
];

export default function ModulesGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          {modules.map((module, idx) => (
            <div
              key={idx}
              onClick={() => navigate(module.path)}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col active:scale-[0.97]"
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 ${module.color}`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-3xl ${module.color} flex items-center justify-center mb-8 shadow-xl ${module.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <module.icon className="text-white w-8 h-8" />
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-red-600 transition-colors tracking-tight">
                  {t(module.name)}
                </h3>

                <div className="">
                  <div className="flex flex-wrap gap-2">
                    {module.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors uppercase tracking-wider"
                      >
                        {t(item)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-red-500 transition-colors">
                    <span>{t("Explore")}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                    <ChevronRight className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
