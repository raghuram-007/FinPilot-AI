import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
  });

  // ── NEW: AI suggest state ──────────────────────────────────────────────────
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const [creatingBudgets, setCreatingBudgets] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState({});

  useEffect(() => {
    fetchBudgets();
    fetchBudgetStatus();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load budgets:", err);
      setLoading(false);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/budgets/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetStatus(res.data);
    } catch (err) {
      console.error("Failed to load budget status:", err);
    }
  };

  const handleAddBudget = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/budgets",
        { category: formData.category, limit: Number(formData.limit), period: formData.period },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setFormData({ category: "", limit: "", period: "monthly" });
      fetchBudgets();
      fetchBudgetStatus();
    } catch (err) {
      alert("Failed to add budget", err);
    }
  };

  const handleUpdateBudget = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/budgets/${editingBudget._id}`,
        { category: formData.category, limit: Number(formData.limit), period: formData.period },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setEditingBudget(null);
      setFormData({ category: "", limit: "", period: "monthly" });
      fetchBudgets();
      fetchBudgetStatus();
    } catch (err) {
      alert("Failed to update budget", err);
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Delete this budget?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
      fetchBudgetStatus();
    } catch (err) {
      alert("Failed to delete budget", err);
    }
  };

  const startEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({ category: budget.category, limit: budget.limit, period: budget.period });
    setShowEditModal(true);
  };

  // ── NEW: Fetch AI suggestions ──────────────────────────────────────────────
  const fetchAISuggestions = async () => {
    setSuggestLoading(true);
    setSuggestError("");
    setSuggestions([]);
    setShowSuggestModal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/ai/suggest-budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.hasData) {
        setSuggestError(res.data.message || "Not enough data yet.");
      } else {
        // Pre-select all suggestions
        const initialSelected = {};
        res.data.suggestions.forEach((s, i) => { initialSelected[i] = true; });
        setSelectedSuggestions(initialSelected);
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      setSuggestError("Failed to get suggestions. Please try again.");
    } finally {
      setSuggestLoading(false);
    }
  };

  // ── NEW: Create selected budgets in one click ──────────────────────────────
  const createSelectedBudgets = async () => {
    setCreatingBudgets(true);
    const token = localStorage.getItem("token");
    const toCreate = suggestions.filter((_, i) => selectedSuggestions[i]);
    try {
      // Get existing budget categories to avoid duplicates
      const existingCats = budgets.map((b) => b.category.toLowerCase());
      const newOnes = toCreate.filter((s) => !existingCats.includes(s.category.toLowerCase()));

      await Promise.all(
        newOnes.map((s) =>
          axios.post(
            "http://localhost:5000/api/budgets",
            { category: s.category, limit: s.suggestedLimit, period: s.period || "monthly" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setShowSuggestModal(false);
      setSuggestions([]);
      fetchBudgets();
      fetchBudgetStatus();
    } catch (err) {
      setSuggestError("Some budgets couldn't be created. Please try again.");
    } finally {
      setCreatingBudgets(false);
    }
  };

  const toggleSuggestion = (i) => {
    setSelectedSuggestions((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const categoryEmoji = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
    Bills: "📄", Health: "🏥", Education: "📚", Other: "📌",
  };

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10"
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header (existing + AI button added) ── */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200/50">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Budget Tracking
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Set and monitor your spending limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ── NEW: AI Suggest Button ── */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={fetchAISuggestions}
              className="px-5 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-2 text-white"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", boxShadow: "0 4px 20px rgba(102,126,234,0.4)" }}
            >
              <span className="text-lg">🤖</span>
              AI Suggest Budgets
            </motion.button>

            {/* existing Add Budget button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200/50 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Budget
            </motion.button>
          </div>
        </motion.div>

        {/* ── Loading State (existing) ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading budgets...</p>
          </div>
        ) : budgetStatus.length === 0 ? (
          /* ── Empty State (existing + AI suggestion prompt added) ── */
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-12 shadow-xl text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No budgets yet</h3>
            <p className="text-gray-500 mb-6">Start setting spending limits for your categories</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={fetchAISuggestions}
                className="px-6 py-3 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
              >
                🤖 Let AI Suggest Budgets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200/50"
              >
                + Create Manually
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ── Budget Cards Grid (existing, unchanged) ── */
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetStatus.map((budget) => (
              <BudgetCard key={budget._id} budget={budget} onDelete={deleteBudget} onEdit={startEdit} />
            ))}
          </motion.div>
        )}

        {/* ── Existing Modals (unchanged) ── */}
        <AnimatePresence>
          {showAddModal && (
            <BudgetModal
              title="Add New Budget" formData={formData} setFormData={setFormData}
              onSubmit={handleAddBudget}
              onClose={() => { setShowAddModal(false); setFormData({ category: "", limit: "", period: "monthly" }); }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showEditModal && (
            <BudgetModal
              title="Edit Budget" formData={formData} setFormData={setFormData}
              onSubmit={handleUpdateBudget} isEdit={true}
              onClose={() => { setShowEditModal(false); setEditingBudget(null); setFormData({ category: "", limit: "", period: "monthly" }); }}
            />
          )}
        </AnimatePresence>

        {/* ── NEW: AI Suggest Modal ── */}
        <AnimatePresence>
          {showSuggestModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 flex-shrink-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">AI Budget Suggestions</h3>
                        <p className="text-white/70 text-sm">Based on your last 3 months</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                      onClick={() => { setShowSuggestModal(false); setSuggestions([]); setSuggestError(""); }}
                      className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all">✕
                    </motion.button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {suggestLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
                      <p className="text-gray-500 font-medium">Analyzing your spending patterns...</p>
                      <p className="text-gray-400 text-sm mt-1">This takes just a second 🧠</p>
                    </div>
                  ) : suggestError ? (
                    <div className="text-center py-10">
                      <div className="text-5xl mb-4">📊</div>
                      <p className="text-gray-600 font-medium">{suggestError}</p>
                      <p className="text-gray-400 text-sm mt-2">Add more expenses and try again!</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500 text-sm mb-4">
                        Select the budgets you want to create. I've suggested limits based on your average spending:
                      </p>
                      <div className="space-y-3">
                        {suggestions.map((s, i) => {
                          const alreadyExists = budgets.some((b) => b.category.toLowerCase() === s.category.toLowerCase());
                          return (
                            <motion.div key={i}
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                              onClick={() => !alreadyExists && toggleSuggestion(i)}
                              className={`rounded-2xl p-4 border-2 transition-all duration-200 ${
                                alreadyExists
                                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                  : selectedSuggestions[i]
                                  ? "border-purple-400 bg-purple-50 cursor-pointer"
                                  : "border-gray-200 bg-white cursor-pointer hover:border-purple-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* checkbox */}
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    alreadyExists ? "border-gray-300 bg-gray-200"
                                    : selectedSuggestions[i] ? "border-purple-500 bg-purple-500" : "border-gray-300"
                                  }`}>
                                    {(selectedSuggestions[i] || alreadyExists) && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-2xl">{categoryEmoji[s.category] || "📌"}</span>
                                  <div>
                                    <p className="font-bold text-gray-800">{s.category}</p>
                                    <p className="text-xs text-gray-500">{s.reason}</p>
                                    {alreadyExists && <p className="text-xs text-amber-500 font-medium">Already have a budget</p>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400 line-through">avg ₹{Number(s.avgSpent).toLocaleString()}</p>
                                  <p className="text-lg font-bold text-purple-600">₹{Number(s.suggestedLimit).toLocaleString()}</p>
                                  <p className="text-xs text-gray-400">/ month</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                {!suggestLoading && !suggestError && suggestions.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex justify-between items-center gap-3">
                    <p className="text-sm text-gray-500">
                      {Object.values(selectedSuggestions).filter(Boolean).length} of {suggestions.length} selected
                    </p>
                    <div className="flex gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setShowSuggestModal(false); setSuggestions([]); }}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium text-sm">
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={createSelectedBudgets} disabled={creatingBudgets || Object.values(selectedSuggestions).every((v) => !v)}
                        className="px-5 py-2.5 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                        {creatingBudgets ? (
                          <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Creating...</>
                        ) : "✅ Create Selected Budgets"}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

// ── Existing BudgetCard (unchanged) ───────────────────────────────────────────
function BudgetCard({ budget, onDelete, onEdit }) {
  const getStatusColor = () => {
    if (budget.status === "exceeded") return { ring: "ring-red-500", text: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-rose-600" };
    if (budget.status === "warning") return { ring: "ring-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", gradient: "from-yellow-500 to-orange-600" };
    return { ring: "ring-green-500", text: "text-green-600", bg: "bg-green-50", gradient: "from-green-500 to-emerald-600" };
  };
  const colors = getStatusColor();
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }}
      className={`bg-white rounded-3xl p-6 shadow-xl border-2 ${colors.ring} transition-all duration-300 overflow-hidden relative`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-30`} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{budget.category}</h3>
            <p className="text-sm text-gray-500 mt-1 capitalize">{budget.period} budget</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(budget)} className="p-2 hover:bg-blue-50 rounded-lg transition">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(budget._id)} className="p-2 hover:bg-red-50 rounded-lg transition">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className={`text-2xl font-bold ${colors.text}`}>{Math.round(budget.percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(budget.percentage, 100)}%` }} transition={{ duration: 1, delay: 0.2 }}
              className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Spent</span>
            <span className={`font-bold text-lg ${colors.text}`}>₹{budget.spent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Budget Limit</span>
            <span className="font-semibold text-gray-800">₹{budget.limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className={`font-bold text-lg ${budget.remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              {budget.remaining >= 0 ? "+" : ""}₹{Math.abs(budget.remaining).toLocaleString()}
            </span>
          </div>
        </div>
        <div className={`mt-5 px-4 py-3 ${colors.bg} rounded-xl text-center border-2 ${colors.ring}`}>
          <span className={`text-sm font-bold uppercase ${colors.text} flex items-center justify-center gap-2`}>
            {budget.status === "exceeded" && "⚠️ Over Budget"}
            {budget.status === "warning" && "⚡ Nearly There"}
            {budget.status === "good" && "✅ On Track"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Existing BudgetModal (unchanged) ──────────────────────────────────────────
function BudgetModal({ title, formData, setFormData, onSubmit, onClose, isEdit = false }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all">✕
            </motion.button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white">
              <option value="">Select Category</option>
              <option value="Food">🍔 Food & Dining</option>
              <option value="Transport">🚗 Transportation</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Bills">📄 Bills & Utilities</option>
              <option value="Health">🏥 Health & Fitness</option>
              <option value="Education">📚 Education</option>
              <option value="Other">📌 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Limit (₹)</label>
            <input type="number" value={formData.limit} onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g., 5000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Period</label>
            <div className="grid grid-cols-3 gap-3">
              {["weekly", "monthly", "yearly"].map((period) => (
                <motion.button key={period} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, period })}
                  className={`py-3 px-4 rounded-xl font-medium text-sm capitalize transition-all duration-300 ${
                    formData.period === period ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>{period}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium">Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSubmit}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
            {isEdit ? "Update Budget" : "Create Budget"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}