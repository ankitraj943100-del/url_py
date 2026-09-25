import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity, Server } from 'lucide-react';
import { api } from '../services/api';

export const Metrics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate realistic time-series points
    const points = [
      { time: '14:10', cpu: 32, latency: 190, errorRate: 0.2, dbConn: 74 },
      { time: '14:12', cpu: 34, latency: 195, errorRate: 0.2, dbConn: 78 },
      { time: '14:14', cpu: 31, latency: 205, errorRate: 0.3, dbConn: 80 },
      { time: '14:16', cpu: 35, latency: 210, errorRate: 0.2, dbConn: 82 },
      { time: '14:18', cpu: 34, latency: 200, errorRate: 0.2, dbConn: 85 },
      { time: '14:19', cpu: 38, latency: 220, errorRate: 0.3, dbConn: 90 }, // Deployment v2.4.1
      { time: '14:20', cpu: 52, latency: 420, errorRate: 1.8, dbConn: 240 },
      { time: '14:21', cpu: 74, latency: 1800, errorRate: 8.4, dbConn: 497 }, // DB spike
      { time: '14:22', cpu: 88, latency: 4100, errorRate: 24.2, dbConn: 497 },
      { time: '14:23', cpu: 91, latency: 4820, errorRate: 38.2, dbConn: 497 }, // Incident peak
      { time: '14:24', cpu: 91, latency: 4820, errorRate: 38.2, dbConn: 497 },
      { time: '14:26', cpu: 90, latency: 4800, errorRate: 37.8, dbConn: 497 },
      { time: '14:28', cpu: 89, latency: 4780, errorRate: 36.4, dbConn: 497 }, // Approval
      { time: '14:30', cpu: 62, latency: 1200, errorRate: 9.1, dbConn: 180 }, // Recovery
      { time: '14:32', cpu: 36, latency: 210, errorRate: 0.4, dbConn: 78 },
      { time: '14:34', cpu: 34, latency: 185, errorRate: 0.2, dbConn: 74 },
    ];
    setData(points);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Metrics Explorer</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">High-frequency Prometheus time-series telemetry charts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Error Rate % */}
        <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">payment-api Error Rate (%)</h3>
            <span className="font-mono text-xs text-rose-400 font-bold">Peak: 38.2%</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202833" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#202833', color: '#F8FAFC' }} />
                <ReferenceLine y={2.0} label="Threshold (2%)" stroke="#EF4444" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="errorRate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: p95 Latency ms */}
        <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">payment-api p95 Latency (ms)</h3>
            <span className="font-mono text-xs text-amber-400 font-bold">Peak: 4,820ms</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202833" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#202833', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="latency" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: DB Connections */}
        <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Postgres DB Active Connections</h3>
            <span className="font-mono text-xs text-blue-400 font-bold">Limit: 500 (Peak: 497)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202833" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#202833', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="dbConn" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: CPU Utilization % */}
        <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">CPU Utilization (%)</h3>
            <span className="font-mono text-xs text-emerald-400 font-bold">Peak: 91%</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202833" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F14', borderColor: '#202833', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="cpu" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
