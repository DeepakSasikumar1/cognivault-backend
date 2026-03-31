import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Users, Shield, UserPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

const USERS = [
  { id: 1, name: "Sarah Admin", role: "admin", email: "sarah@company.com", status: "Active", deps: "All" },
  { id: 2, name: "John Doe", role: "employee", email: "john@company.com", status: "Active", deps: "Engineering" },
  { id: 3, name: "Jane Smith", role: "manager", email: "jane@company.com", status: "Active", deps: "HR" },
  { id: 4, name: "Michael Chen", role: "employee", email: "michael@company.com", status: "Inactive", deps: "Marketing" }
];

const ROLES = {
  admin: { color: "indigo", label: "Admin" },
  manager: { color: "emerald", label: "Manager" },
  employee: { color: "default", label: "Employee" }
};

export function AdminPanel() {
  const { toast } = useAppContext();
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState("");

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
    toast("User removed successfully", "success");
  };

  const handleAdd = () => {
    const freshUser = { id: Date.now(), name: "New User", role: "employee", email: `new${Date.now()}@company.com`, status: "Active", deps: "Sales" };
    setUsers([...users, freshUser]);
    toast("User invite sent!", "success");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Admin Panel" 
        subtitle="Manage users, roles, and access permissions" 
        actions={
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Users, title: "Total Users", val: "142", desc: "+12 this month", color: "indigo" },
          { icon: Shield, title: "Active Admins", val: "4", desc: "System owners", color: "emerald" },
          { icon: UserPlus, title: "Pending Invites", val: "18", desc: "Awaiting registration", color: "amber" }
        ].map((card, i) => (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className={`card p-5 border-l-4 border-${card.color}-500`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-3)] mb-1">{card.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold font-mono text-[var(--text)]">{card.val}</h3>
                  <span className={`text-xs text-${card.color}-500 font-medium`}>{card.desc}</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search users..." 
            className="input-base max-w-xs text-sm" 
          />
          <Badge>{filtered.length} users</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)]">
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <AnimatePresence>
                {filtered.map(user => (
                  <motion.tr key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-[var(--surface-2)]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-500/20">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{user.name}</p>
                          <p className="text-xs text-[var(--text-3)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={ROLES[user.role]?.color || "default"}>
                        {ROLES[user.role]?.label || user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-2)]">{user.deps}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === "Active" ? "text-emerald-500" : "text-rose-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toast(`Editing user ${user.name}...`, "info")} className="p-1.5 text-[var(--text-3)] hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-[var(--text-3)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
