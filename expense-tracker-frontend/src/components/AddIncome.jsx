import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddIncome({ onAdd }) {
  const [form, setForm] = useState({ source: "", amount: "", date: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source || !form.amount) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/income", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onAdd(res.data);
      setForm({ source: "", amount: "", date: "" });
    } catch (err) {
      console.error("Failed to add income:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Source */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Source
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            name="source"
            value={form.source}
            placeholder="e.g. Salary, Freelance"
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:shadow-sm text-sm"
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
            <span className="text-gray-300 font-bold text-sm group-focus-within:text-green-500 transition-colors">₹</span>
          </div>
          <input
            name="amount"
            type="number"
            value={form.amount}
            placeholder="0.00"
            onChange={handleChange}
            className="w-full pl-9 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:shadow-sm text-sm"
            required
          />
        </div>
      </div>

      {/* Date */}
      <div className="group">
        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-widest uppercase">
          Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-400/40 focus:border-green-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold hover:border-gray-200 hover:shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 transition-all duration-300 disabled:opacity-60 text-sm"
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
        {loading ? "Adding..." : "Add Income"}
      </motion.button>
    </form>
  );
}