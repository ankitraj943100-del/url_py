import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Clock, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { AgentRun } from '../types';

export const Agents: React.FC = () => {
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAgentRuns('INC-1042').then(data => {
      setAgentRuns(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const agentsList = [
    { id: 'alert-analyzer', icon: '🔍', name: 'Alert Analyzer', defaultSummary: 'Parsed alert payload INC-1042: High 5xx error rate on payment-api (38.2%).', duration: '1.2s' },
    { id: 'log-investigator', icon: '📜', name: 'Log Investigator', defaultSummary: 'Analyzed 14,283 log entries. Found 327 correlated QueuePool connection timeout errors.', duration: '1.8s' },
    { id: 'metrics-investigator', icon: '📊', name: 'Metrics Agent', defaultSummary: 'Compared CPU, memory, latency, and DB connection metrics before vs during incident.', duration: '1.4s' },
    { id: 'trace-investigator', icon: '🧬', name: 'Trace Investigator', defaultSummary: 'Traversed distributed request trace spans. Identified DB connection acquisition as bottleneck.', duration: '1.6s' },
    { id: 'correlation-agent', icon: '⏱️', name: 'Temporal Correlation Agent', defaultSummary: 'Correlate deployment payment-service v2.4.1 with DB connection spike 2 minutes later.', duration: '1.3s' },
    { id: 'rag-agent', icon: '📚', name: 'RAG Knowledge Agent', defaultSummary: 'Retrieved SRE runbook DB-POOL-003 and historical postmortem INC-1001 via pgvector search.', duration: '1.1s' },
    { id: 'root-cause-agent', icon: '🧠', name: 'Root Cause Agent', defaultSummary: 'Generated High confidence (0.91) root cause hypothesis with 5 evidence callouts.', duration: '1.5s' },
    { id: 'remediation-agent', icon: '⚡', name: 'Remediation Agent', defaultSummary: 'Formulated 4-step remediation plan. Created high-risk human approval gate.', duration: '1.7s' },
    { id: 'verification-agent', icon: '🛡️', name: 'Verification Agent', defaultSummary: 'Polled telemetry metrics post-remediation. Verified 0.2% error rate and 185ms latency recovery.', duration: '2.1s' },
    { id: 'postmortem-generator', icon: '📝', name: 'Postmortem Generator', defaultSummary: 'Generated comprehensive Markdown postmortem document for INC-1042.', duration: '1.0s' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">AI Multi-Agent Architecture Engine</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">LangGraph stateful workflow execution visualizer</p>
        </div>
        <span className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono">
          LangGraph DAG: Active
        </span>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsList.map((ag) => {
          const run = agentRuns.find(r => r.agent_id === ag.id);
          const isCompleted = true; // All seeded as complete for portfolio demo
          return (
            <div key={ag.id} className="p-4 bg-[#111820] border border-[#202833] rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-[#202833] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ag.icon}</span>
                    <h3 className="font-bold text-xs text-slate-100">{ag.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  {run?.summary || ag.defaultSummary}
                </p>
              </div>

              <div className="pt-2 border-t border-[#202833] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Duration: {run ? `${run.duration_ms}ms` : ag.duration}</span>
                <span>Incident: INC-1042</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
