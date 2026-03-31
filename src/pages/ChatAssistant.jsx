import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Send, Bot, Paperclip, Mic, Copy, Lightbulb, ThumbsUp, ThumbsDown, MoreHorizontal, FileText, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';

const QUICK_QUESTIONS = [
  "What is the leave policy?",
  "How to request WFH?",
  "Expense reimbursement process",
  "IT equipment request"
];

const MOCK_RESPONSES = [
  {
    text: `Based on the latest **WFH Policy v2.1**, eligible employees can request remote work under the following conditions:

1. Must have completed 6 months of employment
2. Role must be classified as 'remote-eligible'
3. Must maintain a home workspace meeting IT security standards

Department heads can grant exceptions on a case-by-case basis.`,
    confidence: 97,
    sources: [{ doc: "WFH Policy v2.1", page: "Eligibility Criteria, p.2", confidence: 97 }]
  },
  {
    text: "The standard annual leave is 25 days per calendar year. You can carry over up to 5 days to the next year, which must be used by March 31st.",
    confidence: 100,
    sources: [{ doc: "Employee Handbook 2024", page: "Leave Management, p.14", confidence: 100 }]
  }
];

function MessageBubble({ msg, isLatest }) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useAppContext();

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    toast("Answer copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[75%] bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
          {msg.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="card p-4 rounded-2xl rounded-bl-sm">
          {msg.confidence && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border)]">
              <div className="flex-1 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${msg.confidence}%` }} 
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${msg.confidence > 85 ? "bg-emerald-500" : msg.confidence > 70 ? "bg-amber-500" : "bg-rose-500"}`}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--text-3)]">{msg.confidence}% confidence</span>
            </div>
          )}
          
          <div className="text-sm leading-relaxed text-[var(--text)] whitespace-pre-line">
            {msg.text}
          </div>

          {msg.sources && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <button onClick={() => setShowSources(!showSources)} className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-3)] hover:text-indigo-500 transition-colors">
                <FileText className="w-3 h-3" />
                {msg.sources.length} Source{msg.sources.length > 1 ? "s" : ""}
                <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSources && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-2 space-y-1.5">
                      {msg.sources.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] text-[10px] border border-[var(--border)]/50">
                          <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span className="text-[var(--text)] font-semibold flex-1">{s.doc}</span>
                          <span className="text-[var(--text-3)] font-medium">{s.page}</span>
                          <span className={`font-mono font-bold ${s.confidence > 85 ? "text-emerald-500" : "text-amber-500"}`}>{s.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex items-center gap-1 mt-3">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text)] text-[10px] font-medium transition-colors">
              <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={() => toast("Analyzing text for deeper explanation...", "info")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-[var(--text-3)] hover:text-purple-500 text-[10px] font-medium transition-colors">
              <Lightbulb className="w-3.5 h-3.5" /> Explain
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => toast("Feedback submitted!")} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[var(--text-3)] hover:text-emerald-500 transition-colors" title="Helpful">
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => toast("Feedback submitted. We will improve.")} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-[var(--text-3)] hover:text-rose-500 transition-colors" title="Not Helpful">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-brand-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export function ChatAssistant() {
  const { toast } = useAppContext();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your Enterprise Knowledge Assistant. I can help you find information about company policies, HR guidelines, compliance documents, and more. What would you like to know?", confidence: null, sources: null }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textItem) => {
    if (!textItem.trim()) return;
    
    const userMsg = { role: "user", text: textItem };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    // Determine delay and response semi-randomly without triggering purity rules
    // eslint-disable-next-line react-hooks/purity
    const delay = 1200 + (Date.now() % 800);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // eslint-disable-next-line react-hooks/purity
    const response = MOCK_RESPONSES[(Date.now() % MOCK_RESPONSES.length)];
    setLoading(false);
    setMessages(prev => [...prev, { role: "assistant", ...response }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: "assistant", text: "Hello! I'm your Enterprise Knowledge Assistant. I can help you find information about company policies, HR guidelines, compliance documents, and more. What would you like to know?", confidence: null, sources: null }
    ]);
    toast("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Knowledge Assistant</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wider">Online · GPT-4 + RAG</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="btn-ghost flex items-center gap-2 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scroll-smooth">
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 mt-4">
            {QUICK_QUESTIONS.map((q, i) => (
              <motion.button 
                key={q} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSend(q)}
                className="card p-4 text-left text-sm font-medium text-[var(--text-2)] hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all group hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Lightbulb className="w-4 h-4 text-indigo-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                {q}
              </motion.button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1} />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="card rounded-2xl rounded-bl-sm border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 pt-2">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="card p-3 flex items-end gap-3 relative rounded-2xl bg-[var(--surface)]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any company policy, document, or guideline..."
              rows={1}
              className="w-full bg-transparent outline-none text-sm text-[var(--text)] placeholder:text-[var(--text-3)] resize-none py-1.5"
              style={{ minHeight: 32, maxHeight: 120 }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toast("Opening file browser...", "info")} className="p-2.5 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-indigo-500 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button onClick={() => toast("Voice input ready. Start speaking.", "info")} className="p-2.5 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-emerald-500 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-transform shadow-lg shadow-indigo-500/25 ml-1"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-[var(--text-3)] mt-3 tracking-wide">
          Answers are generated from your company's secure document library · AI can make mistakes
        </p>
      </div>
    </div>
  );
}
