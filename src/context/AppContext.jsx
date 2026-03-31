import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState("admin"); // or 'employee', 'manager', 'hr', 'admin'
  const [notifications, setNotifications] = useState(3);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(v => v.id !== id)), 3500);
  }, []);

  return (
    <AppContext.Provider value={{
      dark, setDark,
      page, setPage,
      sidebarCollapsed, setSidebarCollapsed,
      role, setRole,
      notifications, setNotifications,
      toast
    }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/5 backdrop-blur-md transform transition-all animate-bounce-short text-sm font-medium ${t.type === "success" ? "bg-emerald-500/95 text-white" : t.type === "error" ? "bg-rose-500/95 text-white" : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]"}`}>
            <span className="text-base font-bold flex-shrink-0 leading-none mb-0.5">{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
