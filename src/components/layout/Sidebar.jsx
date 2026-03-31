import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Bot, BookOpen, Sparkles, BarChart2, Shield, Settings, Zap, Database, ChevronDown, UserSquare, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "chat", label: "Chat Assistant", icon: Bot, badge: "AI" },
  { id: "policies", label: "Policy Library", icon: BookOpen },
  { id: "faq", label: "FAQ Generator", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "admin", label: "Admin Panel", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const { page, setPage, role, setRole, toast } = useAppContext();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setShowProfile(false);
    toast("You have been signed out.", "info");
    setPage("dashboard");
  };

  return (
    <aside
      className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 overflow-visible border-r border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-xl z-30 flex-shrink-0 relative"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)] flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
          <Database className="w-4 h-4 text-white" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-[var(--text)] leading-tight whitespace-nowrap tracking-wide">Cognivault <span className="text-indigo-500">AI</span></p>
          <p className="text-[9px] text-[var(--text-3)] whitespace-nowrap flex items-center gap-1 font-medium uppercase tracking-widest mt-0.5">
            <Zap className="w-2.5 h-2.5 text-indigo-400" /> Enterprise
          </p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setPage(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`nav-item w-full text-left ${isActive ? "active" : ""}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500 text-white font-bold leading-none shadow-sm shadow-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)] relative" ref={profileRef}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowProfile(!showProfile)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${showProfile ? 'bg-[var(--surface-2)] border-[var(--border)] shadow-sm' : 'border-transparent hover:bg-[var(--surface-2)] hover:border-[var(--border)]'}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-500/20 flex-shrink-0">
            SA
          </div>
          
          <div className="flex-1 text-left overflow-hidden whitespace-nowrap flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--text)] leading-tight">Sarah Admin</p>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">{role}</p>
            </div>
            <motion.div animate={{ rotate: showProfile ? 180 : 0 }} className="text-[var(--text-3)] flex-shrink-0 ml-2">
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-[calc(100%+0.5rem)] bottom-3 mt-0 w-64 card p-2 z-50 origin-bottom-left shadow-xl"
            >
              <div className="px-4 py-3 bg-[var(--surface-2)]/50 rounded-xl mb-2">
                <p className="text-sm font-bold text-[var(--text)]">Sarah Admin</p>
                <p className="text-xs text-[var(--text-3)]">sarah@company.com</p>
              </div>
              
              <div className="px-2 mb-2">
                <p className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-1.5 mt-2">Active Role</p>
                <div className="space-y-0.5">
                  {["admin", "manager", "employee"].map(m => (
                    <button
                      key={m}
                      onClick={() => { setRole(m); setShowProfile(false); toast(`Role switched to ${m}`, "success"); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all capitalize flex items-center justify-between group ${role === m ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" : "hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] font-medium"}`}
                    >
                      <div className="flex items-center gap-2">
                        <UserSquare className={`w-4 h-4 ${role === m ? 'text-indigo-500' : 'text-[var(--text-3)] group-hover:text-indigo-500'} transition-colors`} /> {m}
                      </div>
                      {role === m && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border)] my-2 mx-2" />
              
              <div className="px-2 flex flex-col gap-0.5">
                <button onClick={() => { setPage("settings"); setShowProfile(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-2 transition-all">
                  <Settings className="w-4 h-4 text-[var(--text-3)]" /> Account Settings
                </button>
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 transition-all group mt-1">
                  <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-500 transition-colors" /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
