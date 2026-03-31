import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Bell, CheckCircle2, Command, Plus, FileText, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

export function Header() {
  const { dark, setDark, notifications, setNotifications, page, setPage, toast } = useAppContext();
  const [showNotif, setShowNotif] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState("");
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const createRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (createRef.current && !createRef.current.contains(event.target)) setShowCreate(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifs = [
    { id: 1, text: "New policy uploaded: Q1 Compliance", time: "2m ago", dot: "bg-indigo-500" },
    { id: 2, text: "3 new FAQs generated from HR Manual", time: "15m ago", dot: "bg-emerald-500" },
    { id: 3, text: "Admin access request from John D.", time: "1h ago", dot: "bg-amber-500" }
  ];

  const handleSearchResult = (m) => {
    setSearch("");
    setSearchFocused(false);
    toast(`Opening: ${m.title}`);
    if (m.type === 'chat') setPage('chat');
    else if (m.type === 'faq') setPage('faq');
    else setPage('policies');
  };

  const MOCK_RESULTS = [
    { title: "HR Policy 2024", type: "doc", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { title: "Leave Management", type: "doc", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { title: "How do I request WFH?", type: "faq", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { title: "Ask AI about Benefits", type: "chat", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  ];

  const filteredResults = search 
    ? MOCK_RESULTS.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    : MOCK_RESULTS.slice(0, 3);

  const getPageTitle = () => {
    if (page === 'faq') return 'FAQ Generator';
    return page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-[68px] border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-2xl sticky top-0 z-20 flex items-center px-4 sm:px-6 gap-4 shadow-sm">
      <div className="hidden md:flex flex-col min-w-[140px]">
        <span className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-widest mb-0.5">Current View</span>
        <h1 className="text-sm font-bold text-[var(--text)]">{getPageTitle()}</h1>
      </div>

      <div className="flex-1 max-w-2xl mx-auto relative z-30" ref={searchRef}>
        <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
          <Search className={`absolute left-4 w-4 h-4 transition-colors ${searchFocused ? 'text-indigo-500' : 'text-[var(--text-3)]'}`} />
          <input 
            ref={inputRef}
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onFocus={() => setSearchFocused(true)}
            placeholder="Search policies, FAQs, or ask AI..." 
            className={`w-full bg-[var(--surface-2)] border text-[var(--text)] rounded-2xl pl-11 pr-12 py-3 text-sm transition-all duration-300 outline-none ${searchFocused ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-[var(--surface)] shadow-lg shadow-indigo-500/5' : 'border-[var(--border)] hover:border-indigo-300 dark:hover:border-indigo-500/50'}`} 
          />
          <div className="absolute right-3 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-sm hidden sm:flex items-center gap-1 text-[10px] font-bold text-[var(--text-3)] pointer-events-none">
            <Command className="w-3 h-3" />K
          </div>
        </div>

        <AnimatePresence>
          {searchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 card shadow-2xl overflow-hidden border border-indigo-500/20"
            >
              <div className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider">
                  {search ? "Search Results" : "Suggested Actions"}
                </p>
              </div>
              <div className="p-2 space-y-1">
                {filteredResults.length > 0 ? (
                  filteredResults.map((m, i) => (
                    <motion.button 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i} 
                      onClick={() => handleSearchResult(m)} 
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--surface-2)] cursor-pointer text-sm font-medium text-[var(--text)] transition-colors flex items-center gap-3 group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${m.bg}`}>
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                      <span className="flex-1 group-hover:text-indigo-500 transition-colors">{m.title}</span>
                      <Search className="w-3 h-3 text-[var(--text-3)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Search className="w-6 h-6 text-[var(--text-3)] mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium text-[var(--text-2)]">No results found for "{search}"</p>
                    <p className="text-xs text-[var(--text-3)] mt-1">Try searching for policies or FAQs.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-3 shrink-0 ml-auto">
        <div className="relative hidden sm:block" ref={createRef}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-indigo-500 hover:text-indigo-500 transition-all font-bold text-sm text-[var(--text)]"
          >
            <Plus className="w-4 h-4" /> Create
            <ChevronDown className={`w-3 h-3 text-[var(--text-3)] transition-transform ${showCreate ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-48 card p-2"
              >
                <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider px-2 pt-1 pb-2">Quick Actions</div>
                <button onClick={() => { setPage('policies'); setShowCreate(false); toast("Upload policy dialog opened"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors group">
                  <FileText className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" /> Upload Policy
                </button>
                <button onClick={() => { setPage('faq'); setShowCreate(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors group">
                  <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> Generate FAQ
                </button>
                <button onClick={() => { setPage('chat'); setShowCreate(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors group">
                  <MessageSquare className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" /> New AI Chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setDark(!dark); toast(`Switched to ${!dark ? 'Dark' : 'Light'} Mode!`); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] hover:border-indigo-500 text-[var(--text-2)] hover:text-indigo-500 transition-all shadow-sm"
          title="Toggle Theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={dark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <div className="relative" ref={notifRef}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotif(!showNotif)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-[var(--surface-2)] border shadow-sm relative ${showNotif ? 'border-indigo-500 text-indigo-500 shadow-indigo-500/10' : 'border-[var(--border)] hover:border-indigo-500 text-[var(--text-2)] hover:text-indigo-500'}`}
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-[var(--surface)] rounded-full animate-bounce" />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-80 sm:w-80 card p-0 origin-top-right shadow-xl shadow-indigo-500/10 overflow-hidden"
              >
                <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">Notifications</p>
                    <p className="text-[10px] text-[var(--text-3)]">{notifications} unread messages</p>
                  </div>
                  <button onClick={() => { setNotifications(0); setShowNotif(false); toast("All notifications cleared!"); }} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                    Mark Read
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                  {notifications > 0 ? notifs.slice(0, notifications).map(m => (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--surface-2)] cursor-pointer transition-colors group">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.dot} group-hover:scale-125 transition-transform shadow-sm`} />
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] leading-snug group-hover:text-indigo-500 transition-colors">{m.text}</p>
                        <p className="text-[10px] text-[var(--text-3)] mt-1 font-semibold uppercase tracking-wider">{m.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-[var(--text-3)] flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-[var(--text)] placeholder:mb-1">You're all caught up!</p>
                      <p className="text-xs">No pending tasks or alerts.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
