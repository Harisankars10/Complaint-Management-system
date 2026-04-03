import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function DashboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3zM13 21h8v-8h-8zM13 3h8v6h-8zM3 21h8v-6H3z" />
    </svg>
  );
}

function ComplaintsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function AddIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function Sidebar({ basePath = "/dashboard", isOpen = false, onClose = () => {} }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Dashboard", hash: "", Icon: DashboardIcon },
    { label: "Complaints", hash: "#complaints", Icon: ComplaintsIcon },
    { label: "Add Complaint", hash: "#dashboard", Icon: AddIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  const isItemActive = (item) => {
    if (location.pathname !== basePath) return false;
    if (!item.hash) return !location.hash;
    return location.hash === item.hash;
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-600 min-h-screen transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Smart Grievance</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complaint Management</p>
      </div>

      <nav className="p-4 space-y-2.5">
        {items.map((item) => {
          const isActive = isItemActive(item);
          const go = () => {
            onClose();
            if (item.hash) {
              if (location.pathname === basePath && location.hash === item.hash) {
                const id = item.hash.slice(1);
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
              }
              navigate(`${basePath}${item.hash}`);
              return;
            }
            navigate(basePath);
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
          };
          return (
            <button
              key={item.label}
              type="button"
              onClick={go}
              aria-current={isActive ? "page" : undefined}
              className={`w-full text-left flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-700 dark:to-slate-700 text-indigo-700 dark:text-slate-100 shadow-sm ring-1 ring-indigo-100 dark:ring-slate-500"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-0.5"
              }`}
            >
              <item.Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200"
        >
          <LogoutIcon className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
