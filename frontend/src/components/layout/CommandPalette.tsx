import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Server, FileText, Bot, Sliders } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { title: 'INC-1042 — Payment API degradation', type: 'Incident', path: '/incidents/INC-1042', icon: AlertTriangle },
    { title: 'payment-api service health', type: 'Service', path: '/services', icon: Server },
    { title: 'Inject DB Failure Scenario', type: 'Simulator', path: '/simulator', icon: Sliders },
    { title: 'View Distributed Trace Waterfalls', type: 'Traces', path: '/traces', icon: FileText },
    { title: 'Inspect AI Multi-Agent Engine', type: 'Agents', path: '/agents', icon: Bot },
  ];

  const filtered = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.type.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24">
      <div className="bg-[#111820] border border-[#202833] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#202833] flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search incidents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm font-sans"
          />
          <span className="text-[10px] font-mono text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg text-xs hover:bg-[#1A232E] text-slate-200 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                  {item.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
