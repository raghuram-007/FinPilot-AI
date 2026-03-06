import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
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

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "📄",
  Health: "🏥",
  Education: "📚",
  Other: "📌",
};

export default function Predictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPredictions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ai/predict", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch predictions");
      const json = await res.json();
      setData(json);
      setError("");
    } catch (err) {
      setError("Could not load predictions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "danger":
        return {
          bg: "from-red-50 to-rose-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
          bar: "from-red-500 to-rose-500",
          icon: "⚠️",
          label: "High Risk",
          text: "text-red-600",
          ring: "ring-red-200",
        };
      case "warning":
        return {
          bg: "from-amber-50 to-yellow-50",
          border: "border-amber-200",
          badge: "bg-amber-100 text-amber-700",
          bar: "from-amber-400 to-yellow-500",
          icon: "⚡",
          label: "Watch Out",
          text: "text-amber-600",
          ring: "ring-amber-200",
        };
      default:
        return {
          bg: "from-emerald-50 to-green-50",
          border: "border-emerald-200",
          badge: "bg-emerald-100 text-emerald-700",
          bar: "from-emerald-400 to-green-500",
          icon: "✅",
          label: "On Track",
          text: "text-emerald-600",
          ring: "ring-emerald-200",
        };
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return { icon: "↑", color: "text-red-500" };
    if (trend === "down") return { icon: "↓", color: "text-emerald-500" };
    return { icon: "→", color: "text-gray-400" };
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <p className="text-gray-600 font-semibold text-lg">🔮 Analyzing your spending patterns...</p>
            <p className="text-gray-400 text-sm mt-1">AI is crunching 3 months of data</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── No Data ─────────────────────────────────────────────────────────────────
  if (data && !data.hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md border border-gray-100"
        >
          <div className="text-7xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Not Enough Data Yet</h2>
          <p className="text-gray-500 mb-6">{data.insight}</p>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
            >
              Add Expenses First →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md"
        >
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPredictions()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const dangerCount = data?.predictions?.filter((p) => p.status === "danger").length || 0;
  const warningCount = data?.predictions?.filter((p) => p.status === "warning").length || 0;
  const goodCount = data?.predictions?.filter((p) => p.status === "good").length || 0;
  const totalPredicted = data?.predictions?.reduce((s, p) => s + p.predicted, 0) || 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 lg:p-10"
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── HEADER ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
              className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50"
            >
              <span className="text-3xl">🔮</span>
            </motion.div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                AI Predictions
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"
                />
                Based on your last 3 months of spending
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPredictions(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-all disabled:opacity-60"
          >
            <motion.span
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
            >
              🔄
            </motion.span>
            {refreshing ? "Refreshing..." : "Refresh Predictions"}
          </motion.button>
        </motion.div>

        {/* ── AI INSIGHT BANNER ── */}
        {data?.insight && (
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl p-6 shadow-2xl shadow-indigo-200/50 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
            </div>
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">AI Insight</p>
                <p className="text-white font-semibold text-lg leading-relaxed">{data.insight}</p>
                {data.topRisk && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-white/80 text-sm">⚠️ Highest risk category:</span>
                    <span className="text-white font-bold text-sm">{data.topRisk}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUMMARY STATS ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Predicted",
              value: `₹${totalPredicted.toLocaleString()}`,
              icon: "🔮",
              bg: "from-indigo-50 to-purple-50",
              text: "text-indigo-600",
              border: "border-indigo-100",
            },
            {
              label: "High Risk",
              value: dangerCount,
              icon: "🔴",
              bg: "from-red-50 to-rose-50",
              text: "text-red-600",
              border: "border-red-100",
            },
            {
              label: "Watch Out",
              value: warningCount,
              icon: "🟡",
              bg: "from-amber-50 to-yellow-50",
              text: "text-amber-600",
              border: "border-amber-100",
            },
            {
              label: "On Track",
              value: goodCount,
              icon: "🟢",
              bg: "from-emerald-50 to-green-50",
              text: "text-emerald-600",
              border: "border-emerald-100",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`bg-gradient-to-br ${s.bg} rounded-2xl p-5 border ${s.border} shadow-sm`}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── PREDICTION CARDS ── */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
            Category Predictions for Next Month
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {data?.predictions?.map((pred, i) => {
                const config = getStatusConfig(pred.status);
                const trend = getTrendIcon(pred.trend);
                const barWidth = Math.min((pred.predicted / (pred.avgSpent * 1.5)) * 100, 100);
                const avgBarWidth = Math.min((pred.avgSpent / (pred.avgSpent * 1.5)) * 100, 100);

                return (
                  <motion.div
                    key={pred.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
                    className={`bg-gradient-to-br ${config.bg} rounded-3xl p-6 border-2 ${config.border} shadow-lg transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-bl-full" />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            {CATEGORY_ICONS[pred.category] || "📌"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{pred.category}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-sm font-bold ${trend.color}`}>{trend.icon}</span>
                              <span className="text-xs text-gray-500">{pred.trendPercent}% vs avg</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${config.badge} flex items-center gap-1`}>
                          {config.icon} {config.label}
                        </span>
                      </div>

                      {/* Amounts */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
                          <p className="text-xs text-gray-500 font-medium mb-1">Your Average</p>
                          <p className="text-xl font-bold text-gray-700">₹{pred.avgSpent.toLocaleString()}</p>
                        </div>
                        <div className={`bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center ring-2 ${config.ring}`}>
                          <p className="text-xs text-gray-500 font-medium mb-1">AI Predicted</p>
                          <p className={`text-xl font-bold ${config.text}`}>₹{pred.predicted.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Progress bars */}
                      <div className="space-y-2 mb-4">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Average</span>
                            <span>₹{pred.avgSpent.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${avgBarWidth}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-full bg-gray-300 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Predicted</span>
                            <span>₹{pred.predicted.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 1.2, delay: i * 0.1 + 0.1 }}
                              className={`h-full bg-gradient-to-r ${config.bar} rounded-full`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* AI Advice */}
                      <div className="bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-start gap-2">
                        <span className="text-sm">💡</span>
                        <p className="text-sm text-gray-600 font-medium">{pred.advice}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── BOTTOM NOTE ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3"
        >
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-gray-500 leading-relaxed">
            Predictions are generated by AI based on your last 3 months of spending history. Actual spending may vary. 
            The more data you add, the more accurate predictions become.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}