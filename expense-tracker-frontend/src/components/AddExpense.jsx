import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddExpense({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/expenses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onAdd(res.data);
      setForm({ title: "", amount: "", category: "", date: "" });
    } catch (err) {
      console.error("Failed to add expense:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Title
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <input
            name="title"
            value={form.title}
            placeholder="e.g. Groceries, Rent"
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:shadow-sm text-sm"
            required
          />
        </div>
      </div>

      {/* Amount */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Amount (₹)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-300 font-bold text-sm group-focus-within:text-red-500 transition-colors">₹</span>
          </div>
          <input
            name="amount"
            type="number"
            value={form.amount}
            placeholder="0.00"
            onChange={handleChange}
            className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:shadow-sm text-sm"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Category
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold hover:border-gray-200 hover:shadow-sm text-sm appearance-none"
            required
          >
            <option value="">Select category</option>
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
      </div>

      {/* Date */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold hover:border-gray-200 hover:shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200/60 transition-all duration-300 disabled:opacity-60 text-sm"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )}
        {loading ? "Adding..." : "Add Expense"}
      </motion.button>
    </form>
  );
}