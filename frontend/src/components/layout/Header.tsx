import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';

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
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 'INC-1042',
      title: 'Payment API degradation — High 5xx errors (38.2%)',
      time: '18 min ago',
      severity: 'critical',
      service: 'payment-api',
      message: 'Prometheus alert triggered. DB connections spiked to 497/500. LangGraph investigation active.',
      unread: true
    },
    {
      id: 'INC-1041',
      title: 'PostgreSQL Database Connection Saturation',
      time: '21 min ago',
      severity: 'warning',
      service: 'postgres-db',
      message: 'Active connections reached 99.4% capacity. Correlated with deployment payment-service v2.4.1.',
      unread: true
    },
    {
      id: 'INC-1040',
      title: 'Redis Cache Miss Rate Spike (64%)',
      time: '45 min ago',
      severity: 'warning',
      service: 'redis-cache',
      message: 'Session lookup fallback cascade causing auth latency increase.',
      unread: true
    },
    {
      id: 'AI-RUN-1',
      title: 'AI Multi-Agent Root Cause Hypothesis Ready',
      time: '15 min ago',
      severity: 'info',
      service: 'sentinelops-ai',
      message: 'Root Cause Agent completed analysis: Database pool exhaustion following deployment v2.4.1 (0.91 confidence).',
      unread: false
    }
  ];

  const handleAlertClick = (targetPath: string) => {
    setNotificationsOpen(false);
    navigate(targetPath);
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-[#0E131A] border-b border-[#1E2632] px-6 flex items-center justify-between z-30 select-none relative">
      {/* Search Bar / Cmd+K trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-[#1E2632] text-slate-400 hover:text-slate-200 text-xs w-72 transition-all hover:border-blue-500/40 shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex-1 text-left font-sans">Search incidents, services, logs...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#161F2A] text-[10px] font-mono text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Environment Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0F14] border border-[#1E2632] text-[11px] font-mono text-slate-300">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>production / us-east-1</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* CLICKABLE NOTIFICATION BELL BUTTON */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
            notificationsOpen
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10'
              : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400'
          }`}
        >
          <Bell className="w-4 h-4 animate-bounce shrink-0" />
          <span>{unreadCount > 0 ? `${unreadCount} Alerts (INC-1042)` : 'Notification Center'}</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* NOTIFICATION CENTER DROPDOWN POPOVER PANEL */}
        {notificationsOpen && (
          <div className="absolute right-36 top-14 w-96 bg-[#111820] border border-[#1E2632] rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Popover Header */}
            <div className="p-4 border-b border-[#1E2632] bg-[#0B0F14]/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">SRE Notification Center</h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-mono text-blue-400 hover:text-blue-300 font-bold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#1E2632]">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleAlertClick(notif.id.startsWith('INC') ? `/incidents/${notif.id}` : '/incidents/INC-1042')}
                  className={`p-3.5 hover:bg-[#161F2A] cursor-pointer transition-colors space-y-1.5 ${
                    notif.unread ? 'bg-rose-950/10' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        notif.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        notif.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {notif.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{notif.service}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {notif.time}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-100 leading-snug">{notif.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>

            {/* Popover Footer */}
            <div className="p-3 bg-[#0B0F14] border-t border-[#1E2632] text-center">
              <button
                onClick={() => handleAlertClick('/incidents')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-mono"
              >
                <span>View All Active Incidents in Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Direct Settings Gear Icon Button */}
        <button
          onClick={() => navigate('/settings')}
          title="System Settings & LLM Config"
          className="p-2 rounded-xl bg-[#161F2A] hover:bg-slate-800 border border-[#1E2632] hover:border-blue-500/50 text-slate-300 hover:text-blue-400 transition-all shadow-sm group"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Copilot Toggle Button */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            copilotOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400'
              : 'bg-[#161F2A] border border-slate-700 text-blue-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sentinel Copilot</span>
        </button>
      </div>
    </header>
  );
};
