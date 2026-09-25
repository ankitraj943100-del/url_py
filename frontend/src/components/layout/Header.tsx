import React from 'react';
import { Search, Bell, Sparkles, Server, Globe } from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onToggleCopilot,
  copilotOpen
}) => {
  return (
    <header className="h-14 bg-[#111820] border-b border-[#202833] px-6 flex items-center justify-between z-10 select-none">
      {/* Search Bar / Cmd+K trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#0B0F14] border border-[#202833] text-slate-400 hover:text-slate-200 text-xs w-72 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex-1 text-left">Search incidents, services, logs...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1A232E] text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Environment Selector */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B0F14] border border-[#202833] text-[11px] font-mono text-slate-300">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>production / us-east-1</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Active Incident Notification Alert */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>3 Alerts (INC-1042 Critical)</span>
        </div>

        {/* Copilot Toggle Button */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            copilotOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-[#1A232E] border border-slate-700 text-blue-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sentinel Copilot</span>
        </button>
      </div>
    </header>
  );
};
