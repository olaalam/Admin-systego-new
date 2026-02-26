import React, { useState } from "react";
import useGet from "@/hooks/useGet";
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign,
  Package, ReceiptText, Wallet, ArrowDownCircle,
  BarChart2, Loader2, CalendarDays, Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ────────── helpers ────────── */
const fmt = (n) =>
  n == null ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));

/* Convert "2026-01-07" → "Jan 7" */
const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const label = new Date(+y, +m - 1, +d).toLocaleString("en-US", { month: "short", day: "numeric" });
  return label;
};

/* ────────── palette ────────── */
const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa", "#fb923c", "#34d399"];

/* ────────── Custom Tooltip ────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs min-w-[130px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-0.5">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-gray-800">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ────────── Pie Tooltip ────────── */
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{d.name}</p>
      <p className="text-gray-800">Amount: <span className="font-bold">{Number(d.value).toLocaleString()} EGP</span></p>
      <p className="text-gray-500">Orders: {d.payload?.count}</p>
    </div>
  );
};

/* ────────── KPI Stat Card ────────── */
function StatCard({ label, value, icon: Icon, color, prefix = "" }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white/10 flex flex-col gap-3"
      style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)` }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="p-2 rounded-xl" style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800 truncate">
        {value} {prefix && <span className="text-base font-semibold text-gray-500">{prefix}</span>}
      </p>
    </div>
  );
}

/* ────────── Chart Card Wrapper ────────── */
function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-indigo-50">
          <Icon className="w-4 h-4 text-indigo-600" />
        </div>
        <h2 className="font-semibold text-gray-700 text-sm tracking-wide uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ────────── Transfer Heatmap ────────── */
function TransferHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-gray-300 gap-3">
        <Activity className="w-10 h-10 opacity-40" />
        <p className="text-sm text-gray-400">No transfer activity in this period</p>
      </div>
    );
  }

  // 1. Extract unique sorted dates
  const uniqueDates = Array.from(new Set(data.map((d) => d.date))).sort();
  
  // 2. Extract unique warehouse pairs
  const pairsMap = new Map();
  data.forEach((d) => {
    const from = d.fromWarehouse?.name || d.fromWarehouse || "Unknown";
    const to = d.toWarehouse?.name || d.toWarehouse || "Unknown";
    const pairKey = `${from} → ${to}`;
    pairsMap.set(pairKey, { from, to });
  });
  const uniquePairs = Array.from(pairsMap.keys());

  // 3. Find max quantity for scaling heat
  const maxQty = Math.max(...data.map((d) => d.totalQuantity || 0));

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400 uppercase font-bold px-2">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
            <div key={v} className="w-3 h-3 rounded-sm" style={{ background: `rgba(99,102,241,${v})` }} />
          ))}
        </div>
        <span>High</span>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="min-w-fit flex flex-col">
          {/* Header (Dates) */}
          <div className="flex border-b border-gray-100">
            <div className="w-48 flex-shrink-0 p-2 text-[10px] font-bold text-gray-400 uppercase">Route / Date</div>
            {uniqueDates.map((date) => (
              <div key={date} className="w-24 flex-shrink-0 p-2 text-center text-[10px] font-bold text-gray-500 truncate">
                {new Date(date).toLocaleString("en-US", { month: "short", day: "numeric" })}
              </div>
            ))}
          </div>

          {/* Body (Pairs x Dates) */}
          {uniquePairs.map((pair) => (
            <div key={pair} className="flex border-b border-gray-50 hover:bg-gray-50 transition-colors group">
              <div className="w-48 flex-shrink-0 p-2.5 text-[11px] font-medium text-gray-700 bg-gray-50/30 group-hover:bg-indigo-50/50 transition-colors">
                {pair}
              </div>
              {uniqueDates.map((date) => {
                const dayData = data.find((d) => {
                  const currentFrom = d.fromWarehouse?.name || d.fromWarehouse;
                  const currentTo = d.toWarehouse?.name || d.toWarehouse;
                  return d.date === date && `${currentFrom} → ${currentTo}` === pair;
                });
                
                const qty = dayData?.totalQuantity || 0;
                const intensity = maxQty > 0 ? (qty / maxQty) : 0;
                // Base color #6366f1 (indigo-500)
                const bg = qty > 0 ? `rgba(99,102,241,${0.1 + intensity * 0.85})` : "#f9fafb";
                
                return (
                  <div key={date} className="w-24 h-12 flex-shrink-0 border-l border-gray-50/50 relative flex items-center justify-center group/cell">
                    <div 
                      className={`w-[90%] h-[80%] rounded-md transition-all ${qty > 0 ? "shadow-sm border border-indigo-200/20" : ""}`}
                      style={{ background: bg }}
                    />
                    {qty > 0 && (
                      <>
                        <span className={`text-[11px] font-bold absolute ${intensity > 0.5 ? "text-white" : "text-indigo-900"}`}>
                          {qty}
                        </span>
                        {/* Custom Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-20 pointer-events-none">
                          <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                            <p className="font-bold border-b border-gray-700 pb-1 mb-1">{pair}</p>
                            <p>Date: {date}</p>
                            <p>Transfers: {dayData.transfersCount}</p>
                            <p className="text-indigo-300">Total Qty: {qty}</p>
                          </div>
                          <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────── Loading Skeleton ────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

/* ══════════════════ MAIN DASHBOARD ══════════════════ */
export default function Dashboard() {
  const { t } = useTranslation();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [apiUrl, setApiUrl] = useState("/api/admin/dashboard");
  const { data, loading, error } = useGet(apiUrl);

  const handleFilter = () => {
    let url = "/api/admin/dashboard";
    const params = new URLSearchParams();
    if (start) params.append("start_date", start);
    if (end) params.append("end_date", end);
    const qs = params.toString();
    setApiUrl(qs ? `${url}?${qs}` : url);
  };

  const handleClear = () => {
    setStart("");
    setEnd("");
    setApiUrl("/api/admin/dashboard");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin me-2" />
            <span className="text-sm">Loading analytics...</span>
          </div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="flex items-center justify-center h-[50vh] text-gray-400 flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <BarChart2 className="w-12 h-12 opacity-30" />
          <p className="text-sm">{error || "No data available for this period"}</p>
          {(start || end) && (
            <button onClick={handleClear} className="text-indigo-600 text-sm font-medium hover:underline">
              Clear filters
            </button>
          )}
        </div>
      );
    }

    const cards  = data.cards  || {};
    const charts = data.charts || {};
    const period = data.period || {};

    /* ── 1. Sales Trend: Line chart x=date y=sales ── */
    const salesTrend = (charts.sales_trend || []).map((d) => ({
      date:  fmtDate(d.date),   // e.g. "Jan 1", "Feb 9"
      Sales: d.sales,
    }));

    /* ── 2. Sales by Payment Method: Pie ── */
    const paymentPie = (charts.sales_by_payment_method || []).map((d) => ({
      name:  d.account_name,
      value: d.total,
      count: d.count,
    }));

    /* ── 3. Revenue vs Expenses: Combo (Bar + Line) ── */
    const revenueExpenses = (charts.revenue_vs_expenses || []).map((d) => {
      const [y, m] = (d.month || "").split("-");
      const monthName = new Date(+y, +m - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
      return { month: monthName, Revenue: d.revenue, Expenses: d.expenses, Profit: d.profit };
    });

    /* ── 4. Restock over time: Line chart x=date y=amount ── */
    const restockTrend = (charts.restock_trend || []).map((d) => ({
      date:   fmtDate(d.date),  // e.g. "Jan 14", "Feb 16"
      Amount: d.amount,
      Count:  d.count,
    }));

    /* ── 5. Transfer Activity: Heatmap ── */
    const transferActivity = charts.transfer_activity || [];

    /* ── 6. Stock value by Warehouse: Bar chart x=warehouse y=value ── */
    const stockWarehouse = (charts.stock_by_warehouse || []).map((d) => ({
      name:  d.warehouse_name,
      Value: d.totalValue,
      Qty:   d.totalQuantity,
    }));

    return (
      <div className="space-y-6">
        {/* KPI Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Sales"    value={fmt(cards.total_sales)}    icon={DollarSign}      color="#6366f1" prefix="EGP" />
          <StatCard label="Net Revenue"    value={fmt(cards.net_revenue)}    icon={TrendingUp}      color="#10b981" prefix="EGP" />
          <StatCard label="Net Profit"     value={fmt(cards.net_profit)}     icon={Wallet}          color="#22d3ee" prefix="EGP" />
          <StatCard label="Total Expenses" value={fmt(cards.total_expenses)} icon={ArrowDownCircle} color="#f43f5e" prefix="EGP" />
          <StatCard label="Total Orders"   value={fmtInt(cards.total_orders)} icon={ShoppingCart}   color="#f59e0b" />
        </div>

        {/* KPI Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Sales Today"    value={fmt(cards.total_sales_today)} icon={TrendingUp}   color="#a78bfa" prefix="EGP" />
          <StatCard label="Orders Today"   value={fmtInt(cards.orders_today)}   icon={ShoppingCart} color="#fb923c" />
          <StatCard label="Total Discount" value={fmt(cards.total_discount)}    icon={ReceiptText}  color="#34d399" prefix="EGP" />
          <StatCard label="Total Tax"      value={fmt(cards.total_tax)}         icon={ReceiptText}  color="#60a5fa" prefix="EGP" />
          <StatCard label="Total Returns"  value={fmt(cards.total_returns)}     icon={Package}      color="#f87171" prefix="EGP" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* 1 — Sales Trend */}
          <ChartCard title="Sales Trend" icon={TrendingUp} className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={salesTrend} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickMargin={8} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2 — Sales by Payment Method */}
          <ChartCard title="Sales by Payment Method" icon={Wallet}>
            {paymentPie.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No payment data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={paymentPie} cx="50%" cy="50%" innerRadius={70} outerRadius={108} paddingAngle={4} dataKey="value" label={renderPieLabel} labelLine={{ stroke: "#ccc", strokeWidth: 1 }}>
                    {paymentPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* 3 — Revenue vs Expenses */}
          <ChartCard title="Revenue vs Expenses" icon={BarChart2}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={revenueExpenses} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} tickMargin={10} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={28} />
                <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4 — Restock over Time */}
          <ChartCard title="Restock over Time" icon={Package} className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={restockTrend} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickMargin={8} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="Amount" name="Amount (EGP)" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 4, fill: "#a78bfa", stroke: "#fff", strokeWidth: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="Count" name="Count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} strokeDasharray="5 4" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 5 — Transfer Activity */}
          <ChartCard title="Transfer Activity" icon={Activity} className="xl:col-span-2">
            <TransferHeatmap data={transferActivity} />
          </ChartCard>

          {/* 6 — Stock Value by Warehouse */}
          <ChartCard title="Stock Value by Warehouse" icon={Package} className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stockWarehouse} margin={{ top: 4, right: 20, left: 0, bottom: 60 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Value" name="Stock Value (EGP)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Qty" name="Quantity" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    );
  };

  /* ── Pie label renderer ── */
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
    const RADIAN = Math.PI / 180;
    const r  = innerRadius + (outerRadius - innerRadius) * 1.45;
    const x  = cx + r * Math.cos(-midAngle * RADIAN);
    const y  = cy + r * Math.sin(-midAngle * RADIAN);
    return percent > 0.04 ? (
      <text x={x} y={y} fill="#555" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={11}>
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      {/* ── Header & Filters ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business intelligence at a glance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Start Date</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">End Date</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 self-end mb-[2px]">
            <button
              onClick={handleFilter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all active:scale-95"
            >
              Filter
            </button>
            {(start || end) && (
              <button
                onClick={handleClear}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
