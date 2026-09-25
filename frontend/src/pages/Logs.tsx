import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, GitCommit, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { LogRecord } from '../types';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [service, setService] = useState('payment-api');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getLogs({ service, level, search }).then(data => {
      setLogs(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [service, level, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Log Explorer</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time structured application logs, error traces, & span context</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#111820] border border-[#202833] rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search log messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0B0F14] border border-[#202833] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-64 focus:border-blue-500"
            />
          </div>

          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-[#0B0F14] border border-[#202833] text-slate-200 rounded-lg px-3 py-1.5 outline-none font-mono"
          >
            <option value="all">All Services</option>
            <option value="payment-api">payment-api</option>
            <option value="auth-service">auth-service</option>
            <option value="postgres-db">postgres-db</option>
            <option value="redis-cache">redis-cache</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-[#0B0F14] border border-[#202833] text-slate-200 rounded-lg px-3 py-1.5 outline-none font-mono"
          >
            <option value="all">All Levels</option>
            <option value="FATAL">FATAL</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
          </select>
        </div>

        <span className="font-mono text-slate-400 text-xs">{logs.length} Log Entries</span>
      </div>

      {/* Log Console Container */}
      <div className="bg-[#0B0F14] border border-[#202833] rounded-xl font-mono text-xs overflow-hidden">
        <div className="p-3 bg-[#111820] border-b border-[#202833] text-[11px] font-bold text-slate-400 flex items-center justify-between">
          <span>Timestamp / Service / Level / Message</span>
          <span>Trace ID</span>
        </div>

        <div className="divide-y divide-[#161F2A] max-h-[600px] overflow-y-auto">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="hover:bg-[#111820]/80 transition-colors">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="p-3 flex items-start justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}

                    <span className="text-slate-500 shrink-0">
                      {new Date(log.timestamp).toISOString().split('T')[1].slice(0, 12)}
                    </span>

                    <span className="text-blue-400 font-bold shrink-0">[{log.service_name}]</span>

                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                      log.level === 'FATAL' || log.level === 'ERROR'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.level}
                    </span>

                    <span className="text-slate-200 truncate">{log.message}</span>
                  </div>

                  {log.trace_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/traces?trace_id=${log.trace_id}`);
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-mono text-[11px] shrink-0"
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>{log.trace_id}</span>
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="p-3 bg-[#111820] border-t border-[#202833] text-[11px] text-slate-300 space-y-2">
                    <p className="text-slate-400 font-bold">Structured JSON View:</p>
                    <pre className="p-3 bg-[#0B0F14] rounded border border-[#202833] text-emerald-400 overflow-x-auto">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
