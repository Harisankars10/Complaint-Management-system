import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function DashboardLayout({ title, basePath, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 md:flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px] z-30 md:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <Sidebar basePath={basePath} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1">
        <div className="md:hidden px-4 pt-4">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 shadow-sm hover:shadow transition-all duration-200"
          >
            Menu
          </button>
        </div>
        <TopNavbar title={title} />
        <main className="p-4 md:p-8 animate-[fadeIn_.25s_ease-out]">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
