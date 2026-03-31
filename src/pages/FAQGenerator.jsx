import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { FileText, Sparkles, Copy, Download, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

const DOCUMENTS = [
  "Employee Handbook 2024",
  "Leave Management Policy",
  "IT Security Policy",
  "Code of Conduct",
  "Expense Reimbursement Policy"
];

const MOCK_FAQS = {
  "Employee Handbook 2024": [
    { q: "What are the standard working hours?", a: "Standard working hours are 9 AM to 6 PM, Monday to Friday. Core hours (10 AM - 4 PM) require all employees to be available." },
    { q: "What benefits are included in my package?", a: "Benefits include health insurance, dental & vision coverage, 25 days annual leave, 10 sick days, annual performance bonus, and professional development allowance of $2,000/year." }
  ],
  "Leave Management Policy": [
    { q: "How many days of annual leave am I entitled to?", a: "25 days per calendar year for all full-time employees. Employees with 5+ years receive 30 days." },
    { q: "Can I carry over unused leave to the next year?", a: "Up to 5 days can be carried over to the following year but must be used within Q1 (March 31)." }
  ]
};

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Q: ${item.q}\nA: ${item.a}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 p-4 text-left">
        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-[var(--text)] leading-snug">{item.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className="flex-shrink-0 mt-0.5">
          <ChevronDown className="w-4 h-4 text-[var(--text-3)]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0">
              <div className="ml-9 p-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text-2)] leading-relaxed">
                {item.a}
              </div>
              <div className="ml-9 mt-2 flex items-center gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text)] transition-colors">
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQGenerator() {
  const { toast } = useAppContext();
  const [doc, setDoc] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = async () => {
    if (!doc) return;
    setGenerating(true);
    setFaqs([]);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 200));
      setProgress(i);
    }
    
    const results = MOCK_FAQS[doc] || MOCK_FAQS["Employee Handbook 2024"];
    setFaqs(results);
    setGenerating(false);
    toast(`Generated ${results.length} FAQs from "${doc}"`);
  };

  const handleCopyAll = () => {
    const text = faqs.map((f, i) => `Q${i + 1}: ${f.q}\nA: ${f.a}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast("All FAQs copied to clipboard");
  };

  const handleExport = () => {
    const text = faqs.map((f, i) => `Q${i + 1}: ${f.q}\nA: ${f.a}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.replace(/\s+/g, '-').toLowerCase()}-faqs.txt`;
    a.click();
    toast("FAQs exported as text file");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="FAQ Generator" subtitle="Automatically generate FAQs from your policy documents using AI" />
      
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-2">Select Document</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
              <select 
                value={doc} 
                onChange={(e) => { setDoc(e.target.value); setFaqs([]); }} 
                className="input-base pl-9 appearance-none cursor-pointer"
              >
                <option value="">Choose a policy document...</option>
                {DOCUMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.97 }} 
            onClick={generate} 
            disabled={!doc || generating} 
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? (
              <><Sparkles className="w-4 h-4 animate-pulse" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate FAQs</>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-[var(--text-3)]">Analyzing document and generating FAQs...</p>
                <span className="text-xs font-mono font-bold text-indigo-500">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden shadow-inner">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" transition={{ duration: 0.1 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {faqs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--text)]">{faqs.length} FAQs Generated</h2>
              <Badge color="emerald">From: {doc}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopyAll} className="btn-ghost flex items-center gap-2 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
              <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-xs">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => <FAQItem key={i} item={f} index={i} />)}
          </div>
        </motion.div>
      )}

      {!generating && faqs.length === 0 && (
        <div className="text-center py-12 text-[var(--text-3)]">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{doc ? "Click \"Generate FAQs\" to create questions from this document" : "Select a document to get started"}</p>
        </div>
      )}
    </div>
  );
}
