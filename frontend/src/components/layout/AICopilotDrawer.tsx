import React, { useState } from 'react';
import { Sparkles, X, Send, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; evidence?: any[] }>>([
    {
      sender: 'ai',
      text: 'Hello Ankit! I am Sentinel Copilot. Ask me anything about payment-api degradation or active telemetry anomalies.',
      evidence: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.chatCopilot(userMsg, 'INC-1042');
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          evidence: res.evidence_citations
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to SentinelOps Copilot engine.',
          evidence: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-[#111820] border-l border-[#202833] shadow-2xl flex flex-col z-30">
      {/* Header */}
      <div className="p-4 border-b border-[#202833] flex items-center justify-between bg-[#0B0F14]/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-wide">Sentinel Copilot</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] p-3 rounded-lg text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-[#1A232E] border border-slate-800 text-slate-200'
              }`}
            >
              {m.text}

              {/* Evidence Citation Links */}
              {m.evidence && m.evidence.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-1.5">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Grounded Evidence
                  </p>
                  {m.evidence.map((ev, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono bg-[#0B0F14] p-1.5 rounded border border-slate-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{ev.type}: {ev.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Analyzing correlated telemetry evidence...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-[#202833] bg-[#0B0F14]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about payment-api degradation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#1A232E] border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
