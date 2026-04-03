import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AppNavbar({
  title = "Smart Complaint System",
  showAuthLinks = true,
  subtitle = "",
  className = "",
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const darkPreferred = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(darkPreferred);
    document.documentElement.classList.toggle("dark", darkPreferred);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm ${className}`}>
      <div className="px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white grid place-items-center font-bold shadow-md shadow-indigo-200">
              SC
            </div>
            <div>
              <Link to="/" className="text-slate-800 dark:text-slate-100 font-semibold hover:text-indigo-700 transition-colors duration-200">
                {title}
              </Link>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-100 shadow-sm"
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {isDark ? "Light" : "Dark"}
            </button>
            {showAuthLinks && !isAuthenticated && (
              <>
                <NavLink to="/login" className="text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-700 transition-colors duration-200">
                  Login
                </NavLink>
                <NavLink to="/signup" className="text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-700 transition-colors duration-200">
                  Signup
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 shadow-sm">
                  <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-semibold">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                  <div className="leading-tight bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{user?.username || "User"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || "user"}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800 shadow-sm hover:shadow transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-3 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
            {showAuthLinks && !isAuthenticated && (
              <>
                <NavLink to="/login" className="block text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-700">
                  Login
                </NavLink>
                <NavLink to="/signup" className="block text-sm text-slate-700 dark:text-slate-200 hover:text-indigo-700">
                  Signup
                </NavLink>
              </>
            )}
            {isAuthenticated && (
              <>
                <div className="text-sm text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  {user?.username} <span className="text-slate-500 dark:text-slate-400 capitalize">({user?.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium hover:bg-slate-800 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default AppNavbar;
