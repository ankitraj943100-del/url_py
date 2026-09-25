import React, { useEffect, useState } from 'react';
import { Server, ArrowRight, ShieldCheck, Activity, Cpu, HardDrive, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Service } from '../types';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices().then(data => {
      setServices(data);
      if (data.length > 0) setSelectedService(data.find(s => s.name === 'payment-api') || data[0]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Monitored Microservices Catalog</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time dependency topology, error budgets, & infrastructure utilization</p>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#202833] pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Interactive Dependency Graph & Call Paths
          </h3>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
            OpenTelemetry Topology
          </span>
        </div>

        <div className="p-6 bg-[#0B0F14] rounded-xl border border-[#202833] flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          <div className="p-4 bg-[#111820] border border-blue-500/40 rounded-xl text-blue-400 font-bold shadow-lg shadow-blue-500/5 text-center">
            <p className="text-slate-200">Client / Browser</p>
            <p className="text-[10px] text-slate-500 mt-1">HTTPS / REST</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="p-4 bg-[#111820] border border-blue-500/40 rounded-xl text-blue-400 font-bold text-center">
            <p className="text-slate-100">api-gateway</p>
            <p className="text-[10px] text-emerald-400">🟢 850 req/s</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl text-rose-400 font-bold text-center animate-pulse glow-rose">
            <p className="text-slate-100">payment-api</p>
            <p className="text-[10px] text-rose-400 font-bold">🔴 38.2% Err (CRITICAL)</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl text-amber-400 font-bold text-center">
            <p className="text-slate-100">postgres-db</p>
            <p className="text-[10px] text-amber-400">🟡 497 Connections</p>
          </div>
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv) => {
          const isSelected = selectedService?.id === srv.id;
          return (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className={`p-4 bg-[#111820] border rounded-xl space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10'
                  : 'border-[#202833] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#202833] pb-2">
                <span className="font-bold text-xs text-slate-100">{srv.display_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  srv.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  srv.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse font-bold' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {srv.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Req Rate:</span>
                  <span className="text-slate-200 font-bold">{srv.request_rate} req/s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Error Rate:</span>
                  <span className={srv.error_rate > 2 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{srv.error_rate}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>p95 Latency:</span>
                  <span className={srv.p95_latency_ms > 500 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{srv.p95_latency_ms}ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CPU Usage:</span>
                  <span className="text-slate-200">{srv.cpu_utilization}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
