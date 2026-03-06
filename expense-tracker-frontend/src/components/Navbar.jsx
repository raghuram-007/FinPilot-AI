import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  LogOut,
  TrendingUp,
  LogIn,
  UserPlus,
  UserCircle,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      const stored = localStorage.getItem("user");
      if (stored) setUserData(JSON.parse(stored));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const authNavLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { path: "/budget", label: "Budget", icon: PiggyBank },
    { path: "/predictions", label: "Predictions", icon: Sparkles },
  ];

  const publicNavLinks = [
    { path: "/login", label: "Login", icon: LogIn },
    { path: "/register", label: "Sign Up", icon: UserPlus },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.08)]"
          : "bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-300 group-hover:-rotate-3">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-gray-900 select-none">
              Expense<span className="text-indigo-600">Tracker</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {authNavLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                      ${
                        isActive(path)
                          ? "text-indigo-700 bg-indigo-50"
                          : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60"
                      }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive(path)
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-500"
                      }`}
                      strokeWidth={isActive(path) ? 2.2 : 1.8}
                    />
                    {label}
                    {isActive(path) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 opacity-70" />
                    )}
                  </Link>
                ))}

                <div className="w-px h-5 bg-gray-200 mx-2" />

                {/* Profile Button */}
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${
                      isActive("/profile")
                        ? "text-indigo-700 bg-indigo-50"
                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60"
                    }`}
                >
                  {userData?.name ? (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <UserCircle
                      className={`w-4 h-4 ${isActive("/profile") ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"}`}
                      strokeWidth={1.8}
                    />
                  )}
                  {userData?.name?.split(" ")[0] || "Profile"}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-transparent transition-all duration-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50/60 group"
                >
                  <LogOut
                    className="w-4 h-4 text-gray-400 transition-all duration-200 group-hover:text-red-400 group-hover:translate-x-0.5"
                    strokeWidth={1.8}
                  />
                  Logout
                </button>
              </>
            ) : (
              publicNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${
                      isActive(path)
                        ? "text-indigo-700 bg-indigo-50"
                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-200 ${
                      isActive(path)
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-indigo-500"
                    }`}
                    strokeWidth={isActive(path) ? 2.2 : 1.8}
                  />
                  {label}
                </Link>
              ))
            )}
          </div>

          {/* Mobile */}
          {isAuthenticated ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          ) : (
            <div className="md:hidden flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Login
              </Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isAuthenticated && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-3 mb-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/80 overflow-hidden">
            <div className="p-2 space-y-0.5">
              {authNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${
                      isActive(path)
                        ? "text-indigo-700 bg-indigo-50"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive(path) ? "text-indigo-500" : "text-gray-400"}`}
                    strokeWidth={isActive(path) ? 2.2 : 1.8}
                  />
                  {label}
                  {isActive(path) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60" />
                  )}
                </Link>
              ))}

              {/* Profile link in mobile */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive("/profile")
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60"
                  }`}
              >
                <UserCircle
                  className={`w-4 h-4 ${isActive("/profile") ? "text-indigo-500" : "text-gray-400"}`}
                  strokeWidth={1.8}
                />
                Profile & Settings
                {isActive("/profile") && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60" />
                )}
              </Link>

              <div className="h-px bg-gray-100 my-1.5 mx-1" />

              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150 group"
              >
                <LogOut
                  className="w-4 h-4 text-red-400 transition-transform duration-150 group-hover:translate-x-0.5"
                  strokeWidth={1.8}
                />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}