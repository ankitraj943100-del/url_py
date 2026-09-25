import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadIncidents = () => {
    setLoading(true);
    api.getIncidents({ severity: filterSeverity, status: filterStatus, search })
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadIncidents();
  }, [filterSeverity, filterStatus, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Incident Management</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time alerts, AI investigation states, & resolution workflows</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#111820] border border-[#202833] rounded-xl">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search incidents (e.g. payment, db, 500)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0B0F14] border border-[#202833] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-64 focus:border-blue-500"
            />
          </div>

          {/* Severity Pills */}
          <div className="flex items-center gap-1.5 bg-[#0B0F14] p-1 rounded-lg border border-[#202833] text-xs">
            {['all', 'critical', 'high', 'medium', 'resolved'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-all ${
                  filterSeverity === sev
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="bg-[#111820] border border-[#202833] rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0B0F14] border-b border-[#202833] text-[11px] font-mono text-slate-400 uppercase">
            <tr>
              <th className="p-4">Incident</th>
              <th className="p-4">Service</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Error Rate</th>
              <th className="p-4">p95 Latency</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202833]">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-[#1A232E]/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-400 font-bold">{inc.id}</span>
                    <div>
                      <p className="font-semibold text-slate-200 text-xs">{inc.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Detected {new Date(inc.detected_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-slate-300">{inc.service_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                    inc.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    inc.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="p-4 font-mono font-bold text-rose-400">{inc.error_rate}%</td>
                <td className="p-4 font-mono font-bold text-amber-400">{inc.p95_latency_ms}ms</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${
                    inc.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    inc.status === 'investigating' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {inc.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => navigate(`/incidents/${inc.id}`)}
                    className="px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-xs font-medium transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Investigate</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
