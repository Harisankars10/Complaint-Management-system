import React from "react";

function StatCard({ title, value, icon, color = "indigo" }) {
  const colorMap = {
    indigo: "from-indigo-50 to-violet-50 dark:from-slate-700 dark:to-slate-700 text-indigo-700 dark:text-indigo-200 border-indigo-100 dark:border-slate-600",
    green: "from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-700 text-emerald-700 dark:text-emerald-200 border-emerald-100 dark:border-slate-600",
    amber: "from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-700 text-amber-700 dark:text-amber-200 border-amber-100 dark:border-slate-600",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.3)] hover:shadow-[0_14px_30px_-12px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 ${
        colorMap[color] || colorMap.indigo
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xl rounded-lg bg-white/70 dark:bg-slate-800/70 px-2 py-1 shadow-sm">{icon}</span>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

export default StatCard;
