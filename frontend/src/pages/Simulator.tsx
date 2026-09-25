import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Zap, RefreshCw, AlertTriangle, ShieldCheck, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const Simulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('db_connection_exhaustion');
  const [targetService, setTargetService] = useState('payment-api');
  const [injecting, setInjecting] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 'db_connection_exhaustion',
      title: 'Database connection pool exhaustion',
      description: 'Increases DB connections from 82 → 497, p95 latency to 4.82s, and 5xx error rate to 38.2%. (Default portfolio demo)',
      badge: 'Recommended Demo Scenario',
      color: 'border-rose-500/40 text-rose-400'
    },
    {
      id: 'deployment_regression',
      title: 'Deployment regression v2.4.1',
      description: 'Simulates unhandled connection leak introduced by payment-service v2.4.1 release.',
      badge: 'Deployment',
      color: 'border-blue-500/40 text-blue-400'
    },
    {
      id: 'cpu_spike',
      title: 'CPU utilization spike (> 95%)',
      description: 'Injects high thread lock contention raising CPU usage to 98.4% on payment pods.',
      badge: 'CPU Lock',
      color: 'border-amber-500/40 text-amber-400'
    },
    {
      id: 'redis_failure',
      title: 'Redis connection timeouts',
      description: 'Simulates cache eviction cascade causing auth session lookup fallback timeouts.',
      badge: 'Redis Cache',
      color: 'border-purple-500/40 text-purple-400'
    }
  ];

  const handleInject = async () => {
    setInjecting(true);
    setResultData(null);
    try {
      const res = await api.injectSimulator(selectedScenario, targetService);
      setResultData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setInjecting(false);
    }
  };

  const handleReset = async () => {
    setInjecting(true);
    try {
      await api.resetSimulator();
      setResultData({ status: 'recovered', message: 'Telemetry reset to healthy baseline state (0.2% error rate, 185ms latency).' });
    } catch (err: any) {
      console.error(err);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Deterministic Incident Simulator</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Inject reproducible production anomalies to demonstrate multi-agent AI incident response</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Failure Injection Controls (2 cols) */}
        <div className="lg:col-span-2 bg-[#111820] border border-[#202833] rounded-xl p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">1. Select Anomaly Scenario</h3>
            <div className="space-y-2.5">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                    selectedScenario === sc.id
                      ? 'bg-blue-600/15 border-blue-500 text-slate-100 shadow-md shadow-blue-500/5'
                      : 'bg-[#0B0F14] border-[#202833] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="scenario"
                        checked={selectedScenario === sc.id}
                        onChange={() => setSelectedScenario(sc.id)}
                        className="text-blue-500 accent-blue-500"
                      />
                      <span className="font-bold text-xs">{sc.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6">{sc.description}</p>
                  </div>
                  {sc.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#111820] border ${sc.color}`}>
                      {sc.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#202833] flex items-center gap-4">
            <button
              onClick={handleInject}
              disabled={injecting}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{injecting ? 'Injecting Anomaly...' : 'Inject Incident'}</span>
            </button>

            <button
              onClick={handleReset}
              disabled={injecting}
              className="px-5 py-3 rounded-xl bg-[#1A232E] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Telemetry to Baseline</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Telemetry Shift Output (1 col) */}
        <div className="bg-[#111820] border border-[#202833] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 border-b border-[#202833] pb-3 uppercase tracking-wide">
              Simulator Execution Monitor
            </h3>

            {resultData ? (
              <div className="mt-4 space-y-4 font-mono text-xs">
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Failure Injected: {resultData.scenario}</span>
                </div>

                <div className="space-y-2 p-3 bg-[#0B0F14] rounded-xl border border-[#202833] text-slate-300">
                  <div className="flex justify-between">
                    <span>Incident Created:</span>
                    <span className="text-rose-400 font-bold">{resultData.incident_id || 'INC-1042'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className="text-rose-400 font-bold">{resultData.metrics?.error_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>p95 Latency:</span>
                    <span className="text-amber-400 font-bold">{resultData.metrics?.p95_latency_ms}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Connections:</span>
                    <span className="text-blue-400 font-bold">{resultData.metrics?.db_connections}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-8 text-slate-500 font-mono text-xs">
                Select a scenario and click Inject Incident to generate live telemetry anomalies.
              </div>
            )}
          </div>

          {resultData && (
            <button
              onClick={() => navigate('/incidents/INC-1042')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <span>Open Live AI Investigation (INC-1042)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
