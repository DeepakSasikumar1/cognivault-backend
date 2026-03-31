import React from 'react';

export function Badge({ children, color = "default", className = "" }) {
  const colors = {
    brand: "bg-indigo-50/50 text-indigo-600 border border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
    emerald: "bg-emerald-50/50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    amber: "bg-amber-50/50 text-amber-600 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    rose: "bg-rose-50/50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    default: "bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors[color] || colors.default} ${className}`}>
      {children}
    </span>
  );
}
