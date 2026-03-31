import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { User, Bell, Shield, Database, Save, Key, Globe, Smartphone, Monitor, Trash2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export function Settings() {
  const { toast, dark, setDark } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // States for different settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast("Settings saved successfully!", "success");
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Database }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your account preferences and system configuration" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl font-semibold transition-all ${activeTab === tab.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/10" : "text-[var(--text-3)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-500" : ""}`} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'profile' && (
                <div className="card p-6 border-t-4 border-t-indigo-500">
                  <h3 className="text-base font-bold text-[var(--text)] mb-5">Personal Information</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                        SA
                      </div>
                      <div>
                        <button className="btn-ghost text-sm mb-1 px-3 py-1.5" onClick={() => toast("Upload avatar dialog opened")}>Change Avatar</button>
                        <p className="text-xs text-[var(--text-3)]">JPG, GIF or PNG. 2MB max.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-3)] mb-1.5 uppercase tracking-wider">First Name</label>
                        <input type="text" defaultValue="Sarah" className="input-base w-full" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-3)] mb-1.5 uppercase tracking-wider">Last Name</label>
                        <input type="text" defaultValue="Admin" className="input-base w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-3)] mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input type="email" defaultValue="sarah@company.com" className="input-base w-full" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-3)] mb-1.5 uppercase tracking-wider">Bio / Department</label>
                      <textarea rows={3} defaultValue="Systems Administrator for Enterprise Knowledge Base" className="input-base w-full resize-none py-2" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="card p-6 border-t-4 border-t-emerald-500">
                  <h3 className="text-base font-bold text-[var(--text)] mb-5 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-500" /> Communication Preferences
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer group">
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-emerald-500 transition-colors">Email Notifications</p>
                        <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Receive alerts when policies are updated</p>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setEmailNotif(!emailNotif); }} className={`w-11 h-6 rounded-full relative transition-colors shadow-inner ${emailNotif ? "bg-emerald-500" : "bg-[var(--surface-2)] border border-[var(--border)]"}`}>
                        <motion.span animate={{ x: emailNotif ? 22 : 4 }} className="absolute top-1 left-0 w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm" />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer group">
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-emerald-500 transition-colors">Push Notifications</p>
                        <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">In-app alerts for AI generation completion</p>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setPushNotif(!pushNotif); }} className={`w-11 h-6 rounded-full relative transition-colors shadow-inner ${pushNotif ? "bg-emerald-500" : "bg-[var(--surface-2)] border border-[var(--border)]"}`}>
                        <motion.span animate={{ x: pushNotif ? 22 : 4 }} className="absolute top-1 left-0 w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm" />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer group">
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-emerald-500 transition-colors">Weekly Digest</p>
                        <p className="text-xs font-medium text-[var(--text-3)] mt-0.5">Summary of system queries and analytics</p>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setWeeklyDigest(!weeklyDigest); }} className={`w-11 h-6 rounded-full relative transition-colors shadow-inner ${weeklyDigest ? "bg-emerald-500" : "bg-[var(--surface-2)] border border-[var(--border)]"}`}>
                        <motion.span animate={{ x: weeklyDigest ? 22 : 4 }} className="absolute top-1 left-0 w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-sm" />
                      </button>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="card p-6 border-t-4 border-t-amber-500">
                  <h3 className="text-base font-bold text-[var(--text)] mb-5 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" /> Account Security
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] mb-3">Authentication</h4>
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--text)]">Two-Factor Authentication</p>
                              <p className="text-xs text-[var(--text-3)] mt-0.5">Secure your account with a mobile app</p>
                            </div>
                          </div>
                          <button onClick={() => setTwoFactor(!twoFactor)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${twoFactor ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-[var(--surface)] text-[var(--text-2)] hover:text-amber-500"}`}>
                            {twoFactor ? "Enabled" : "Enable 2FA"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] mb-3">Password</h4>
                      <div className="flex items-center gap-4">
                        <input type="password" value="********" readOnly className="input-base max-w-xs text-center tracking-widest text-[var(--text-3)]" />
                        <button onClick={() => toast("Password reset link sent to email", "info")} className="btn-ghost flex items-center gap-2 text-xs">
                          <Key className="w-4 h-4" /> Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="card p-6 border-t-4 border-t-purple-500">
                  <h3 className="text-base font-bold text-[var(--text)] mb-5 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" /> System Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-3)] mb-2 uppercase tracking-wider">Theme Appearance</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setDark(false)} 
                          className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl font-bold text-sm transition-all ${!dark ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-2)]"}`}
                        >
                          <Sun className="w-4 h-4" /> Light Mode
                        </button>
                        <button 
                          onClick={() => setDark(true)} 
                          className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl font-bold text-sm transition-all ${dark ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-400" : "border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-2)]"}`}
                        >
                          <Moon className="w-4 h-4" /> Dark Mode
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-3)] mb-2 uppercase tracking-wider">Language Region</label>
                      <div className="relative max-w-xs">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
                        <select className="input-base pl-9 w-full appearance-none">
                          <option>English (United States)</option>
                          <option>English (UK)</option>
                          <option>Spanish (ES)</option>
                          <option>French (FR)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                      <h4 className="text-sm font-bold text-rose-500 mb-2">Danger Zone</h4>
                      <p className="text-xs text-[var(--text-3)] mb-4 leading-relaxed">
                        Clearing system cache will remove temporary AI embeddings and reset local preferences. Use this if the system is behaving unexpectedly.
                      </p>
                      <button onClick={() => toast("System cache cleared successfully!", "success")} className="px-4 py-2 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                        <Trash2 className="w-4 h-4" /> Clear System Cache
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
                <button onClick={() => toast("Changes discarded")} className="btn-ghost px-4 py-2 text-sm font-bold text-[var(--text-3)] hover:text-[var(--text)]">Discard</button>
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave} 
                  disabled={loading} 
                  className="btn-primary flex items-center gap-2 min-w-[140px] justify-center py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
