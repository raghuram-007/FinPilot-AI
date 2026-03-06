import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.96 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 110, damping: 15 } },
};

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({ name: "", email: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [toast, setToast] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserData(parsed);
      setProfileForm({ name: parsed.name || "", email: parsed.email || "" });
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      return showToast("Name and email are required", "error");
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { name: profileForm.name, email: profileForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...userData, name: res.data.user.name, email: res.data.user.email };
      localStorage.setItem("user", JSON.stringify(updated));
      setUserData(updated);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return showToast("All password fields are required", "error");
    }
    if (passwordForm.newPassword.length < 6) {
      return showToast("New password must be at least 6 characters", "error");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("New passwords do not match", "error");
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return showToast('Please type "DELETE" to confirm', "error");
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/register");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account", "error");
      setLoading(false);
    }
  };

  const avatarLetter = userData?.name?.charAt(0)?.toUpperCase() || "U";

  const tabs = [
    { id: "profile", label: "Edit Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "password", label: "Password", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "danger", label: "Danger Zone", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6 lg:p-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f8faff 0%, #ffffff 40%, #faf5ff 100%)" }}
    >
      {/* Background decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-50/50 rounded-full blur-2xl pointer-events-none" />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -80, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-semibold text-sm backdrop-blur-sm border ${
              toast.type === "success"
                ? "bg-emerald-500/95 text-white border-emerald-400/50 shadow-emerald-200/50"
                : "bg-red-500/95 text-white border-red-400/50 shadow-red-200/50"
            }`}
          >
            <motion.span
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="text-xl"
            >
              {toast.type === "success" ? "✅" : "❌"}
            </motion.span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-7 relative z-10">

        {/* ── HEADER ── */}
        <motion.div variants={itemVariants} className="flex items-center gap-5">
          <motion.div
            whileHover={{ rotate: -5, scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-300/50"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 bg-violet-500 rounded-full inline-block"
              />
              Manage your account details and security
            </p>
          </div>
        </motion.div>

        {/* ── HERO PROFILE CARD ── */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, boxShadow: "0 25px 45px -12px rgba(0,0,0,0.12)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white/60 to-purple-50/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-violet-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-tr-full pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-7">
            {/* Avatar with glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-110" />
              <motion.div
                whileHover={{ scale: 1.06, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-violet-300/50 border-4 border-white"
              >
                {avatarLetter}
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 border-[3px] border-white rounded-full shadow-lg"
              />
            </div>

            {/* User info */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{userData.name || "User"}</h2>
              <p className="text-gray-400 mt-1 font-medium text-sm">{userData.email || "user@example.com"}</p>
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center sm:justify-start">
                {/* <motion.span
                  whileHover={{ scale: 1.06, y: -1 }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-xs font-bold rounded-full border border-violet-200/60 shadow-sm cursor-default"
                >
                  ✨ Premium Member
                </motion.span> */}
                <motion.span
                  whileHover={{ scale: 1.06, y: -1 }}
                  className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 shadow-sm flex items-center gap-1.5 cursor-default"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </motion.span>
              </div>
            </div>

            {/* Right side mini stats */}
            <div className="hidden lg:flex items-center gap-8 border-l border-gray-100 pl-8">
              {[
                { label: "Member Since", value: "2024" },
                { label: "Status", value: "Verified ✓" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl w-fit border border-gray-100/80 shadow-lg shadow-gray-100/50"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? tab.id === "danger"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200/60"
                    : "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200/60"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/80"
              }`}
            >
              <svg
                className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : tab.id === "danger" ? "text-red-400" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* EDIT PROFILE */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-transparent to-purple-50/30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-100/60 to-transparent rounded-bl-full pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200/60">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update your name and email address</p>
                  </div>
                </div>

                <div className="space-y-5 max-w-lg">
                  {/* Name */}
                  <motion.div whileHover={{ scale: 1.005 }} className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 tracking-widest uppercase">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <svg className="w-5 h-5 text-gray-300 group-focus-within:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:bg-white shadow-sm hover:shadow-md"
                        placeholder="Your full name"
                      />
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div whileHover={{ scale: 1.005 }} className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 tracking-widest uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <svg className="w-5 h-5 text-gray-300 group-focus-within:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:bg-white shadow-sm hover:shadow-md"
                        placeholder="your@email.com"
                      />
                    </div>
                  </motion.div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -3, boxShadow: "0 20px 40px -12px rgba(124,58,237,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-violet-300/40 transition-all duration-300 disabled:opacity-60 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {loading ? "Saving..." : "Save Changes"}
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHANGE PASSWORD */}
          {activeTab === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100/60 to-transparent rounded-bl-full pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/60">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Keep your account safe and secure</p>
                  </div>
                </div>

                <div className="space-y-5 max-w-lg">
                  {[
                    { key: "currentPassword", label: "Current Password", placeholder: "Enter your current password", showKey: "current" },
                    { key: "newPassword", label: "New Password", placeholder: "Choose a strong new password", showKey: "new" },
                    { key: "confirmPassword", label: "Confirm New Password", placeholder: "Re-enter your new password", showKey: "confirm" },
                  ].map(({ key, label, placeholder, showKey }) => (
                    <motion.div key={key} whileHover={{ scale: 1.005 }} className="group">
                      <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 tracking-widest uppercase">
                        {label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <svg className="w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPasswords[showKey] ? "text" : "password"}
                          value={passwordForm[key]}
                          onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                          className="w-full pl-12 pr-12 py-4 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all duration-300 bg-white/90 text-gray-800 font-semibold placeholder:text-gray-300 hover:border-gray-200 hover:bg-white shadow-sm hover:shadow-md"
                          placeholder={placeholder}
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPasswords({ ...showPasswords, [showKey]: !showPasswords[showKey] })}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-blue-500 transition-colors duration-200"
                        >
                          {showPasswords[showKey] ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Password strength bar */}
                  <AnimatePresence>
                    {passwordForm.newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="flex gap-1.5">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: passwordForm.newPassword.length > i * 2 ? 1 : 0.3 }}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-400 origin-left ${
                                passwordForm.newPassword.length > i * 2
                                  ? passwordForm.newPassword.length >= 8
                                    ? "bg-emerald-500"
                                    : passwordForm.newPassword.length >= 5
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                  : "bg-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-bold ${
                          passwordForm.newPassword.length >= 8 ? "text-emerald-600" : "text-yellow-600"
                        }`}>
                          {passwordForm.newPassword.length >= 8
                            ? "✅ Strong password"
                            : `⚠️ ${8 - passwordForm.newPassword.length} more characters needed`}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -3, boxShadow: "0 20px 40px -12px rgba(59,130,246,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-300/40 transition-all duration-300 disabled:opacity-60 overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {loading ? "Updating..." : "Update Password"}
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* DANGER ZONE */}
          {activeTab === "danger" && (
            <motion.div
              key="danger"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-100 shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-rose-50/30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-100/60 to-transparent rounded-bl-full pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}
                    className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200/60"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Danger Zone</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Irreversible and destructive actions</p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.005, y: -1 }}
                  className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <h3 className="font-bold text-red-900 text-lg">Delete Account</h3>
                      <p className="text-sm text-red-500 mt-1.5 leading-relaxed">
                        Permanently delete your account and <strong>all your data</strong>. This cannot be undone.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2, boxShadow: "0 15px 35px -8px rgba(239,68,68,0.45)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-200/50 whitespace-nowrap"
                    >
                      Delete Account
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
            >
              {/* Modal header gradient */}
              <div className="px-6 py-5 bg-gradient-to-r from-red-500 to-rose-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-bl-full" />
                </div>
                <div className="relative flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-white">Delete Account</h3>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 leading-relaxed"
                >
                  ⚠️ This will permanently delete your account, all transactions, budgets, and data.{" "}
                  <strong>This cannot be undone.</strong>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type{" "}
                    <span className="text-red-600 font-black bg-red-50 px-1.5 py-0.5 rounded-lg border border-red-200">
                      DELETE
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-300 font-semibold ${
                      deleteConfirm === "DELETE"
                        ? "border-red-400 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Type DELETE here"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 pt-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: deleteConfirm === "DELETE" ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== "DELETE"}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 disabled:opacity-40 hover:shadow-xl hover:shadow-red-200/50"
                  >
                    {loading ? "Deleting..." : "🗑️ Delete Forever"}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}