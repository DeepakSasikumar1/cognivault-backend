import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Users, FileText, Bot, Activity, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

export function Dashboard() {
  const { setPage, role } = useAppContext();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { title: "Total Policies", value: "48", change: "+12%", icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { title: "Active Users", value: "891", change: "+5.2%", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Avg. AI Confidence", value: "94%", change: "+2.1%", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Queries Today", value: "1,204", change: "+18%", icon: Activity, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" }
  ];

  const recentActivity = [
    { id: 1, action: "New policy uploaded", target: "WFH Guidelines v2", user: "Sarah Admin", time: "10m ago", dot: "bg-indigo-500" },
    { id: 2, action: "Generated FAQs from", target: "Q1 Financial Report", user: "System", time: "1h ago", dot: "bg-emerald-500" },
    { id: 3, action: "Role updated for", target: "Michael Chen", user: "Sarah Admin", time: "2h ago", dot: "bg-amber-500" },
    { id: 4, action: "Deleted outdated policy", target: "Travel Expenses 2022", user: "John Doe", time: "1d ago", dot: "bg-rose-500" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title={`${greeting}, Admin!`} 
        subtitle="System metrics and recent activity for your enterprise knowledge base."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <Badge color="emerald">{stat.change}</Badge>
            </div>
            <h3 className="text-[var(--text-3)] text-xs font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold font-mono text-[var(--text)]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">Quick Actions</h3>
              <p className="text-xs text-[var(--text-3)] mt-1">Common tasks to get started</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setPage('chat')}
              className="flex items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Ask the Assistant</h4>
                <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Query your context</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-indigo-500 transition-colors" />
            </button>
            <button 
              onClick={() => setPage('policies')}
              className="flex items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Manage Policies</h4>
                <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Upload or view docs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-emerald-500 transition-colors" />
            </button>
            <button 
              onClick={() => setPage('faq')}
              className="flex items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-200 dark:hover:border-amber-800 transition-all text-left group shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-amber-600 dark:group-hover:text-amber-400">Generate FAQs</h4>
                <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Automatic Q&A building</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-amber-500 transition-colors" />
            </button>
            {role === "admin" && (
              <button 
                onClick={() => setPage('admin')}
                className="flex items-center p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800 transition-all text-left group shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-md shadow-purple-500/20">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-purple-600 dark:group-hover:text-purple-400">Admin Panel</h4>
                  <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Manage users & access</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-purple-500 transition-colors" />
              </button>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-[var(--text)]">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${activity.dot}`} />
                <div>
                  <p className="text-sm text-[var(--text)] leading-tight">
                    {activity.action} <span className="font-semibold">{activity.target}</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-3)] mt-1">
                    {activity.user} · {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
