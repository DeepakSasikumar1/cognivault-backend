import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Activity, Users, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const WEEK_DATA = [
  { day: "Mon", queries: 42, users: 31, accuracy: 91 },
  { day: "Tue", queries: 68, users: 45, accuracy: 88 },
  { day: "Wed", queries: 55, users: 38, accuracy: 93 },
  { day: "Thu", queries: 89, users: 62, accuracy: 95 },
  { day: "Fri", queries: 73, users: 51, accuracy: 90 },
  { day: "Sat", queries: 31, users: 18, accuracy: 87 },
  { day: "Sun", queries: 24, users: 15, accuracy: 92 }
];

const DEPTS = [
  { name: "HR", value: 38, color: "#6370f1" },
  { name: "Finance", value: 22, color: "#10b981" },
  { name: "Legal", value: 18, color: "#f59e0b" },
  { name: "IT", value: 15, color: "#ec4899" },
  { name: "Other", value: 7, color: "#94a3b8" }
];

const COMMON_QUESTIONS = [
  { q: "Leave policy", count: 145, pct: 95 },
  { q: "WFH guidelines", count: 112, pct: 73 },
  { q: "Expense process", count: 89, pct: 58 },
  { q: "IT access", count: 71, pct: 46 }
];

function StatCard({ label, value, change, icon: Icon, color, delay }) {
  const isPositive = change > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${color}-50 dark:bg-${color}-900/20 shadow-sm`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium text-[var(--text-3)] mb-1">{label}</h3>
      <p className="text-2xl font-bold font-mono text-[var(--text)]">{value}</p>
    </motion.div>
  );
}

export function Analytics() {
  const [period, setPeriod] = useState("week");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Analytics" 
        subtitle="System performance and usage insights" 
        actions={
          <div className="flex items-center gap-1 p-1 bg-[var(--surface-2)] rounded-xl">
            {["week", "month", "quarter"].map(n => (
              <button 
                key={n} 
                onClick={() => setPeriod(n)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${period === n ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-3)]"}`}
              >
                {n}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Queries" value="4,382" change={+18} icon={Activity} color="indigo" delay={0} />
        <StatCard label="Unique Users" value="891" change={+12} icon={Users} color="emerald" delay={0.05} />
        <StatCard label="Avg. Accuracy" value="91.4%" change={+3} icon={ShieldCheck} color="amber" delay={0.1} />
        <StatCard label="Peak Day" value="Thursday" icon={Calendar} color="rose" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Query Volume & Accuracy</h3>
              <p className="text-xs text-[var(--text-3)]">This {period}</p>
            </div>
            <div className="flex gap-3 text-xs text-[var(--text-3)] font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 inline-block rounded-sm shadow-sm" />Queries</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 inline-block rounded-sm shadow-sm" />Users</span>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEK_DATA}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: "12px" }} />
                <Line type="monotone" dataKey="queries" stroke="#6370f1" strokeWidth={2} dot={{ r: 3, fill: "#6370f1" }} />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Queries by Department</h3>
          <p className="text-xs text-[var(--text-3)] mb-4">Distribution this period</p>
          <div className="flex justify-center mb-4 h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEPTS} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {DEPTS.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {DEPTS.map((n) => (
              <div key={n.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
                <span className="text-xs text-[var(--text-2)] flex-1">{n.name}</span>
                <span className="text-xs font-mono font-bold text-[var(--text)]">{n.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Most Common Questions</h3>
          <div className="space-y-3">
            {COMMON_QUESTIONS.map((n, r) => (
              <div key={r}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text)] flex-1">{n.q}</span>
                  <span className="text-xs font-mono text-[var(--text-3)] ml-3">{n.count}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${n.pct}%` }} 
                    transition={{ delay: 0.4 + r * 0.05, duration: 0.8 }} 
                    className="h-full rounded-full" 
                    style={{ background: `hsl(${230 + r * 15}, 80%, ${55 + r * 3}%)` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
