import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ── Constants ──────────────────────────────────────────────────────────────────
const PIE_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FF9F1C",
  "#2EC4B6",
  "#E71D36",
  "#6B4E71",
  "#FFB347",
  "#5F9EA0",
  "#E6B800",
  "#B565A7",
  "#009688",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Animation variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { y: 28, opacity: 0, scale: 0.97 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 15 },
  },
};

// ── Tooltip style (shared) ─────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  borderRadius: "14px",
  boxShadow: "0 20px 35px -10px rgba(0,0,0,0.13)",
  border: "1px solid rgba(229,231,235,0.6)",
  padding: "12px 16px",
};

// ── Empty state helper ─────────────────────────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
      <div className="text-5xl mb-3">📭</div>
      <p className="text-gray-500 font-medium text-sm">{message}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  // ── Fetch data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [expRes, incRes] = await Promise.all([
          axios.get("http://localhost:5000/api/expenses", { headers }),
          axios.get("http://localhost:5000/api/income", { headers }),
        ]);
        setExpenses(expRes.data);
        setIncome(incRes.data);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived totals ────────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => income.reduce((s, i) => s + Number(i.amount), 0),
    [income],
  );
  const totalExpense = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses],
  );
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // ── Monthly trend data ────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const cur = new Date().getMonth();
    return MONTHS.slice(0, cur + 1).map((m, i) => {
      const inc = income
        .filter((x) => new Date(x.date).getMonth() === i)
        .reduce((s, x) => s + Number(x.amount), 0);
      const exp = expenses
        .filter((x) => new Date(x.date).getMonth() === i)
        .reduce((s, x) => s + Number(x.amount), 0);
      return { name: m, Income: inc, Expenses: exp, Savings: inc - exp };
    });
  }, [income, expenses]);

  // ── Weekly trend data ─────────────────────────────────────────────────────────
  const weeklyData = useMemo(() => {
    return DAYS.map((d, i) => {
      const inc = income
        .filter((x) => new Date(x.date).getDay() === i)
        .reduce((s, x) => s + Number(x.amount), 0);
      const exp = expenses
        .filter((x) => new Date(x.date).getDay() === i)
        .reduce((s, x) => s + Number(x.amount), 0);
      return { name: d, Income: inc, Expenses: exp, Savings: inc - exp };
    });
  }, [income, expenses]);

  const chartData = period === "weekly" ? weeklyData : monthlyData;

  // ── Category breakdown ────────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // ── Radar data (spending by weekday) ─────────────────────────────────────────
  const radarData = useMemo(() => {
    return DAYS.map((d, i) => ({
      day: d,
      amount: expenses
        .filter((x) => new Date(x.date).getDay() === i)
        .reduce((s, x) => s + Number(x.amount), 0),
    }));
  }, [expenses]);

  // ── Summary cards config ──────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Income",
      value: `₹${totalIncome.toLocaleString()}`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-emerald-500 to-green-600",
      hoverBg: "from-emerald-50 to-green-50",
      text: "text-emerald-600",
      iconBg: "bg-emerald-100",
      bar: Math.min((totalIncome / (totalIncome + 1)) * 100, 100),
    },
    {
      label: "Total Expenses",
      value: `₹${totalExpense.toLocaleString()}`,
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      gradient: "from-red-500 to-rose-600",
      hoverBg: "from-red-50 to-rose-50",
      text: "text-red-600",
      iconBg: "bg-red-100",
      bar:
        totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0,
    },
    {
      label: "Net Savings",
      value: `${netSavings < 0 ? "-" : ""}₹${Math.abs(netSavings).toLocaleString()}`,
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
      gradient:
        netSavings >= 0
          ? "from-blue-500 to-indigo-600"
          : "from-red-500 to-rose-600",
      hoverBg:
        netSavings >= 0
          ? "from-blue-50 to-indigo-50"
          : "from-red-50 to-rose-50",
      text: netSavings >= 0 ? "text-blue-600" : "text-red-600",
      iconBg: netSavings >= 0 ? "bg-blue-100" : "bg-red-100",
      bar:
        totalIncome > 0
          ? Math.min((Math.abs(netSavings) / totalIncome) * 100, 100)
          : 0,
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      gradient: "from-purple-500 to-violet-600",
      hoverBg: "from-purple-50 to-violet-50",
      text: "text-purple-600",
      iconBg: "bg-purple-100",
      bar: Math.min(Math.abs(Number(savingsRate)), 100),
    },
  ];

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const hasData = expenses.length > 0 || income.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Deep insights into your financial patterns
              </p>
            </div>
          </div>

          {/* Period toggle */}
          <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl self-start lg:self-auto">
            {["weekly", "monthly"].map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm capitalize transition-all duration-300 ${
                  period === p
                    ? "bg-white text-blue-600 shadow-lg shadow-blue-100/50"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ══ SUMMARY CARDS ═══════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{
                y: -7,
                scale: 1.02,
                boxShadow: "0 25px 35px -12px rgba(0,0,0,0.13)",
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 overflow-hidden cursor-default"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <div
                    className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${card.text}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={card.icon}
                      />
                    </svg>
                  </div>
                </div>

                <h3 className={`text-3xl font-bold ${card.text}`}>
                  {card.value}
                </h3>

                <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.bar}%` }}
                    transition={{ duration: 1.1, delay: i * 0.12 }}
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══ EMPTY STATE ══════════════════════════════════════════════════════════ */}
        {!hasData ? (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl p-16 shadow-xl text-center"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📉</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No data yet
            </h3>
            <p className="text-gray-500">
              Add income and expenses from the Dashboard to see your analytics.
            </p>
          </motion.div>
        ) : (
          <>
            {/* ══ AREA CHART — Income vs Expenses Trend ════════════════════════════ */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl p-7 lg:p-8 shadow-xl border border-gray-100/80"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                <h2 className="text-xl font-bold text-gray-800">
                  Income vs Expenses&nbsp;
                  <span className="capitalize text-blue-600">({period})</span>
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {[
                      { id: "aInc", color: "#3B82F6" },
                      { id: "aExp", color: "#EF4444" },
                      { id: "aSav", color: "#10B981" },
                    ].map(({ id, color }) => (
                      <linearGradient
                        key={id}
                        id={id}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={color}
                          stopOpacity={0.28}
                        />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val) => [
                      `₹${Number(val).toLocaleString()}`,
                      undefined,
                    ]}
                  />
                  <Legend
                    formatter={(v) => (
                      <span className="text-sm font-medium text-gray-700">
                        {v}
                      </span>
                    )}
                  />
                  {[
                    { key: "Income", color: "#3B82F6", fill: "url(#aInc)" },
                    { key: "Expenses", color: "#EF4444", fill: "url(#aExp)" },
                    { key: "Savings", color: "#10B981", fill: "url(#aSav)" },
                  ].map(({ key, color, fill }) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={3}
                      fill={fill}
                      dot={{
                        r: 4,
                        fill: color,
                        strokeWidth: 2,
                        stroke: "white",
                      }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ══ BAR + PIE ROW ════════════════════════════════════════════════════ */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Bar Chart — spending by category */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Spending by Category
                  </h2>
                </div>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={categoryData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={{ stroke: "#E5E7EB" }}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={{ stroke: "#E5E7EB" }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val) => [
                          `₹${Number(val).toLocaleString()}`,
                          "Spent",
                        ]}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {categoryData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No expense categories yet" />
                )}
              </div>

              {/* Donut Pie Chart — expense breakdown */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Expense Breakdown
                  </h2>
                </div>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        dataKey="value"
                        stroke="white"
                        strokeWidth={3}
                        animationBegin={0}
                        animationDuration={1400}
                        label={({ name, percent }) =>
                          percent > 0.05
                            ? `${name} ${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                      >
                        {categoryData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val) => [
                          `₹${Number(val).toLocaleString()}`,
                          "Spent",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No expense data yet" />
                )}
              </div>
            </motion.div>

            {/* ══ RADAR + CATEGORY TABLE ROW ═══════════════════════════════════════ */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Radar Chart — spending pattern by day */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Spending Pattern by Day
                  </h2>
                </div>
                {expenses.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis
                        dataKey="day"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <Radar
                        name="Expenses"
                        dataKey="amount"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.28}
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: "#8B5CF6",
                          strokeWidth: 2,
                          stroke: "white",
                        }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val) => [
                          `₹${Number(val).toLocaleString()}`,
                          "Spent",
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No expense data yet" />
                )}
              </div>

              {/* Top Spending Categories table */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Top Spending Categories
                  </h2>
                </div>
                {categoryData.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto max-h-64 pr-1">
                    {categoryData.map((cat, i) => {
                      const pct =
                        totalExpense > 0
                          ? ((cat.value / totalExpense) * 100).toFixed(1)
                          : 0;
                      const color = PIE_COLORS[i % PIE_COLORS.length];
                      return (
                        <motion.div
                          key={cat.name}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                #{i + 1} {cat.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-800">
                                ₹{cat.value.toLocaleString()}
                              </span>
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: color + "22", color }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.9, delay: i * 0.07 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyChart message="No categories to show" />
                )}
              </div>
            </motion.div>

            {/* ══ MONTHLY SUMMARY TABLE ════════════════════════════════════════════ */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden"
            >
              <div className="px-7 py-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Monthly Summary
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Income, expenses & savings month by month
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      {["Month", "Income", "Expenses", "Savings", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyData.map((row, i) => {
                      const saving = row.Savings;
                      const status =
                        saving > 0
                          ? "surplus"
                          : saving < 0
                            ? "deficit"
                            : "break-even";
                      const statusCls =
                        status === "surplus"
                          ? "bg-green-100 text-green-700"
                          : status === "deficit"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600";
                      return (
                        <motion.tr
                          key={row.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{
                            backgroundColor: "rgba(243,244,246,0.7)",
                          }}
                          className="group transition-all duration-200"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600">
                            ₹{row.Income.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-red-600">
                            ₹{row.Expenses.toLocaleString()}
                          </td>
                          <td
                            className={`px-6 py-4 font-bold ${saving >= 0 ? "text-blue-600" : "text-red-600"}`}
                          >
                            {saving < 0 ? "-" : ""}₹
                            {Math.abs(saving).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${statusCls}`}
                            >
                              {status === "surplus"
                                ? "✅"
                                : status === "deficit"
                                  ? "⚠️"
                                  : "➖"}{" "}
                              {status}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>

                {monthlyData.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No monthly data available yet.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
