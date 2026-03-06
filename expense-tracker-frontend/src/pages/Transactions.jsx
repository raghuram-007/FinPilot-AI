import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CSVLink } from "react-csv";
import { string, array } from "prop-types";

export default function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 FETCH ALL DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [expenseRes, incomeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/income", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExpenses(expenseRes.data);
      setIncome(incomeRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      alert("Failed to load transactions");
      setLoading(false);
    }
  };

  // 🔹 COMBINE TRANSACTIONS
  const allTransactions = useMemo(
    () => [
      ...expenses.map((exp) => ({
        ...exp,
        type: "expense",
        name: exp.title,
        originalCategory: exp.category,
      })),
      ...income.map((inc) => ({
        ...inc,
        type: "income",
        name: inc.source,
        category: "Income",
        originalCategory: "Income",
      })),
    ],
    [expenses, income],
  );

  // 🔹 CALCULATE TOTALS
  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;
  const totalTransactions = allTransactions.length;

  // 🔹 FILTER + SEARCH + SORT LOGIC
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((item) =>
        filterType === "all" ? true : item.type === filterType,
      )
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        switch (sortType) {
          case "newest":
            return new Date(b.date) - new Date(a.date);
          case "oldest":
            return new Date(a.date) - new Date(b.date);
          case "amount-high":
            return Number(b.amount) - Number(a.amount);
          case "amount-low":
            return Number(a.amount) - Number(b.amount);
          default:
            return 0;
        }
      });
  }, [allTransactions, filterType, search, sortType]);

  // 🔹 PAGINATION
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirst,
    indexOfLast,
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  // 🔹 RESET PAGINATION WHEN FILTERS CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, search, sortType]);

  // 🔹 VALIDATE FORM
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.amount) errors.amount = "Amount is required";
    if (Number(formData.amount) <= 0) errors.amount = "Amount must be positive";
    if (formData.type === "expense" && !formData.category.trim()) {
      errors.category = "Category is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔹 ADD TRANSACTION
  const handleAddTransaction = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");

      if (formData.type === "expense") {
        await axios.post(
          "http://localhost:5000/api/expenses",
          {
            title: formData.title,
            amount: Number(formData.amount),
            category: formData.category,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/income",
          {
            source: formData.title,
            amount: Number(formData.amount),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setShowAddModal(false);
      setFormData({ type: "expense", title: "", amount: "", category: "" });
      setFormErrors({});
      fetchData();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Failed to add transaction");
    }
  };

  // 🔹 DELETE TRANSACTION
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      if (selectedTransaction.type === "expense") {
        await axios.delete(
          `http://localhost:5000/api/expenses/${selectedTransaction._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.delete(
          `http://localhost:5000/api/income/${selectedTransaction._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setShowDeleteModal(false);
      setSelectedTransaction(null);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  // 🔹 CSV DATA
  const csvData = filteredTransactions.map((item) => ({
    Type: item.type,
    Title: item.name,
    Category: item.category,
    Amount: `₹${Number(item.amount).toLocaleString()}`,
    Date: new Date(item.date).toLocaleDateString(),
  }));

  const csvHeaders = [
    { label: "Type", key: "Type" },
    { label: "Title", key: "Title" },
    { label: "Category", key: "Category" },
    { label: "Amount", key: "Amount" },
    { label: "Date", key: "Date" },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.01,
      backgroundColor: "rgba(243, 244, 246, 0.8)",
      transition: { type: "spring", stiffness: 400, damping: 17 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-10 font-sans"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ========== HEADER SECTION ========== */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
              <span className="text-3xl">💳</span>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Transactions
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Manage your income and expenses in one place
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* CSV Export Button */}
            {filteredTransactions.length > 0 && (
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={`transactions-${new Date().toISOString().split("T")[0]}.csv`}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </CSVLink>
            )}

            {/* Add Transaction Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Transaction
            </motion.button>
          </div>
        </motion.div>

        {/* ========== SUMMARY CARDS ========== */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <SummaryCard
            title="Total Income"
            value={totalIncome}
            color="green"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            change="+12.5%"
          />
          <SummaryCard
            title="Total Expenses"
            value={totalExpense}
            color="red"
            icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            change="-8.2%"
          />
          <SummaryCard
            title="Current Balance"
            value={balance}
            color={balance >= 0 ? "blue" : "red"}
            icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
          <SummaryCard
            title="Total Transactions"
            value={totalTransactions}
            color="purple"
            icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            isCount={true}
          />
        </motion.div>

        {/* ========== FILTER & CONTROL SECTION ========== */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Search
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">📋 All Transactions</option>
                <option value="income">📈 Income Only</option>
                <option value="expense">💰 Expenses Only</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="amount-high">💰 Amount: High to Low</option>
                <option value="amount-low">💰 Amount: Low to High</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Showing</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredTransactions.length}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    transactions
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========== TRANSACTIONS TABLE ========== */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">
                Loading transactions...
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title / Source
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout">
                      {currentTransactions.length > 0 ? (
                        currentTransactions.map((item) => (
                          <motion.tr
                            key={item._id}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            whileHover="hover"
                            className="group hover:shadow-md transition-all duration-300"
                          >
                            {/* Type Badge */}
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                                  item.type === "income"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {item.type === "income" ? "📈" : "💰"}
                                <span className="ml-1.5 capitalize">
                                  {item.type}
                                </span>
                              </span>
                            </td>

                            {/* Title / Source */}
                            <td className="px-6 py-5">
                              <div className="font-semibold text-gray-800">
                                {item.name}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-5">
                              <span className="inline-flex px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {item.category}
                              </span>
                            </td>

                            {/* Amount - Color Coded */}
                            <td className="px-6 py-5">
                              <span
                                className={`text-lg font-bold ${
                                  item.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ₹{Number(item.amount).toLocaleString()}
                              </span>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 text-gray-400"
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
                                {new Date(item.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </td>

                            {/* Action - Delete Button */}
                            <td className="px-6 py-5">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedTransaction(item);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-64"
                        >
                          <td colSpan={6} className="text-center">
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-4">
                                <svg
                                  className="h-12 w-12 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-xl font-bold text-gray-700 mb-2">
                                No transactions found
                              </h3>
                              <p className="text-gray-500 mb-4">
                                {search || filterType !== "all"
                                  ? "Try adjusting your filters"
                                  : "Add your first transaction to get started"}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200/50"
                              >
                                + Add Transaction
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* ========== PAGINATION ========== */}
              {totalPages > 1 && (
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-semibold text-gray-700">
                        {indexOfFirst + 1} -{" "}
                        {Math.min(indexOfLast, filteredTransactions.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-700">
                        {filteredTransactions.length}
                      </span>{" "}
                      transactions
                    </p>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                        }`}
                      >
                        Previous
                      </motion.button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <motion.button
                                key={pageNum}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                              >
                                {pageNum}
                              </motion.button>
                            );
                          },
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                        }`}
                      >
                        Next
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* ========== ADD TRANSACTION MODAL ========== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Add New Transaction
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        type: "expense",
                        title: "",
                        amount: "",
                        category: "",
                      });
                      setFormErrors({});
                    }}
                    className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all"
                  >
                    ✕
                  </motion.button>
                </div>
                <p className="text-blue-100 text-sm mt-1 ml-12">
                  Fill in the details below
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setFormData({ ...formData, type: "expense" })
                      }
                      className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        formData.type === "expense"
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200/50"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      💰 Expense
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setFormData({ ...formData, type: "income" })
                      }
                      className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        formData.type === "income"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200/50"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      📈 Income
                    </motion.button>
                  </div>
                </div>

                {/* Title / Source */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {formData.type === "expense" ? "Title" : "Source"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.type === "expense"
                        ? "e.g., Groceries"
                        : "e.g., Salary"
                    }
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      formErrors.title ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      formErrors.amount ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                {/* Category - Only for Expense */}
                {formData.type === "expense" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                        formErrors.category
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">Select a category</option>
                      <option value="Food">🍔 Food & Dining</option>
                      <option value="Transport">🚗 Transportation</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Bills">📄 Bills & Utilities</option>
                      <option value="Health">🏥 Health & Fitness</option>
                      <option value="Education">📚 Education</option>
                      <option value="Other">📌 Other</option>
                    </select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      type: "expense",
                      title: "",
                      amount: "",
                      category: "",
                    });
                    setFormErrors({});
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddTransaction}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Save Transaction
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <AnimatePresence>
        {showDeleteModal && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Delete Transaction
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-red-50 rounded-2xl p-5 mb-5 border border-red-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">
                        {selectedTransaction.type === "income" ? "📈" : "💰"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedTransaction.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedTransaction.type === "income"
                          ? "Income"
                          : "Expense"}{" "}
                        • ₹{Number(selectedTransaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this transaction? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Delete Transaction
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ========== SUMMARY CARD COMPONENT ==========
function SummaryCard({ title, value, color, icon, change, isCount }) {
  const colors = {
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50/50",
      text: "text-green-600",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      shadow: "shadow-green-200/50",
      change: "bg-green-100 text-green-700",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50/50",
      text: "text-red-600",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      shadow: "shadow-red-200/50",
      change: "bg-red-100 text-red-700",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50/50",
      text: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      shadow: "shadow-blue-200/50",
      change: "bg-blue-100 text-blue-700",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-violet-50/50",
      text: "text-purple-600",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
      shadow: "shadow-purple-200/50",
      change: "bg-purple-100 text-purple-700",
    },
  };

  const style = colors[color] || colors.blue;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 overflow-hidden`}
    >
      <div
        className={`absolute inset-0 ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <div
            className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center shadow-lg ${style.shadow} group-hover:scale-110 transition-transform duration-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`text-3xl lg:text-4xl font-bold ${style.text}`}>
            {isCount ? value : `₹${value.toLocaleString()}`}
          </h3>

          {change && (
            <div className="flex items-center gap-2 pt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${style.change}`}
              >
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
