import React from "react";

function Card({ title, subtitle, className = "", children }) {
  return (
    <div
      className={`bg-white/95 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-600 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] dark:shadow-[0_12px_28px_-14px_rgba(2,6,23,0.8)] hover:shadow-[0_14px_35px_-12px_rgba(79,70,229,0.22)] transition-all duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export default Card;
