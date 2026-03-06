import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { y: 24, opacity: 0, scale: 0.97 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 15 },
  },
};

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
const CAT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#DDA0DD",
  "#FF9F1C",
  "#2EC4B6",
  "#E71D36",
];

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-3">📭</div>
      <p className="text-gray-500 font-medium text-sm">{message}</p>
    </div>
  );
}

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // ── Fetch all data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [eRes, iRes, bRes] = await Promise.all([
          axios.get("http://localhost:5000/api/expenses", { headers }),
          axios.get("http://localhost:5000/api/income", { headers }),
          axios.get("http://localhost:5000/api/budgets/status", { headers }),
        ]);
        setExpenses(eRes.data);
        setIncome(iRes.data);
        setBudgets(bRes.data);
      } catch (err) {
        console.error("Reports fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Date filtered data ──────────────────────────────────────────────────────
  const from = useMemo(() => new Date(dateFrom), [dateFrom]);
  const to = useMemo(() => {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59);
    return d;
  }, [dateTo]);

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return d >= from && d <= to;
      }),
    [expenses, from, to],
  );
  const filteredIncome = useMemo(
    () =>
      income.filter((i) => {
        const d = new Date(i.date);
        return d >= from && d <= to;
      }),
    [income, from, to],
  );

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => filteredIncome.reduce((s, i) => s + Number(i.amount), 0),
    [filteredIncome],
  );
  const totalExpense = useMemo(
    () => filteredExpenses.reduce((s, e) => s + Number(e.amount), 0),
    [filteredExpenses],
  );
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // ── Monthly summary (all time) ──────────────────────────────────────────────
  const monthlyData = useMemo(
    () =>
      MONTHS.map((m, i) => {
        const inc = income
          .filter((x) => new Date(x.date).getMonth() === i)
          .reduce((s, x) => s + Number(x.amount), 0);
        const exp = expenses
          .filter((x) => new Date(x.date).getMonth() === i)
          .reduce((s, x) => s + Number(x.amount), 0);
        return { month: m, income: inc, expenses: exp, savings: inc - exp };
      }).filter((r) => r.income > 0 || r.expenses > 0),
    [income, expenses],
  );

  // ── Category breakdown (filtered) ──────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ cat, amt }))
      .sort((a, b) => b.amt - a.amt);
  }, [filteredExpenses]);

  // ── All transactions sorted ─────────────────────────────────────────────────
  const allTransactions = useMemo(
    () =>
      [
        ...filteredExpenses.map((e) => ({
          type: "expense",
          name: e.title,
          cat: e.category,
          amount: e.amount,
          date: e.date,
        })),
        ...filteredIncome.map((i) => ({
          type: "income",
          name: i.source,
          cat: "-",
          amount: i.amount,
          date: i.date,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredExpenses, filteredIncome],
  );

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Type", "Title/Source", "Category", "Amount", "Date"],
      ...filteredExpenses.map((e) => [
        "Expense",
        e.title,
        e.category,
        e.amount,
        new Date(e.date).toLocaleDateString(),
      ]),
      ...filteredIncome.map((i) => [
        "Income",
        i.source,
        "-",
        i.amount,
        new Date(i.date).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinanceFlow_Report_${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FinanceFlow Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${dateFrom} to ${dateTo}`, 148, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Income", `Rs ${totalIncome.toLocaleString()}`],
        ["Total Expenses", `Rs ${totalExpense.toLocaleString()}`],
        [
          "Net Savings",
          `Rs ${Math.abs(netSavings).toLocaleString()} ${netSavings < 0 ? "(Deficit)" : ""}`,
        ],
        ["Savings Rate", `${savingsRate}%`],
      ],
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    });

    const y1 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Summary", 14, y1);
    autoTable(doc, {
      startY: y1 + 4,
      head: [["Month", "Income", "Expenses", "Savings", "Status"]],
      body: monthlyData.map((r) => [
        r.month,
        `Rs ${r.income.toLocaleString()}`,
        `Rs ${r.expenses.toLocaleString()}`,
        `Rs ${Math.abs(r.savings).toLocaleString()}`,
        r.savings >= 0 ? "Surplus" : "Deficit",
      ]),
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [236, 253, 245] },
    });

    const y2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Transactions", 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [["Type", "Title/Source", "Category", "Amount", "Date"]],
      body: allTransactions.map((r) => [
        r.type === "income" ? "Income" : "Expense",
        r.name,
        r.cat,
        `Rs ${Number(r.amount).toLocaleString()}`,
        new Date(r.date).toLocaleDateString(),
      ]),
      headStyles: { fillColor: [139, 92, 246] },
      alternateRowStyles: { fillColor: [245, 243, 255] },
    });

    doc.save(`FinanceFlow_Report_${dateFrom}_to_${dateTo}.pdf`);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50">
              <span className="text-3xl">📋</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Reports
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Generate and export your financial reports
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportPDF}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-200/50 hover:shadow-xl transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Export PDF
            </motion.button>
          </div>
        </motion.div>

        {/* DATE RANGE PICKER */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-800 text-lg">
                Date Range
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-500">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm font-medium text-gray-800 bg-gray-50 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-500">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm font-medium text-gray-800 bg-gray-50 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  label: "This Month",
                  fn: () => {
                    const d = new Date();
                    setDateFrom(
                      new Date(d.getFullYear(), d.getMonth(), 1)
                        .toISOString()
                        .split("T")[0],
                    );
                    setDateTo(d.toISOString().split("T")[0]);
                  },
                },
                {
                  label: "Last Month",
                  fn: () => {
                    const d = new Date();
                    const f = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                    const t = new Date(d.getFullYear(), d.getMonth(), 0);
                    setDateFrom(f.toISOString().split("T")[0]);
                    setDateTo(t.toISOString().split("T")[0]);
                  },
                },
                {
                  label: "This Year",
                  fn: () => {
                    const d = new Date();
                    setDateFrom(`${d.getFullYear()}-01-01`);
                    setDateTo(d.toISOString().split("T")[0]);
                  },
                },
              ].map((p) => (
                <motion.button
                  key={p.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={p.fn}
                  className="px-3 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all"
                >
                  {p.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SUMMARY CARDS */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              label: "Total Income",
              value: `₹${totalIncome.toLocaleString()}`,
              gradient: "from-emerald-500 to-green-600",
              bg: "from-emerald-50 to-green-50",
              text: "text-emerald-600",
              iconBg: "bg-emerald-100",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              label: "Total Expenses",
              value: `₹${totalExpense.toLocaleString()}`,
              gradient: "from-red-500 to-rose-600",
              bg: "from-red-50 to-rose-50",
              text: "text-red-600",
              iconBg: "bg-red-100",
              icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
            },
            {
              label: "Net Savings",
              value: `${netSavings < 0 ? "-" : ""}₹${Math.abs(netSavings).toLocaleString()}`,
              gradient:
                netSavings >= 0
                  ? "from-blue-500 to-indigo-600"
                  : "from-red-500 to-rose-600",
              bg:
                netSavings >= 0
                  ? "from-blue-50 to-indigo-50"
                  : "from-red-50 to-rose-50",
              text: netSavings >= 0 ? "text-blue-600" : "text-red-600",
              iconBg: netSavings >= 0 ? "bg-blue-100" : "bg-red-100",
              icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
            },
            {
              label: "Savings Rate",
              value: `${savingsRate}%`,
              gradient: "from-purple-500 to-violet-600",
              bg: "from-purple-50 to-violet-50",
              text: "text-purple-600",
              iconBg: "bg-purple-100",
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: "0 25px 35px -12px rgba(0,0,0,0.12)",
              }}
              className="group relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100/80 overflow-hidden cursor-default"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <div
                    className={`w-11 h-11 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${card.text}`}
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
                <h3 className={`text-2xl font-bold ${card.text}`}>
                  {card.value}
                </h3>
                <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0, 100)}%`,
                    }}
                    transition={{ duration: 1.1, delay: i * 0.1 }}
                    className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* TAB SWITCHER */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl w-fit flex-wrap"
        >
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "monthly", label: "📅 Monthly" },
            { id: "transactions", label: "💳 Transactions" },
            { id: "budget", label: "🎯 Budget vs Actual" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100/50"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Category Breakdown */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Expense Category Breakdown
                  </h2>
                </div>
                {categoryBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {categoryBreakdown.map((c, i) => {
                      const pct =
                        totalExpense > 0
                          ? ((c.amt / totalExpense) * 100).toFixed(1)
                          : 0;
                      const col = CAT_COLORS[i % CAT_COLORS.length];
                      return (
                        <div key={c.cat}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: col }}
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                {c.cat}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-800">
                                ₹{c.amt.toLocaleString()}
                              </span>
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: col + "22",
                                  color: col,
                                }}
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
                              style={{ backgroundColor: col }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState message="No expenses in this date range" />
                )}
              </div>

              {/* Income Sources */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100/80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Income Sources
                  </h2>
                </div>
                {filteredIncome.length > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {filteredIncome.map((inc, i) => (
                      <motion.div
                        key={inc._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/60 to-green-50/30 rounded-2xl border border-emerald-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm">
                            {inc.source?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {inc.source}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(inc.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600">
                          ₹{Number(inc.amount).toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No income in this date range" />
                )}
              </div>
            </motion.div>
          )}

          {/* ── MONTHLY ── */}
          {activeTab === "monthly" && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden"
            >
              <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Monthly Summary
                    </h2>
                    <p className="text-sm text-gray-500">
                      Month-by-month breakdown (all time)
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      {[
                        "Month",
                        "Income",
                        "Expenses",
                        "Savings",
                        "Rate",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthlyData.length > 0 ? (
                      monthlyData.map((row, i) => {
                        const rate =
                          row.income > 0
                            ? ((row.savings / row.income) * 100).toFixed(1)
                            : 0;
                        const status =
                          row.savings > 0
                            ? "surplus"
                            : row.savings < 0
                              ? "deficit"
                              : "break-even";
                        const sCls =
                          status === "surplus"
                            ? "bg-green-100 text-green-700"
                            : status === "deficit"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600";
                        return (
                          <motion.tr
                            key={row.month}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{
                              backgroundColor: "rgba(243,244,246,0.7)",
                            }}
                            className="transition-all duration-200"
                          >
                            <td className="px-6 py-4 font-bold text-gray-800">
                              {row.month}
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-600">
                              ₹{row.income.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-bold text-red-600">
                              ₹{row.expenses.toLocaleString()}
                            </td>
                            <td
                              className={`px-6 py-4 font-bold ${row.savings >= 0 ? "text-blue-600" : "text-red-600"}`}
                            >
                              {row.savings < 0 ? "-" : ""}₹
                              {Math.abs(row.savings).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-700">
                              {rate}%
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${sCls}`}
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
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No monthly data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {monthlyData.length > 0 && (
                    <tfoot>
                      <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-t-2 border-indigo-200">
                        <td className="px-6 py-4 font-bold text-gray-800">
                          Total
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          ₹
                          {monthlyData
                            .reduce((s, r) => s + r.income, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-red-600">
                          ₹
                          {monthlyData
                            .reduce((s, r) => s + r.expenses, 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                          ₹
                          {monthlyData
                            .reduce((s, r) => s + r.savings, 0)
                            .toLocaleString()}
                        </td>
                        <td colSpan={2} className="px-6 py-4" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTIONS ── */}
          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden"
            >
              <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      All Transactions
                    </h2>
                    <p className="text-sm text-gray-500">
                      {allTransactions.length} transactions in selected range
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      {[
                        "Type",
                        "Title / Source",
                        "Category",
                        "Amount",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allTransactions.length > 0 ? (
                      allTransactions.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          whileHover={{
                            backgroundColor: "rgba(243,244,246,0.7)",
                          }}
                          className="transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold ${row.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                            >
                              {row.type === "income"
                                ? "📈 Income"
                                : "💸 Expense"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {row.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                              {row.cat}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 font-bold ${row.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {row.type === "income" ? "+" : "-"}₹
                            {Number(row.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(row.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No transactions in selected date range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── BUDGET VS ACTUAL ── */}
          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden"
            >
              <div className="px-7 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Budget vs Actual Spending
                    </h2>
                    <p className="text-sm text-gray-500">
                      Compare your budgets against real spending
                    </p>
                  </div>
                </div>
              </div>
              {budgets.length > 0 ? (
                <div className="p-7 space-y-5">
                  {budgets.map((b, i) => {
                    const pct = Math.min(b.percentage, 100);
                    const barCol =
                      b.status === "exceeded"
                        ? "bg-red-500"
                        : b.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-emerald-500";
                    const textCol =
                      b.status === "exceeded"
                        ? "text-red-600"
                        : b.status === "warning"
                          ? "text-yellow-600"
                          : "text-emerald-600";
                    const bgCol =
                      b.status === "exceeded"
                        ? "bg-red-50 border-red-200"
                        : b.status === "warning"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-emerald-50 border-emerald-200";
                    return (
                      <motion.div
                        key={b._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`p-5 rounded-2xl border-2 ${bgCol}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {b.category}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">
                              {b.period} budget
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${textCol}`}>
                              {Math.round(b.percentage)}%
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                b.status === "exceeded"
                                  ? "bg-red-100 text-red-700"
                                  : b.status === "warning"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {b.status === "exceeded"
                                ? "🔴 Exceeded"
                                : b.status === "warning"
                                  ? "🟡 Warning"
                                  : "🟢 Good"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.08 }}
                            className={`h-full ${barCol} rounded-full`}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            {
                              label: "Budgeted",
                              val: `₹${b.limit.toLocaleString()}`,
                              cls: "text-gray-800",
                            },
                            {
                              label: "Spent",
                              val: `₹${b.spent.toLocaleString()}`,
                              cls: textCol,
                            },
                            {
                              label: b.remaining >= 0 ? "Remaining" : "Over by",
                              val: `₹${Math.abs(b.remaining).toLocaleString()}`,
                              cls:
                                b.remaining >= 0
                                  ? "text-blue-600"
                                  : "text-red-600",
                            },
                          ].map((c) => (
                            <div
                              key={c.label}
                              className="text-center p-3 bg-white/70 rounded-xl"
                            >
                              <p className="text-xs text-gray-500 mb-1">
                                {c.label}
                              </p>
                              <p className={`font-bold ${c.cls}`}>{c.val}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-16">
                  <EmptyState message="No budgets found. Add budgets from the Budget page." />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
