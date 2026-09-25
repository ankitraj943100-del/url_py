import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Server,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  RefreshCcw
} from 'lucide-react';
import { api } from '../services/api';
import { Service, Incident } from '../types';

export const Overview: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSummary = () => {
    setLoading(true);
    api.getDashboardSummary().then(data => {
      setSummary(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading || !summary) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-[#111820] rounded w-64 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[#111820] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = summary.kpis;
  const services: Service[] = summary.services;
  const activeIncidents: Incident[] = summary.active_incidents;

  // Mini sparkline data generators
  const sparkUptime = [{ v: 99.91 }, { v: 99.91 }, { v: 99.92 }, { v: 99.92 }, { v: 99.92 }];
  const sparkError = [{ v: 0.2 }, { v: 0.3 }, { v: 2.4 }, { v: 18.2 }, { v: 38.2 }];
  const sparkLatency = [{ v: 210 }, { v: 220 }, { v: 680 }, { v: 2400 }, { v: 4820 }];
  const sparkAlerts = [{ v: 1 }, { v: 1 }, { v: 3 }, { v: 8 }, { v: 17 }];

  return (
    <div className="p-6 space-y-6">
      {/* Header title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Production Overview</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time infrastructure telemetry, anomaly correlation, & active agent state
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSummary}
            className="p-2 rounded-lg bg-[#111820] border border-[#202833] text-slate-400 hover:text-slate-100 text-xs font-mono flex items-center gap-2 transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Real-time Streaming Ticker Banner */}
      <div className="p-3 bg-[#111820]/80 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2.5 text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-bold text-rose-400">CRITICAL ANOMALY DETECTED:</span>
          <span className="text-slate-200">payment-api DB connection pool overflow (82 → 497 connections).</span>
        </div>
        <button
          onClick={() => navigate('/incidents/INC-1042')}
          className="text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1 text-[11px]"
        >
          View INC-1042 <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 4 KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Uptime */}
        <div className="p-4 bg-[#111820] border border-[#202833] rounded-xl hover:border-slate-700 transition-all space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">System Uptime</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {kpis.system_uptime.trend}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{kpis.system_uptime.value}%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkUptime}>
                <Area type="monotone" dataKey="v" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Error Rate */}
        <div className="p-4 bg-[#111820] border border-rose-500/30 rounded-xl hover:border-rose-500/60 transition-all space-y-3 relative overflow-hidden glow-rose">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Error Rate</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold animate-pulse">
              {kpis.error_rate.trend}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400">{kpis.error_rate.value}%</span>
            <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkError}>
                <Area type="monotone" dataKey="v" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: p95 Latency */}
        <div className="p-4 bg-[#111820] border border-amber-500/30 rounded-xl hover:border-amber-500/60 transition-all space-y-3 relative overflow-hidden glow-amber">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">p95 Latency</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {kpis.p95_latency_ms.trend}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400">{kpis.p95_latency_ms.value}ms</span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkLatency}>
                <Area type="monotone" dataKey="v" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="p-4 bg-[#111820] border border-[#202833] rounded-xl hover:border-slate-700 transition-all space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Active Alerts</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {kpis.total_alerts.trend}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{kpis.total_alerts.value}</span>
            <AlertTriangle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkAlerts}>
                <Area type="monotone" dataKey="v" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid: Service Health & Active Incident Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Health List (2 cols) */}
        <div className="lg:col-span-2 bg-[#111820] border border-[#202833] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202833] pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Service Health & Status
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {summary.service_health_counts.healthy} Healthy · {summary.service_health_counts.critical} Critical
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(srv => (
              <div
                key={srv.id}
                onClick={() => navigate('/services')}
                className={`p-3.5 bg-[#0B0F14] border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  srv.status === 'critical'
                    ? 'border-rose-500/40 hover:border-rose-500 bg-rose-950/10'
                    : srv.status === 'warning' || srv.status === 'degraded'
                    ? 'border-amber-500/30 hover:border-amber-500 bg-amber-950/10'
                    : 'border-[#202833] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{srv.display_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">({srv.name})</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Err: <strong className={srv.error_rate > 2 ? 'text-rose-400' : 'text-slate-300'}>{srv.error_rate}%</strong></span>
                    <span>p95: <strong className={srv.p95_latency_ms > 500 ? 'text-amber-400' : 'text-slate-300'}>{srv.p95_latency_ms}ms</strong></span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                  srv.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  srv.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {srv.status === 'healthy' ? '🟢 Healthy' : srv.status === 'critical' ? '🔴 Critical' : '🟡 Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incident Highlight Panel (1 col) */}
        <div className="bg-[#111820] border border-rose-500/40 rounded-xl p-5 flex flex-col justify-between glow-rose">
          <div>
            <div className="flex items-center justify-between border-b border-[#202833] pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                Active Production Incident
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 font-extrabold animate-pulse">
                🔴 INC-1042
              </span>
            </div>

            {activeIncidents.length > 0 ? (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-100 leading-snug">
                  {activeIncidents[0].title}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Affected Service: <strong className="text-slate-200">{activeIncidents[0].service_name}</strong>
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#202833]">
                    <span className="text-[10px] text-slate-500 block">Error Rate</span>
                    <span className="text-sm font-bold font-mono text-rose-400">{activeIncidents[0].error_rate}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0B0F14] rounded-lg border border-[#202833]">
                    <span className="text-[10px] text-slate-500 block">p95 Latency</span>
                    <span className="text-sm font-bold font-mono text-amber-400">{activeIncidents[0].p95_latency_ms}ms</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#202833] text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Affected Users:</span>
                    <span className="text-slate-200 font-bold">~{activeIncidents[0].affected_users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Multi-Agent Engine:</span>
                    <span className="text-blue-400 font-bold">LangGraph Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-8 text-slate-400 text-xs font-mono">
                ✓ All systems operational. No active incidents.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#202833]">
            <button
              onClick={() => navigate('/incidents/INC-1042')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Investigate with AI Agents</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
