import React from 'react';
import { LayoutGrid, Bot, BookOpen, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

const MOBILE_ITEMS = [
  { id: "dashboard", icon: LayoutGrid, label: "Home" },
  { id: "chat", icon: Bot, label: "Chat" },
  { id: "policies", icon: BookOpen, label: "Policies" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "settings", icon: Settings, label: "Settings" }
];

export function MobileNav() {
  const { page, setPage } = useAppContext();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] flex">
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = page === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 relative"
          >
            {isActive && (
              <motion.div
                layoutId="mob-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full"
              />
            )}
            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-500 dark:text-indigo-400" : "text-[var(--text-3)]"}`} />
            <span className={`text-[9px] font-bold tracking-wide transition-colors ${isActive ? "text-indigo-500 dark:text-indigo-400" : "text-[var(--text-3)] font-medium"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
