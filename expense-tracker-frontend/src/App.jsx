import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Transactions from "./pages/Transactions";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Budget from "./pages/Budget";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIChatWidget from "./components/AIChatWidget";
import Predictions from "./pages/Predictions";

// ── NEW: Month-End Recap Popup Component ──────────────────────────────────────
function MonthEndRecapPopup({ onClose }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecap = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/ai/monthly-recap", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecap(res.data);
      } catch (err) {
        console.error("Recap fetch failed:", err);
        setRecap(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecap();
  }, []);

  const scoreColor = (score) => {
    if (score >= 8) return "#10b981";
    if (score >= 5) return "#f59e0b";
    return "#ef4444";
  };

  const scoreLabel = (score) => {
    if (score >= 8) return "Excellent! 🌟";
    if (score >= 6) return "Good Job! 👍";
    if (score >= 4) return "Room to improve 💪";
    return "Needs attention ⚠️";
  };

  const categoryEmoji = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
    Bills: "📄", Health: "🏥", Education: "📚", Other: "📌",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 flex-shrink-0 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📅</div>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Monthly Recap</p>
                <h2 className="text-white text-xl font-bold">
                  {recap?.monthName || "Last Month"} Review
                </h2>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all">✕
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
              <p className="text-gray-500 font-medium">Generating your recap...</p>
              <p className="text-gray-400 text-sm mt-1">Analyzing last month's data 🧠</p>
            </div>
          ) : !recap?.hasData ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-600 font-medium">No data for last month</p>
              <p className="text-gray-400 text-sm mt-2">Keep tracking your expenses this month!</p>
            </div>
          ) : (
            <>
              {/* Total Spent */}
              <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #667eea15, #764ba215)", border: "1px solid #667eea30" }}>
                <p className="text-gray-500 text-sm mb-1">Total Spent in {recap.monthName}</p>
                <p className="text-4xl font-bold" style={{ color: "#667eea" }}>
                  ₹{Number(recap.totalSpent).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm mt-1">{recap.expenseCount} transactions</p>
              </div>

              {/* AI Verdict */}
              {recap.overallVerdict && (
                <div className="rounded-2xl p-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">🤖 AI Verdict</p>
                  <p className="text-gray-700 font-medium text-sm">{recap.overallVerdict}</p>
                </div>
              )}

              {/* Savings Score */}
              {recap.savingsScore && (
                <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "#fafafa", border: "1px solid #e5e7eb" }}>
                  <div className="flex-shrink-0">
                    <svg className="w-16 h-16" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke={scoreColor(recap.savingsScore)} strokeWidth="3"
                        strokeDasharray={`${recap.savingsScore * 10}, 100`}
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${recap.savingsScore * 10}, 100` }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                      <text x="18" y="20.5" textAnchor="middle" fontSize="10" fontWeight="bold"
                        fill={scoreColor(recap.savingsScore)}>{recap.savingsScore}/10</text>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{scoreLabel(recap.savingsScore)}</p>
                    <p className="text-gray-500 text-sm">Finance Management Score</p>
                  </div>
                </div>
              )}

              {/* Win & Risk */}
              <div className="grid grid-cols-2 gap-3">
                {recap.biggestWin && (
                  <div className="rounded-2xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p className="text-xs font-bold text-green-600 mb-1">✅ Best Habit</p>
                    <p className="text-gray-700 text-xs font-medium">{recap.biggestWin}</p>
                  </div>
                )}
                {recap.biggestRisk && (
                  <div className="rounded-2xl p-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                    <p className="text-xs font-bold text-orange-600 mb-1">⚠️ Watch Out</p>
                    <p className="text-gray-700 text-xs font-medium">{recap.biggestRisk}</p>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              {recap.byCategory && Object.keys(recap.byCategory).length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Spending Breakdown</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {Object.entries(recap.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amt], i) => {
                        const pct = Math.round((amt / recap.totalSpent) * 100);
                        return (
                          <div key={i} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{categoryEmoji[cat] || "📌"}</span>
                                <span className="text-sm font-semibold text-gray-700">{cat}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-gray-800">₹{Number(amt).toLocaleString()}</span>
                                <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, #667eea, #764ba2)" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Tip for this month */}
              {recap.topTip && (
                <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #667eea10, #764ba210)", border: "1px solid #667eea30" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#667eea" }}>💡 Tip for This Month</p>
                  <p className="text-gray-700 text-sm font-medium">{recap.topTip}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all">
            Maybe Later
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="flex-1 py-3 text-white rounded-xl font-medium transition-all"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            Got it! 🚀
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  // ── NEW: Month-end recap state ─────────────────────────────────────────────
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    // Only show recap if user is logged in
    if (!localStorage.getItem("token")) return;

    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;

    // Check if we already showed recap this month (so it doesn't repeat on every refresh)
    const lastShown = localStorage.getItem("recapShownMonth");
    const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;

    if (isFirstOfMonth && lastShown !== currentMonthKey) {
      // Show after 2s delay so page loads first
      const timer = setTimeout(() => {
        setShowRecap(true);
        localStorage.setItem("recapShownMonth", currentMonthKey);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseRecap = () => setShowRecap(false);

  return (
    <>
      <Navbar />
      <Routes>
        {/* ── All existing routes unchanged ── */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
      </Routes>
      <Footer />

      {/* ── Existing AI Chat Widget ── */}
      {localStorage.getItem("token") && <AIChatWidget />}

      {/* ── NEW: Month-End Recap Popup ── */}
      <AnimatePresence>
        {showRecap && <MonthEndRecapPopup onClose={handleCloseRecap} />}
      </AnimatePresence>
    </>
  );
}

export default App;