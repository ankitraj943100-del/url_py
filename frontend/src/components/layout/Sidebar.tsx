import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Server,
  Activity,
  FileText,
  GitCommit,
  Bot,
  BookOpen,
  PlaySquare,
  FileCheck2,
  Sliders,
  ShieldCheck,
  Radio,
  Settings as SettingsIcon,
  SlidersHorizontal
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Incidents', path: '/incidents', icon: AlertTriangle, badge: 'INC-1042' },
  { name: 'Services', path: '/services', icon: Server },
  { name: 'Metrics', path: '/metrics', icon: Activity },
  { name: 'Logs Explorer', path: '/logs', icon: FileText },
  { name: 'Distributed Traces', path: '/traces', icon: GitCommit },
  { name: 'AI Multi-Agent', path: '/agents', icon: Bot, highlightTag: 'LangGraph' },
  { name: 'SRE Runbooks', path: '/runbooks', icon: BookOpen },
  { name: 'Incident Simulator', path: '/simulator', icon: Sliders, highlight: true },
  { name: 'Incident Replay', path: '/replay', icon: PlaySquare },
  { name: 'Postmortems', path: '/postmortems', icon: FileCheck2 },
  { name: 'System Settings', path: '/settings', icon: SettingsIcon, configTag: 'Config' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0E131A] border-r border-[#1E2632] flex flex-col justify-between select-none z-20">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 px-5 border-b border-[#1E2632] flex items-center justify-between bg-[#0B0F14]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-lg shadow-blue-500/10">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">SentinelOps AI</h1>
              <p className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Agentic SRE v1.0</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Observability Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-500/5 font-semibold'
                      : item.highlight
                      ? 'text-amber-400 hover:bg-[#161F2A] border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5'
                      : 'text-slate-400 hover:bg-[#161F2A] hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${
                    item.path === '/settings' ? 'group-hover:rotate-90 text-blue-400' : ''
                  } ${item.highlight ? 'text-amber-400' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold animate-pulse shadow-sm shadow-rose-500/20">
                    {item.badge}
                  </span>
                )}
                {item.highlightTag && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    {item.highlightTag}
                  </span>
                )}
                {item.configTag && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    ⚙️ {item.configTag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Operator Info */}
      <div className="p-4 border-t border-[#1E2632] bg-[#0A0E13]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400 shadow-sm">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">Ankit Raj</p>
              <p className="text-[10px] text-emerald-400 font-mono truncate">SRE Lead Operator</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </aside>
  );
};
