import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Upload, Search, FileText, CheckCircle2, Clock, FileEdit, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

const INITIAL_DOCS = [
  { id: 1, title: "Employee Handbook 2024", type: "HR", date: "2024-01-15", size: "2.4 MB", status: "active", pages: 48 },
  { id: 2, title: "Leave Management Policy", type: "HR", date: "2024-01-10", size: "856 KB", status: "active", pages: 12 },
  { id: 3, title: "Q1 Financial Guidelines", type: "Finance", date: "2024-01-08", size: "1.1 MB", status: "processing", pages: 22 },
  { id: 4, title: "Code of Conduct", type: "Legal", date: "2023-12-20", size: "680 KB", status: "active", pages: 16 },
  { id: 5, title: "IT Security Policy", type: "IT", date: "2023-12-15", size: "940 KB", status: "active", pages: 28 },
  { id: 6, title: "Data Privacy Compliance", type: "Legal", date: "2023-12-01", size: "1.8 MB", status: "active", pages: 34 }
];

const TYPE_COLORS = {
  HR: "emerald",
  Finance: "amber",
  Legal: "brand",
  IT: "rose"
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "emerald", icon: CheckCircle2 },
  processing: { label: "Processing", color: "amber", icon: Clock },
  draft: { label: "Draft", color: "default", icon: FileEdit }
};

export function PolicyLibrary() {
  const { toast, role } = useAppContext();
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const filters = ["All", "HR", "Finance", "Legal", "IT"];
  const filteredDocs = docs.filter(d => (filter === "All" || d.type === filter) && d.title.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const processingDocs = docs.filter(d => d.status === "processing");
    if (processingDocs.length > 0) {
      const timer = setTimeout(() => {
        setDocs(prev => prev.map(d => d.status === "processing" ? { ...d, status: "active", pages: Math.floor(Math.random() * 20)+5 } : d));
        toast("Processing complete for uploaded documents", "success");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [docs, toast]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newDocs = files.map((f, i) => ({
      id: Date.now() + i,
      title: f.name.replace(/\.[^/.]+$/, ""),
      type: "HR",
      date: new Date().toISOString().split("T")[0],
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      status: "processing",
      pages: "—"
    }));
    setDocs(prev => [...newDocs, ...prev]);
    toast(`${files.length} file(s) uploaded and being processed`);
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast("Document deleted", "info");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Policy Library" 
        subtitle={`${docs.length} documents · ${docs.filter(m => m.status === "active").length} active`}
        actions={role !== "employee" && (
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Policy
          </button>
        )}
      />

      {role !== "employee" && (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          animate={{ scale: dragActive ? 1.02 : 1, borderColor: dragActive ? "#6370f1" : "var(--border)" }}
          className="border-2 border-dashed rounded-2xl p-8 mb-6 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors"
        >
          <motion.div animate={{ y: dragActive ? -4 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
            <Upload className={`w-10 h-10 ${dragActive ? "text-indigo-500" : "text-[var(--text-3)]"} transition-colors`} />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text)]">{dragActive ? "Drop to upload" : "Drag & drop documents here"}</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">PDF, DOCX, TXT up to 50MB</p>
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            multiple 
            className="hidden" 
            accept=".pdf,.docx,.txt" 
            onChange={(e) => handleFiles(Array.from(e.target.files))} 
          />
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-3)]" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search documents..." 
            className="input-base pl-8 text-sm" 
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-2)] rounded-xl">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-3)] hover:text-[var(--text)]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDocs.map((doc, i) => {
            const config = STATUS_CONFIG[doc.status];
            const StatusIcon = config.icon;
            return (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="card p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={config.color}>
                      <StatusIcon className="w-2.5 h-2.5 mr-1 inline" /> {config.label}
                    </Badge>
                    {role !== "employee" && (
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-1 leading-snug">{doc.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge color={TYPE_COLORS[doc.type] || "default"}>{doc.type}</Badge>
                  <span className="text-[10px] text-[var(--text-3)]">{doc.pages} pages · {doc.size}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-[10px] text-[var(--text-3)]">{doc.date}</span>
                  <button onClick={() => toast(`Opening ${doc.title}...`)} className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <FileText className="w-8 h-8 text-[var(--text-3)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-2)] font-medium">No documents found</p>
            <p className="text-[var(--text-3)] text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
