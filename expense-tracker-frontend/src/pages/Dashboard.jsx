// import { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import AddExpense from "../components/AddExpense";
// import AddIncome from "../components/AddIncome";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   AreaChart,
//   Area,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
// } from "recharts";

// export default function Dashboard() {
//   const [expenses, setExpenses] = useState([]);
//   const [income, setIncome] = useState([]);
//   const [budgetStatus, setBudgetStatus] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [activeTab, setActiveTab] = useState("expenses");
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [selectedPeriod, setSelectedPeriod] = useState("month");
//   const [editForm, setEditForm] = useState({
//     title: "",
//     amount: "",
//     category: "",
//   });

//   // ✅ NEW: Income edit state
//   const [editingIncomeId, setEditingIncomeId] = useState(null);
//   const [editIncomeForm, setEditIncomeForm] = useState({
//     source: "",
//     amount: "",
//   });

//   const { logout, user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     fetchExpenses();
//     fetchIncome();
//     fetchBudgetStatus();
//     const userInfo = localStorage.getItem("user");
//     if (userInfo) {
//       setUserData(JSON.parse(userInfo));
//     }
//   }, []);

//   // 🔹 FETCH EXPENSES
//   const fetchExpenses = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:5000/api/expenses", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setExpenses(res.data);
//     } catch (err) {
//       console.error("Failed to load expenses:", err);
//       alert("Failed to load expenses");
//     }
//   };

//   // 🔹 FETCH INCOME
//   const fetchIncome = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:5000/api/income", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setIncome(res.data);
//     } catch (err) {
//       console.error("Failed to load income:", err);
//       alert("Failed to load income");
//     }
//   };

//   // 🔹 FETCH BUDGET STATUS
//   const fetchBudgetStatus = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("http://localhost:5000/api/budgets/status", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBudgetStatus(res.data);
//     } catch (err) {
//       console.error("Failed to load budget status:", err);
//     }
//   };

//   // 🔹 START EDIT EXPENSE
//   const startEdit = (exp) => {
//     setEditingId(exp._id);
//     setEditForm({
//       title: exp.title,
//       amount: exp.amount,
//       category: exp.category,
//     });
//   };

//   // 🔹 SAVE EDIT EXPENSE
//   const saveEdit = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.put(
//         `http://localhost:5000/api/expenses/${id}`,
//         editForm,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       setExpenses(expenses.map((exp) => (exp._id === id ? res.data : exp)));
//       setEditingId(null);
//       fetchBudgetStatus();
//     } catch (err) {
//       console.error("Failed to update expense:", err);
//       alert("Failed to update expense");
//     }
//   };

//   // 🔥 DELETE EXPENSE
//   const deleteExpense = async (id) => {
//     if (!window.confirm("Delete this expense?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setExpenses(expenses.filter((exp) => exp._id !== id));
//       fetchBudgetStatus();
//     } catch (err) {
//       console.error("Failed to delete expense:", err);
//       alert("Failed to delete expense");
//     }
//   };

//   // 🔥 DELETE INCOME
//   const deleteIncome = async (id) => {
//     if (!window.confirm("Delete this income?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`http://localhost:5000/api/income/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setIncome(income.filter((inc) => inc._id !== id));
//     } catch (err) {
//       console.error("Failed to delete income:", err);
//       alert("Failed to delete income");
//     }
//   };

//   // ✅ NEW: START EDIT INCOME
//   const startEditIncome = (inc) => {
//     setEditingIncomeId(inc._id);
//     setEditIncomeForm({
//       source: inc.source,
//       amount: inc.amount,
//     });
//   };

//   // ✅ NEW: SAVE EDIT INCOME
//   const saveEditIncome = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.put(
//         `http://localhost:5000/api/income/${id}`,
//         editIncomeForm,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setIncome(income.map((inc) => (inc._id === id ? res.data : inc)));
//       setEditingIncomeId(null);
//     } catch (err) {
//       console.error("Failed to update income:", err);
//       alert("Failed to update income");
//     }
//   };

//   // 🔹 LOGOUT
//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // 🔢 TOTAL CALCULATIONS
//   const totalExpense = expenses.reduce(
//     (sum, exp) => sum + Number(exp.amount),
//     0,
//   );
//   const totalIncome = income.reduce((sum, inc) => sum + Number(inc.amount), 0);
//   const balance = totalIncome - totalExpense;
//   const savingsRate =
//     totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

//   // CHECK IF ANY BUDGET IS EXCEEDED
//   const overBudgetCount = budgetStatus.filter(
//     (b) => b.status === "exceeded",
//   ).length;
//   const warningBudgetCount = budgetStatus.filter(
//     (b) => b.status === "warning",
//   ).length;

//   // 📊 CHART DATA
//   const categoryData = expenses.reduce((acc, exp) => {
//     const existing = acc.find((item) => item.name === exp.category);
//     if (existing) {
//       existing.value += Number(exp.amount);
//     } else {
//       acc.push({ name: exp.category, value: Number(exp.amount) });
//     }
//     return acc;
//   }, []);

//   const generateMonthlyData = () => {
//     const months = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//     ];
//     const currentMonth = new Date().getMonth();

//     return months.slice(0, currentMonth + 1).map((month, index) => {
//       const monthExpenses = expenses
//         .filter((exp) => new Date(exp.date).getMonth() === index)
//         .reduce((sum, exp) => sum + Number(exp.amount), 0);

//       const monthIncome = income
//         .filter((inc) => new Date(inc.date).getMonth() === index)
//         .reduce((sum, inc) => sum + Number(inc.amount), 0);

//       return {
//         name: month,
//         income: monthIncome || 0,
//         expenses: monthExpenses || 0,
//         savings: (monthIncome || 0) - (monthExpenses || 0),
//       };
//     });
//   };

//   const monthlyData = generateMonthlyData();

//   const PIE_COLORS = [
//     "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
//     "#DDA0DD", "#FF9F1C", "#2EC4B6", "#E71D36", "#FF9F1C",
//     "#6B4E71", "#FFB347", "#5F9EA0", "#E6B800", "#B565A7",
//     "#009688", "#FF8060", "#8D6B94", "#3C887E", "#F0A07C",
//     "#6A4C93", "#1985A1", "#D64C4C", "#4A8FE4", "#F4B942",
//     "#A37C45", "#7E6B8F", "#DA627D", "#53B3CB", "#F9A826",
//     "#A2D6F9", "#B5838D", "#6D597A", "#B8F2E6", "#FFB5A7",
//     "#A9D6E5", "#FCD5CE", "#D9E5D6", "#FFD966", "#E5989B",
//   ];

//   const COLORS = {
//     blue: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"],
//     green: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"],
//     red: ["#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"],
//     purple: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
//     orange: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7"],
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.08, delayChildren: 0.1 },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 30, opacity: 0, scale: 0.95 },
//     visible: {
//       y: 0, opacity: 1, scale: 1,
//       transition: { type: "spring", stiffness: 120, damping: 15 },
//     },
//   };

//   const sidebarVariants = {
//     expanded: { width: 280, transition: { type: "spring", stiffness: 100, damping: 20 } },
//     collapsed: { width: 88, transition: { type: "spring", stiffness: 100, damping: 20 } },
//   };

//   const cardVariants = {
//     hover: {
//       y: -8, scale: 1.02,
//       boxShadow: "0 25px 35px -12px rgba(0,0,0,0.15)",
//       transition: { type: "spring", stiffness: 400, damping: 17 },
//     },
//     tap: { scale: 0.98 },
//   };

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//       className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans"
//     >
//       {/* SIDEBAR */}
//       <motion.aside
//         variants={sidebarVariants}
//         animate={sidebarCollapsed ? "collapsed" : "expanded"}
//         className="bg-white/90 backdrop-blur-xl shadow-2xl relative flex flex-col h-screen sticky top-0 border-r border-gray-100/50"
//         style={{ boxShadow: "0 20px 40px -15px rgba(0,0,0,0.07)" }}
//       >
//         <motion.button
//           whileHover={{ scale: 1.15, rotate: 180, backgroundColor: "#F3F4F6" }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//           className="absolute -right-4 top-12 bg-white rounded-full p-2 shadow-xl border border-gray-100 z-20 hover:shadow-2xl transition-all duration-300"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className={`h-4 w-4 text-gray-600 transition-transform duration-500 ${sidebarCollapsed ? "rotate-180" : ""}`}
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//           </svg>
//         </motion.button>

//         {/* Logo */}
//         <div className="p-7 border-b border-gray-100/80">
//           <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <AnimatePresence>
//               {!sidebarCollapsed && (
//                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
//                   <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">FinanceFlow</h2>
//                   <p className="text-xs text-gray-500 mt-0.5">Premium Dashboard</p>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-5">
//           <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5 px-3">
//             {!sidebarCollapsed ? "MENU" : "•••"}
//           </p>
//           <ul className="space-y-2.5">
//             {[
//               {
//                 icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
//                 label: "Dashboard", path: "/dashboard", active: location.pathname === "/dashboard",
//               },
//               {
//                 icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
//                 label: "Analytics", path: "/analytics", active: location.pathname === "/analytics",
//               },
//               {
//                 icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
//                 label: "Reports", path: "/reports", active: location.pathname === "/reports",
//               },
//               {
//                 icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
//                 label: "Settings", path: "/profile", active: location.pathname === "/profile",
//               },
//             ].map((item, index) => (
//               <motion.li key={index} whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
//                 <Link
//                   to={item.path || "#"}
//                   className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
//                     item.active
//                       ? "bg-gradient-to-r from-blue-50 to-indigo-50/80 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-100"
//                       : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
//                   }`}
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${item.active ? "text-blue-600" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
//                   </svg>
//                   <AnimatePresence>
//                     {!sidebarCollapsed && (
//                       <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">
//                         {item.label}
//                       </motion.span>
//                     )}
//                   </AnimatePresence>
//                   {item.active && !sidebarCollapsed && (
//                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
//                   )}
//                 </Link>
//               </motion.li>
//             ))}
//           </ul>
//         </nav>

//         {/* User Profile */}
//         <div className="p-5 border-t border-gray-100/80">
//           <motion.div
//             whileHover={{ y: -3 }}
//             className="flex items-center gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/50 backdrop-blur-sm border border-gray-100"
//           >
//             <div className="relative">
//               <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-200/50">
//                 {userData?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
//               </div>
//               <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
//             </div>
//             <AnimatePresence>
//               {!sidebarCollapsed && (
//                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1">
//                   <p className="text-sm font-semibold text-gray-800">
//                     {userData?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "User"}
//                   </p>
//                   <p className="text-xs text-gray-500 truncate">
//                     {userData?.email || user?.email || "user@example.com"}
//                   </p>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//             <motion.button
//               whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleLogout}
//               className="p-2.5 text-red-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//             </motion.button>
//           </motion.div>
//         </div>
//       </motion.aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
//         <div className="max-w-7xl mx-auto space-y-8">

//           {/* HEADER */}
//           <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//             <div className="space-y-2">
//               <div className="flex items-center gap-3">
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
//                   className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center"
//                 >
//                   <span className="text-3xl">👋</span>
//                 </motion.div>
//                 <div>
//                   <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl lg:text-4xl font-bold text-gray-800">
//                     Welcome back,{" "}
//                     <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {userData?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "User"}
//                     </span>
//                   </motion.h1>
//                   <p className="text-gray-500 mt-1 flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
//                     Here's your financial summary for today
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <motion.div
//               whileHover={{ scale: 1.02, y: -2 }}
//               className="flex items-center gap-4 bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg border border-gray-100/50"
//             >
//               <div className="flex items-center gap-2">
//                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm text-gray-600">Last updated:</span>
//               </div>
//               <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-xl">
//                 {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* BUDGET ALERT BANNER */}
//           {overBudgetCount > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               variants={itemVariants}
//               className="bg-gradient-to-r from-red-50 to-rose-50/50 border-2 border-red-200 rounded-2xl p-5 shadow-lg"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-lg font-bold text-red-800">Budget Alert!</h4>
//                     <p className="text-sm text-red-600 mt-0.5">
//                       {overBudgetCount} {overBudgetCount === 1 ? "budget is" : "budgets are"} over limit
//                       {warningBudgetCount > 0 && `, ${warningBudgetCount} nearing limit`}
//                     </p>
//                   </div>
//                 </div>
//                 <Link to="/budget">
//                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium shadow-lg hover:bg-red-700 transition-all">
//                     View Budgets
//                   </motion.button>
//                 </Link>
//               </div>
//             </motion.div>
//           )}

//           {/* STATS CARDS */}
//           <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//             {[
//               {
//                 title: "Total Income", value: totalIncome,
//                 icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
//                 gradient: "from-green-500 to-emerald-600", lightGradient: "from-green-50 to-emerald-50/50",
//                 textColor: "text-green-600", iconBg: "bg-green-100", chartColor: COLORS.green,
//               },
//               {
//                 title: "Total Expenses", value: totalExpense,
//                 icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
//                 gradient: "from-red-500 to-rose-600", lightGradient: "from-red-50 to-rose-50/50",
//                 textColor: "text-red-600", iconBg: "bg-red-100", chartColor: COLORS.red,
//               },
//               {
//                 title: "Current Balance", value: balance,
//                 icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
//                 gradient: balance >= 0 ? "from-blue-500 to-indigo-600" : "from-red-500 to-rose-600",
//                 lightGradient: balance >= 0 ? "from-blue-50 to-indigo-50/50" : "from-red-50 to-rose-50/50",
//                 textColor: balance >= 0 ? "text-blue-600" : "text-red-600",
//                 iconBg: balance >= 0 ? "bg-blue-100" : "bg-red-100",
//                 chartColor: balance >= 0 ? COLORS.blue : COLORS.red,
//               },
//             ].map((stat, index) => (
//               <motion.div
//                 key={index}
//                 variants={cardVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 overflow-hidden"
//               >
//                 <div className={`absolute inset-0 bg-gradient-to-br ${stat.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
//                 <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
//                     <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
//                       <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${stat.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
//                       </svg>
//                     </motion.div>
//                   </div>
//                   <div className="space-y-2">
//                     <h3 className={`text-3xl lg:text-4xl font-bold ${stat.textColor}`}>₹{stat.value.toLocaleString()}</h3>
//                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
//                       <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: `${Math.min((Math.abs(stat.value) / 100000) * 100, 100)}%` }}
//                         transition={{ duration: 1, delay: index * 0.2 }}
//                         className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
//                       />
//                     </div>
//                     <div className="flex items-center justify-between pt-2">
//                       <span className="text-xs text-gray-500">vs last month</span>
//                       <motion.span
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                           monthlyData.length > 1
//                             ? monthlyData[monthlyData.length - 1]?.income > monthlyData[monthlyData.length - 2]?.income
//                               ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {monthlyData.length > 1 ? (
//                           <>
//                             {monthlyData[monthlyData.length - 1]?.income > monthlyData[monthlyData.length - 2]?.income ? "↑" : "↓"}
//                             {Math.abs((((monthlyData[monthlyData.length - 1]?.income - monthlyData[monthlyData.length - 2]?.income) / monthlyData[monthlyData.length - 2]?.income) * 100).toFixed(1))}%
//                           </>
//                         ) : "No data"}
//                       </motion.span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* BUDGET OVERVIEW */}
//           {budgetStatus.length > 0 && (
//             <motion.div variants={itemVariants}>
//               <div className="bg-white rounded-3xl p-7 lg:p-8 shadow-xl border border-gray-100/80">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200/50">
//                       <span className="text-2xl">🎯</span>
//                     </div>
//                     <div>
//                       <h3 className="text-2xl font-bold text-gray-800">Budget Overview</h3>
//                       <p className="text-sm text-gray-500 mt-0.5">Track your spending limits</p>
//                     </div>
//                   </div>
//                   <Link to="/budget">
//                     <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
//                       View All
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </motion.button>
//                   </Link>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {budgetStatus.slice(0, 3).map((budget) => (
//                     <BudgetMiniCard key={budget._id} budget={budget} />
//                   ))}
//                 </div>
//                 {budgetStatus.length > 3 && (
//                   <div className="mt-6 text-center">
//                     <Link to="/budget">
//                       <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="text-purple-600 font-medium hover:text-purple-700 flex items-center gap-2 mx-auto">
//                         View {budgetStatus.length - 3} more budget{budgetStatus.length - 3 > 1 ? "s" : ""}
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </motion.button>
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* ADD FORMS */}
//           <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
//             {/* Income Form */}
//             <motion.div whileHover={{ y: -5 }} className="group bg-white rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 relative overflow-hidden">
//               <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               <div className="relative z-10">
//                 <div className="flex items-center gap-4 mb-7">
//                   <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-800">Add Income</h3>
//                     <p className="text-sm text-gray-500 mt-0.5">Record your earnings</p>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <AddIncome onAdd={(inc) => { const newIncome = { ...inc, source: inc.source || inc.title }; setIncome([newIncome, ...income]); }} />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Expense Form */}
//             <motion.div whileHover={{ y: -5 }} className="group bg-white rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 relative overflow-hidden">
//               <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               <div className="relative z-10">
//                 <div className="flex items-center gap-4 mb-7">
//                   <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-800">Add Expense</h3>
//                     <p className="text-sm text-gray-500 mt-0.5">Track your spending</p>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <AddExpense onAdd={(exp) => { setExpenses([exp, ...expenses]); fetchBudgetStatus(); }} />
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* CHARTS SECTION */}
//           {(expenses.length > 0 || income.length > 0) && (
//             <motion.div variants={itemVariants}>
//               <div className="bg-white rounded-3xl p-7 lg:p-8 shadow-xl border border-gray-100/80">
//                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
//                   <div>
//                     <h3 className="text-2xl font-bold text-gray-800">Financial Overview</h3>
//                     <p className="text-gray-500 mt-1 flex items-center gap-2">
//                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
//                       Real-time analytics based on your transactions
//                     </p>
//                   </div>
//                   <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
//                     {["week", "month", "year"].map((period) => (
//                       <motion.button
//                         key={period}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         onClick={() => setSelectedPeriod(period)}
//                         className={`px-6 py-2.5 rounded-xl font-medium text-sm capitalize transition-all duration-300 ${
//                           selectedPeriod === period ? "bg-white text-blue-600 shadow-lg shadow-blue-100/50" : "text-gray-600 hover:bg-white/50"
//                         }`}
//                       >
//                         {period}
//                       </motion.button>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
//                   {/* Area Chart */}
//                   <div className="h-80 lg:h-96">
//                     <div className="flex items-center gap-2 mb-5">
//                       <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
//                       <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Income vs Expenses Trend</h4>
//                     </div>
//                     <ResponsiveContainer width="100%" height="90%">
//                       <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
//                         <defs>
//                           <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
//                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
//                           </linearGradient>
//                           <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
//                             <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
//                           </linearGradient>
//                           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
//                             <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
//                             <feMerge>
//                               <feMergeNode in="offsetblur" />
//                               <feMergeNode in="SourceGraphic" />
//                             </feMerge>
//                           </filter>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
//                         <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "#E5E7EB" }} />
//                         <YAxis stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "#E5E7EB" }} />
//                         <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "16px", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)", border: "1px solid rgba(229,231,235,0.5)", backdropFilter: "blur(8px)", padding: "12px 16px" }} labelStyle={{ fontWeight: "bold", color: "#1F2937", marginBottom: "4px" }} />
//                         <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>} />
//                         <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" filter="url(#glow)" dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} />
//                         <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" filter="url(#glow)" dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>

//                   {/* Pie Chart */}
//                   <div className="h-80 lg:h-96">
//                     <div className="flex items-center gap-2 mb-5">
//                       <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
//                       <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Expense Categories</h4>
//                     </div>
//                     {categoryData.length > 0 ? (
//                       <ResponsiveContainer width="100%" height="90%">
//                         <PieChart>
//                           <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""} outerRadius={90} innerRadius={50} fill="#8884d8" dataKey="value" animationBegin={0} animationDuration={1500} stroke="white" strokeWidth={3}>
//                             {categoryData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="white" strokeWidth={3} />
//                             ))}
//                           </Pie>
//                           <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "16px", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)", border: "1px solid rgba(229,231,235,0.5)", backdropFilter: "blur(8px)" }} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     ) : (
//                       <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl p-8">
//                         <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mb-4">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
//                           </svg>
//                         </div>
//                         <p className="text-gray-500 font-medium">No expense data available</p>
//                         <p className="text-sm text-gray-400 mt-1">Add expenses to see analytics</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* TRANSACTIONS SECTION */}
//           <motion.div variants={itemVariants}>
//             <div className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">
//               <div className="px-7 lg:px-8 py-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 border-b border-gray-100">
//                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Transactions</h3>
//                       <p className="text-sm text-gray-500 mt-0.5">Manage your income and expenses</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
//                     <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab("expenses")} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "expenses" ? "bg-white text-red-600 shadow-lg shadow-red-100/50" : "text-gray-600 hover:bg-white/50"}`}>
//                       <span className="text-base">💰</span>
//                       Expenses
//                       {expenses.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{expenses.length}</span>}
//                     </motion.button>
//                     <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab("income")} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "income" ? "bg-white text-green-600 shadow-lg shadow-green-100/50" : "text-gray-600 hover:bg-white/50"}`}>
//                       <span className="text-base">📈</span>
//                       Income
//                       {income.length > 0 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold">{income.length}</span>}
//                     </motion.button>
//                   </div>
//                 </div>
//               </div>

//               <AnimatePresence mode="wait">
//                 {/* EXPENSES TAB */}
//                 {activeTab === "expenses" ? (
//                   <motion.div key="expenses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="p-7 lg:p-8">
//                     {expenses.length === 0 ? (
//                       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-8">
//                         <div className="w-28 h-28 bg-gradient-to-br from-red-50 to-rose-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0-6l6 6m-6-6l6-6m-6 6l-6-6" />
//                           </svg>
//                         </div>
//                         <h4 className="text-xl font-bold text-gray-700 mb-2">No expenses yet</h4>
//                         <p className="text-gray-500 mb-6">Start tracking your spending by adding your first expense</p>
//                         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.querySelector('input[placeholder*="Title"]')?.focus()} className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-200/50 hover:shadow-xl transition-all duration-300">
//                           + Add Expense
//                         </motion.button>
//                       </motion.div>
//                     ) : (
//                       <div className="space-y-4">
//                         {expenses.map((exp) => (
//                           <motion.div
//                             key={exp._id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -20 }}
//                             whileHover={{ scale: 1.01, x: 6, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
//                             className="group bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-5 hover:bg-white transition-all duration-300 border border-gray-100/80 hover:border-red-100"
//                           >
//                             {editingId === exp._id ? (
//                               <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//                                 <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white" placeholder="Expense title" />
//                                 <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white" placeholder="Amount" />
//                                 <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white">
//                                   <option value="">Select category</option>
//                                   <option value="Food">🍔 Food</option>
//                                   <option value="Transport">🚗 Transport</option>
//                                   <option value="Shopping">🛍️ Shopping</option>
//                                   <option value="Entertainment">🎬 Entertainment</option>
//                                   <option value="Bills">📄 Bills</option>
//                                   <option value="Other">📌 Other</option>
//                                 </select>
//                                 <div className="flex gap-2">
//                                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => saveEdit(exp._id)} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">Save</motion.button>
//                                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingId(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">Cancel</motion.button>
//                                 </div>
//                               </div>
//                             ) : (
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-5">
//                                   <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">
//                                     {exp.category?.charAt(0) || "E"}
//                                   </div>
//                                   <div>
//                                     <h4 className="font-semibold text-gray-800 text-lg">{exp.title}</h4>
//                                     <div className="flex items-center gap-3 mt-2">
//                                       <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">{exp.category}</span>
//                                       <span className="text-xs text-gray-400 flex items-center gap-1">
//                                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                         </svg>
//                                         {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center gap-6">
//                                   <span className="text-2xl font-bold text-red-600">₹{Number(exp.amount).toLocaleString()}</span>
//                                   <div className="flex items-center gap-2">
//                                     <motion.button whileHover={{ scale: 1.1, backgroundColor: "#EFF6FF" }} whileTap={{ scale: 0.9 }} onClick={() => startEdit(exp)} className="p-2.5 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300">
//                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                       </svg>
//                                     </motion.button>
//                                     <motion.button whileHover={{ scale: 1.1, backgroundColor: "#FEF2F2" }} whileTap={{ scale: 0.9 }} onClick={() => deleteExpense(exp._id)} className="p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
//                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                       </svg>
//                                     </motion.button>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </motion.div>
//                         ))}
//                       </div>
//                     )}
//                   </motion.div>
//                 ) : (
//                   // INCOME TAB
//                   <motion.div key="income" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="p-7 lg:p-8">
//                     {income.length === 0 ? (
//                       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-8">
//                         <div className="w-28 h-28 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                           </svg>
//                         </div>
//                         <h4 className="text-xl font-bold text-gray-700 mb-2">No income yet</h4>
//                         <p className="text-gray-500 mb-6">Start recording your income sources</p>
//                         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.querySelector('input[placeholder*="Source"]')?.focus()} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-200/50 hover:shadow-xl transition-all duration-300">
//                           + Add Income
//                         </motion.button>
//                       </motion.div>
//                     ) : (
//                       <div className="space-y-4">
//                         {income.map((inc) => (
//                           <motion.div
//                             key={inc._id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -20 }}
//                             whileHover={{ scale: 1.01, x: 6, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
//                             className="group bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-5 hover:bg-white transition-all duration-300 border border-gray-100/80 hover:border-green-100"
//                           >
//                             {/* ✅ NEW: EDIT MODE for income */}
//                             {editingIncomeId === inc._id ? (
//                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                                 <input
//                                   value={editIncomeForm.source}
//                                   onChange={(e) => setEditIncomeForm({ ...editIncomeForm, source: e.target.value })}
//                                   className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white font-medium text-gray-800"
//                                   placeholder="Income source"
//                                 />
//                                 <input
//                                   type="number"
//                                   value={editIncomeForm.amount}
//                                   onChange={(e) => setEditIncomeForm({ ...editIncomeForm, amount: e.target.value })}
//                                   className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white font-medium text-gray-800"
//                                   placeholder="Amount"
//                                 />
//                                 <div className="flex gap-2">
//                                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => saveEditIncome(inc._id)} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
//                                     Save
//                                   </motion.button>
//                                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingIncomeId(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">
//                                     Cancel
//                                   </motion.button>
//                                 </div>
//                               </div>
//                             ) : (
//                               // VIEW MODE
//                               <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-5">
//                                   <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
//                                     {inc.source?.charAt(0) || "I"}
//                                   </div>
//                                   <div>
//                                     <h4 className="font-semibold text-gray-800 text-lg">{inc.source}</h4>
//                                     <div className="flex items-center gap-3 mt-2">
//                                       <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">Income</span>
//                                       <span className="text-xs text-gray-400 flex items-center gap-1">
//                                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                         </svg>
//                                         {new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center gap-6">
//                                   <span className="text-2xl font-bold text-green-600">₹{Number(inc.amount).toLocaleString()}</span>
//                                   <div className="flex items-center gap-2">
//                                     {/* ✅ NEW: EDIT BUTTON for income */}
//                                     <motion.button
//                                       whileHover={{ scale: 1.1, backgroundColor: "#F0FDF4" }}
//                                       whileTap={{ scale: 0.9 }}
//                                       onClick={() => startEditIncome(inc)}
//                                       className="p-2.5 text-gray-500 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300"
//                                     >
//                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                       </svg>
//                                     </motion.button>
//                                     {/* EXISTING DELETE BUTTON — unchanged */}
//                                     <motion.button
//                                       whileHover={{ scale: 1.1, backgroundColor: "#FEF2F2" }}
//                                       whileTap={{ scale: 0.9 }}
//                                       onClick={() => deleteIncome(inc._id)}
//                                       className="p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300"
//                                     >
//                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                       </svg>
//                                     </motion.button>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </motion.div>
//                         ))}
//                       </div>
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>

//         </div>
//       </main>
//     </motion.div>
//   );
// }

// // BUDGET MINI CARD COMPONENT
// function BudgetMiniCard({ budget }) {
//   const getStatusColor = () => {
//     if (budget.status === "exceeded")
//       return { ring: "ring-red-500", text: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-rose-600", barColor: "bg-red-500" };
//     if (budget.status === "warning")
//       return { ring: "ring-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", gradient: "from-yellow-500 to-orange-600", barColor: "bg-yellow-500" };
//     return { ring: "ring-green-500", text: "text-green-600", bg: "bg-green-50", gradient: "from-green-500 to-emerald-600", barColor: "bg-green-500" };
//   };

//   const colors = getStatusColor();

//   return (
//     <motion.div
//       whileHover={{ y: -3, scale: 1.02 }}
//       className={`bg-white rounded-2xl p-5 shadow-lg border-2 ${colors.ring} transition-all duration-300`}
//     >
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <h4 className="text-lg font-bold text-gray-800">{budget.category}</h4>
//           <p className="text-xs text-gray-500 capitalize mt-0.5">{budget.period}</p>
//         </div>
//         <div className={`px-3 py-1 ${colors.bg} rounded-full`}>
//           <span className={`text-xs font-bold ${colors.text}`}>{Math.round(budget.percentage)}%</span>
//         </div>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className={`h-full ${colors.barColor} rounded-full`}
//         />
//       </div>
//       <div className="grid grid-cols-2 gap-3 text-sm">
//         <div>
//           <p className="text-gray-500 text-xs">Spent</p>
//           <p className={`font-bold ${colors.text}`}>₹{budget.spent.toLocaleString()}</p>
//         </div>
//         <div className="text-right">
//           <p className="text-gray-500 text-xs">Limit</p>
//           <p className="font-semibold text-gray-800">₹{budget.limit.toLocaleString()}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// }


import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddExpense from "../components/AddExpense";
import AddIncome from "../components/AddIncome";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ── NEW: items per page ────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    category: "",
  });

  // ✅ EXISTING: Income edit state
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editIncomeForm, setEditIncomeForm] = useState({
    source: "",
    amount: "",
  });

  // ── NEW: filter + pagination state ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchExpenses();
    fetchIncome();
    fetchBudgetStatus();
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setUserData(JSON.parse(userInfo));
    }
  }, []);

  // reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterCategory, filterDateFrom, filterDateTo]);

  // 🔹 FETCH EXPENSES
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      alert("Failed to load expenses");
    }
  };

  // 🔹 FETCH INCOME
  const fetchIncome = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/income", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncome(res.data);
    } catch (err) {
      console.error("Failed to load income:", err);
      alert("Failed to load income");
    }
  };

  // 🔹 FETCH BUDGET STATUS
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

  // 🔹 START EDIT EXPENSE
  const startEdit = (exp) => {
    setEditingId(exp._id);
    setEditForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
    });
  };

  // 🔹 SAVE EDIT EXPENSE
  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/expenses/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setExpenses(expenses.map((exp) => (exp._id === id ? res.data : exp)));
      setEditingId(null);
      fetchBudgetStatus();
    } catch (err) {
      console.error("Failed to update expense:", err);
      alert("Failed to update expense");
    }
  };

  // 🔥 DELETE EXPENSE
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((exp) => exp._id !== id));
      fetchBudgetStatus();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      alert("Failed to delete expense");
    }
  };

  // 🔥 DELETE INCOME
  const deleteIncome = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/income/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncome(income.filter((inc) => inc._id !== id));
    } catch (err) {
      console.error("Failed to delete income:", err);
      alert("Failed to delete income");
    }
  };

  // ✅ EXISTING: START EDIT INCOME
  const startEditIncome = (inc) => {
    setEditingIncomeId(inc._id);
    setEditIncomeForm({
      source: inc.source,
      amount: inc.amount,
    });
  };

  // ✅ EXISTING: SAVE EDIT INCOME
  const saveEditIncome = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/income/${id}`,
        editIncomeForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncome(income.map((inc) => (inc._id === id ? res.data : inc)));
      setEditingIncomeId(null);
    } catch (err) {
      console.error("Failed to update income:", err);
      alert("Failed to update income");
    }
  };

  // 🔹 LOGOUT
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔢 TOTAL CALCULATIONS
  const totalExpense = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );
  const totalIncome = income.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const balance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const overBudgetCount = budgetStatus.filter((b) => b.status === "exceeded").length;
  const warningBudgetCount = budgetStatus.filter((b) => b.status === "warning").length;

  // 📊 CHART DATA
  const categoryData = expenses.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.category);
    if (existing) {
      existing.value += Number(exp.amount);
    } else {
      acc.push({ name: exp.category, value: Number(exp.amount) });
    }
    return acc;
  }, []);

  const generateMonthlyData = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const currentMonth = new Date().getMonth();
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthExpenses = expenses
        .filter((exp) => new Date(exp.date).getMonth() === index)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);
      const monthIncome = income
        .filter((inc) => new Date(inc.date).getMonth() === index)
        .reduce((sum, inc) => sum + Number(inc.amount), 0);
      return {
        name: month,
        income: monthIncome || 0,
        expenses: monthExpenses || 0,
        savings: (monthIncome || 0) - (monthExpenses || 0),
      };
    });
  };

  const monthlyData = generateMonthlyData();

  // ── NEW: filtered + paginated logic ───────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchSearch = !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "all" || exp.category === filterCategory;
      const expDate = new Date(exp.date);
      const matchFrom = !filterDateFrom || expDate >= new Date(filterDateFrom);
      const matchTo = !filterDateTo || expDate <= new Date(filterDateTo + "T23:59:59");
      return matchSearch && matchCategory && matchFrom && matchTo;
    });
  }, [expenses, searchQuery, filterCategory, filterDateFrom, filterDateTo]);

  const filteredIncome = useMemo(() => {
    return income.filter((inc) => {
      const matchSearch = !searchQuery || inc.source.toLowerCase().includes(searchQuery.toLowerCase());
      const incDate = new Date(inc.date);
      const matchFrom = !filterDateFrom || incDate >= new Date(filterDateFrom);
      const matchTo = !filterDateTo || incDate <= new Date(filterDateTo + "T23:59:59");
      return matchSearch && matchFrom && matchTo;
    });
  }, [income, searchQuery, filterDateFrom, filterDateTo]);

  const activeList = activeTab === "expenses" ? filteredExpenses : filteredIncome;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE);
  const paginatedList = activeList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };
  const hasActiveFilters = searchQuery || filterCategory !== "all" || filterDateFrom || filterDateTo;

  const PIE_COLORS = [
    "#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#FF9F1C","#2EC4B6",
    "#E71D36","#FF9F1C","#6B4E71","#FFB347","#5F9EA0","#E6B800","#B565A7","#009688",
    "#FF8060","#8D6B94","#3C887E","#F0A07C","#6A4C93","#1985A1","#D64C4C","#4A8FE4",
    "#F4B942","#A37C45","#7E6B8F","#DA627D","#53B3CB","#F9A826","#A2D6F9","#B5838D",
    "#6D597A","#B8F2E6","#FFB5A7","#A9D6E5","#FCD5CE","#D9E5D6","#FFD966","#E5989B",
  ];

  const COLORS = {
    blue: ["#3B82F6","#60A5FA","#93C5FD","#BFDBFE","#DBEAFE"],
    green: ["#10B981","#34D399","#6EE7B7","#A7F3D0","#D1FAE5"],
    red: ["#EF4444","#F87171","#FCA5A5","#FECACA","#FEE2E2"],
    purple: ["#8B5CF6","#A78BFA","#C4B5FD","#DDD6FE","#EDE9FE"],
    orange: ["#F59E0B","#FBBF24","#FCD34D","#FDE68A","#FEF3C7"],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 15 } },
  };
  const sidebarVariants = {
    expanded: { width: 280, transition: { type: "spring", stiffness: 100, damping: 20 } },
    collapsed: { width: 88, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };
  const cardVariants = {
    hover: { y: -8, scale: 1.02, boxShadow: "0 25px 35px -12px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 400, damping: 17 } },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans"
    >
      {/* ── SIDEBAR — 100% unchanged ── */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        className="bg-white/90 backdrop-blur-xl shadow-2xl relative flex flex-col h-screen sticky top-0 border-r border-gray-100/50"
        style={{ boxShadow: "0 20px 40px -15px rgba(0,0,0,0.07)" }}
      >
        <motion.button
          whileHover={{ scale: 1.15, rotate: 180, backgroundColor: "#F3F4F6" }} whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-4 top-12 bg-white rounded-full p-2 shadow-xl border border-gray-100 z-20 hover:shadow-2xl transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 transition-transform duration-500 ${sidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <div className="p-7 border-b border-gray-100/80">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">FinanceFlow</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Premium Dashboard</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <nav className="flex-1 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5 px-3">{!sidebarCollapsed ? "MENU" : "•••"}</p>
          <ul className="space-y-2.5">
            {[
              { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Dashboard", path: "/dashboard", active: location.pathname === "/dashboard" },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Analytics", path: "/analytics", active: location.pathname === "/analytics" },
              { icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Reports", path: "/reports", active: location.pathname === "/reports" },
              { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", label: "Settings", path: "/profile", active: location.pathname === "/profile" },
            ].map((item, index) => (
              <motion.li key={index} whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Link to={item.path || "#"} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${item.active ? "bg-gradient-to-r from-blue-50 to-indigo-50/80 text-blue-700 shadow-md shadow-blue-100/50 border border-blue-100" : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${item.active ? "text-blue-600" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium text-sm">{item.label}</motion.span>
                    )}
                  </AnimatePresence>
                  {item.active && !sidebarCollapsed && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="p-5 border-t border-gray-100/80">
          <motion.div whileHover={{ y: -3 }} className="flex items-center gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-gray-50/80 to-gray-100/50 backdrop-blur-sm border border-gray-100">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-200/50">
                {userData?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{userData?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{userData?.email || user?.email || "user@example.com"}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }} whileTap={{ scale: 0.9 }} onClick={handleLogout} className="p-2.5 text-red-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* HEADER — unchanged */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.2 }} className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </motion.div>
                <div>
                  <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl lg:text-4xl font-bold text-gray-800">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {userData?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "User"}
                    </span>
                  </motion.h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Here's your financial summary for today
                  </p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} className="flex items-center gap-4 bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg border border-gray-100/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Last updated:</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-xl">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </motion.div>
          </motion.div>

          {/* BUDGET ALERT BANNER — unchanged */}
          {overBudgetCount > 0 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} variants={itemVariants} className="bg-gradient-to-r from-red-50 to-rose-50/50 border-2 border-red-200 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-800">Budget Alert!</h4>
                    <p className="text-sm text-red-600 mt-0.5">{overBudgetCount} {overBudgetCount === 1 ? "budget is" : "budgets are"} over limit{warningBudgetCount > 0 && `, ${warningBudgetCount} nearing limit`}</p>
                  </div>
                </div>
                <Link to="/budget">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium shadow-lg hover:bg-red-700 transition-all">View Budgets</motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* STATS CARDS — unchanged */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "Total Income", value: totalIncome, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-green-500 to-emerald-600", lightGradient: "from-green-50 to-emerald-50/50", textColor: "text-green-600", iconBg: "bg-green-100", chartColor: COLORS.green },
              { title: "Total Expenses", value: totalExpense, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", gradient: "from-red-500 to-rose-600", lightGradient: "from-red-50 to-rose-50/50", textColor: "text-red-600", iconBg: "bg-red-100", chartColor: COLORS.red },
              { title: "Current Balance", value: balance, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3", gradient: balance >= 0 ? "from-blue-500 to-indigo-600" : "from-red-500 to-rose-600", lightGradient: balance >= 0 ? "from-blue-50 to-indigo-50/50" : "from-red-50 to-rose-50/50", textColor: balance >= 0 ? "text-blue-600" : "text-red-600", iconBg: balance >= 0 ? "bg-blue-100" : "bg-red-100", chartColor: balance >= 0 ? COLORS.blue : COLORS.red },
            ].map((stat, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover" whileTap="tap" className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.lightGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                    <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${stat.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-3xl lg:text-4xl font-bold ${stat.textColor}`}>₹{stat.value.toLocaleString()}</h3>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((Math.abs(stat.value) / 100000) * 100, 100)}%` }} transition={{ duration: 1, delay: index * 0.2 }} className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">vs last month</span>
                      <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`text-xs font-semibold px-2 py-1 rounded-full ${monthlyData.length > 1 ? monthlyData[monthlyData.length - 1]?.income > monthlyData[monthlyData.length - 2]?.income ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                        {monthlyData.length > 1 ? <>{monthlyData[monthlyData.length - 1]?.income > monthlyData[monthlyData.length - 2]?.income ? "↑" : "↓"}{Math.abs((((monthlyData[monthlyData.length - 1]?.income - monthlyData[monthlyData.length - 2]?.income) / monthlyData[monthlyData.length - 2]?.income) * 100).toFixed(1))}%</> : "No data"}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* BUDGET OVERVIEW — unchanged */}
          {budgetStatus.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-3xl p-7 lg:p-8 shadow-xl border border-gray-100/80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200/50"><span className="text-2xl">🎯</span></div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Budget Overview</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Track your spending limits</p>
                    </div>
                  </div>
                  <Link to="/budget">
                    <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                      View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </motion.button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {budgetStatus.slice(0, 3).map((budget) => (<BudgetMiniCard key={budget._id} budget={budget} />))}
                </div>
                {budgetStatus.length > 3 && (
                  <div className="mt-6 text-center">
                    <Link to="/budget">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="text-purple-600 font-medium hover:text-purple-700 flex items-center gap-2 mx-auto">
                        View {budgetStatus.length - 3} more budget{budgetStatus.length - 3 > 1 ? "s" : ""}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ADD FORMS — unchanged */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <motion.div whileHover={{ y: -5 }} className="group bg-white rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <div><h3 className="text-xl font-bold text-gray-800">Add Income</h3><p className="text-sm text-gray-500 mt-0.5">Record your earnings</p></div>
                </div>
                <div className="space-y-4">
                  <AddIncome onAdd={(inc) => { const newIncome = { ...inc, source: inc.source || inc.title }; setIncome([newIncome, ...income]); }} />
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="group bg-white rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div><h3 className="text-xl font-bold text-gray-800">Add Expense</h3><p className="text-sm text-gray-500 mt-0.5">Track your spending</p></div>
                </div>
                <div className="space-y-4">
                  <AddExpense onAdd={(exp) => { setExpenses([exp, ...expenses]); fetchBudgetStatus(); }} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* CHARTS SECTION — unchanged */}
          {(expenses.length > 0 || income.length > 0) && (
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-3xl p-7 lg:p-8 shadow-xl border border-gray-100/80">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Financial Overview</h3>
                    <p className="text-gray-500 mt-1 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Real-time analytics based on your transactions</p>
                  </div>
                  <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
                    {["week","month","year"].map((period) => (
                      <motion.button key={period} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPeriod(period)} className={`px-6 py-2.5 rounded-xl font-medium text-sm capitalize transition-all duration-300 ${selectedPeriod === period ? "bg-white text-blue-600 shadow-lg shadow-blue-100/50" : "text-gray-600 hover:bg-white/50"}`}>{period}</motion.button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                  <div className="h-80 lg:h-96">
                    <div className="flex items-center gap-2 mb-5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div><h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Income vs Expenses Trend</h4></div>
                    <ResponsiveContainer width="100%" height="90%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" /><feMerge><feMergeNode in="offsetblur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "#E5E7EB" }} />
                        <YAxis stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "#E5E7EB" }} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "16px", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)", border: "1px solid rgba(229,231,235,0.5)", backdropFilter: "blur(8px)", padding: "12px 16px" }} labelStyle={{ fontWeight: "bold", color: "#1F2937", marginBottom: "4px" }} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>} />
                        <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" filter="url(#glow)" dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} />
                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" filter="url(#glow)" dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-80 lg:h-96">
                    <div className="flex items-center gap-2 mb-5"><div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div><h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Expense Categories</h4></div>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""} outerRadius={90} innerRadius={50} fill="#8884d8" dataKey="value" animationBegin={0} animationDuration={1500} stroke="white" strokeWidth={3}>
                            {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="white" strokeWidth={3} />))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "16px", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.15)", border: "1px solid rgba(229,231,235,0.5)", backdropFilter: "blur(8px)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl p-8">
                        <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">No expense data available</p>
                        <p className="text-sm text-gray-400 mt-1">Add expenses to see analytics</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTIONS SECTION — filter + pagination added only ── */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/80 overflow-hidden">

              {/* Tab header — unchanged */}
              <div className="px-7 lg:px-8 py-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Transactions</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Manage your income and expenses</p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab("expenses")} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "expenses" ? "bg-white text-red-600 shadow-lg shadow-red-100/50" : "text-gray-600 hover:bg-white/50"}`}>
                      <span className="text-base">💰</span> Expenses
                      {expenses.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{expenses.length}</span>}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab("income")} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "income" ? "bg-white text-green-600 shadow-lg shadow-green-100/50" : "text-gray-600 hover:bg-white/50"}`}>
                      <span className="text-base">📈</span> Income
                      {income.length > 0 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold">{income.length}</span>}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── NEW: Filter Bar ── */}
              <div className="px-7 lg:px-8 py-4 border-b border-gray-100 bg-gray-50/40">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[180px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeTab === "expenses" ? "Search expenses..." : "Search income..."}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                  {activeTab === "expenses" && (
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 min-w-[150px]">
                      <option value="all">All Categories</option>
                      <option value="Food">🍔 Food</option>
                      <option value="Transport">🚗 Transport</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Bills">📄 Bills</option>
                      <option value="Other">📌 Other</option>
                    </select>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">From</span>
                    <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">To</span>
                    <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                      className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700" />
                  </div>
                  {hasActiveFilters && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearFilters}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1.5 border border-red-100">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Clear
                    </motion.button>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {activeList.length} result{activeList.length !== 1 ? "s" : ""}{hasActiveFilters && " (filtered)"}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* EXPENSES TAB */}
                {activeTab === "expenses" ? (
                  <motion.div key="expenses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="p-7 lg:p-8">
                    {expenses.length === 0 ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-8">
                        <div className="w-28 h-28 bg-gradient-to-br from-red-50 to-rose-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0-6l6 6m-6-6l6-6m-6 6l-6-6" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-700 mb-2">No expenses yet</h4>
                        <p className="text-gray-500 mb-6">Start tracking your spending by adding your first expense</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.querySelector('input[placeholder*="Title"]')?.focus()} className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-200/50 hover:shadow-xl transition-all duration-300">+ Add Expense</motion.button>
                      </motion.div>
                    ) : paginatedList.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-gray-500 font-medium">No expenses match your filters</p>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={clearFilters} className="mt-4 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all">Clear Filters</motion.button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedList.map((exp) => (
                          <motion.div key={exp._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ scale: 1.01, x: 6, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }} className="group bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-5 hover:bg-white transition-all duration-300 border border-gray-100/80 hover:border-red-100">
                            {editingId === exp._id ? (
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white" placeholder="Expense title" />
                                <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white" placeholder="Amount" />
                                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white">
                                  <option value="">Select category</option>
                                  <option value="Food">🍔 Food</option>
                                  <option value="Transport">🚗 Transport</option>
                                  <option value="Shopping">🛍️ Shopping</option>
                                  <option value="Entertainment">🎬 Entertainment</option>
                                  <option value="Bills">📄 Bills</option>
                                  <option value="Other">📌 Other</option>
                                </select>
                                <div className="flex gap-2">
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => saveEdit(exp._id)} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">Save</motion.button>
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingId(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">Cancel</motion.button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-200/50 group-hover:scale-110 transition-transform duration-300">{exp.category?.charAt(0) || "E"}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800 text-lg">{exp.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">{exp.category}</span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="text-2xl font-bold text-red-600">₹{Number(exp.amount).toLocaleString()}</span>
                                  <div className="flex items-center gap-2">
                                    <motion.button whileHover={{ scale: 1.1, backgroundColor: "#EFF6FF" }} whileTap={{ scale: 0.9 }} onClick={() => startEdit(exp)} className="p-2.5 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1, backgroundColor: "#FEF2F2" }} whileTap={{ scale: 0.9 }} onClick={() => deleteExpense(exp._id)} className="p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // INCOME TAB — unchanged logic, uses paginatedList
                  <motion.div key="income" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="p-7 lg:p-8">
                    {income.length === 0 ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-8">
                        <div className="w-28 h-28 bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-700 mb-2">No income yet</h4>
                        <p className="text-gray-500 mb-6">Start recording your income sources</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.querySelector('input[placeholder*="Source"]')?.focus()} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-200/50 hover:shadow-xl transition-all duration-300">+ Add Income</motion.button>
                      </motion.div>
                    ) : paginatedList.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="text-gray-500 font-medium">No income matches your filters</p>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={clearFilters} className="mt-4 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all">Clear Filters</motion.button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedList.map((inc) => (
                          <motion.div key={inc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ scale: 1.01, x: 6, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }} className="group bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-5 hover:bg-white transition-all duration-300 border border-gray-100/80 hover:border-green-100">
                            {editingIncomeId === inc._id ? (
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <input value={editIncomeForm.source} onChange={(e) => setEditIncomeForm({ ...editIncomeForm, source: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white font-medium text-gray-800" placeholder="Income source" />
                                <input type="number" value={editIncomeForm.amount} onChange={(e) => setEditIncomeForm({ ...editIncomeForm, amount: e.target.value })} className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white font-medium text-gray-800" placeholder="Amount" />
                                <div className="flex gap-2">
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => saveEditIncome(inc._id)} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">Save</motion.button>
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingIncomeId(null)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">Cancel</motion.button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">{inc.source?.charAt(0) || "I"}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800 text-lg">{inc.source}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">Income</span>
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="text-2xl font-bold text-green-600">₹{Number(inc.amount).toLocaleString()}</span>
                                  <div className="flex items-center gap-2">
                                    <motion.button whileHover={{ scale: 1.1, backgroundColor: "#F0FDF4" }} whileTap={{ scale: 0.9 }} onClick={() => startEditIncome(inc)} className="p-2.5 text-gray-500 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1, backgroundColor: "#FEF2F2" }} whileTap={{ scale: 0.9 }} onClick={() => deleteIncome(inc._id)} className="p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── NEW: Pagination ── */}
              {totalPages > 1 && (
                <div className="px-7 lg:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, activeList.length)}</span> of <span className="font-semibold text-gray-700">{activeList.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Prev
                    </motion.button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span key={`dot-${i}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                          ) : (
                            <motion.button key={p} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p)}
                              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === p ? "text-white shadow-lg" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                              style={currentPage === p ? { background: "linear-gradient(135deg, #667eea, #764ba2)" } : {}}>
                              {p}
                            </motion.button>
                          )
                        )}
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </motion.button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>

        </div>
      </main>
    </motion.div>
  );
}

// BUDGET MINI CARD COMPONENT — unchanged
function BudgetMiniCard({ budget }) {
  const getStatusColor = () => {
    if (budget.status === "exceeded") return { ring: "ring-red-500", text: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-rose-600", barColor: "bg-red-500" };
    if (budget.status === "warning") return { ring: "ring-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", gradient: "from-yellow-500 to-orange-600", barColor: "bg-yellow-500" };
    return { ring: "ring-green-500", text: "text-green-600", bg: "bg-green-50", gradient: "from-green-500 to-emerald-600", barColor: "bg-green-500" };
  };
  const colors = getStatusColor();
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} className={`bg-white rounded-2xl p-5 shadow-lg border-2 ${colors.ring} transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{budget.category}</h4>
          <p className="text-xs text-gray-500 capitalize mt-0.5">{budget.period}</p>
        </div>
        <div className={`px-3 py-1 ${colors.bg} rounded-full`}>
          <span className={`text-xs font-bold ${colors.text}`}>{Math.round(budget.percentage)}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(budget.percentage, 100)}%` }} transition={{ duration: 1, delay: 0.2 }} className={`h-full ${colors.barColor} rounded-full`} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-gray-500 text-xs">Spent</p><p className={`font-bold ${colors.text}`}>₹{budget.spent.toLocaleString()}</p></div>
        <div className="text-right"><p className="text-gray-500 text-xs">Limit</p><p className="font-semibold text-gray-800">₹{budget.limit.toLocaleString()}</p></div>
      </div>
    </motion.div>
  );
}