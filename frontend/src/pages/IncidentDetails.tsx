import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  GitCommit,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  FileText,
  BookOpen,
  ArrowUpRight,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Incident, IncidentEvent, AgentRun, Remediation } from '../types';

export const IncidentDetails: React.FC = () => {
  const { id = 'INC-1042' } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [remediation, setRemediation] = useState<Remediation | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'metrics' | 'traces' | 'runbooks'>('overview');
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [approvalProcessing, setApprovalProcessing] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getIncidentDetails(id);
      setIncident(data.incident);
      setEvents(data.events);
      setAgentRuns(data.agent_runs);
      setRemediation(data.remediation || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRunInvestigation = async () => {
    setInvestigating(true);
    try {
      await api.triggerInvestigation(id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setInvestigating(false);
    }
  };

  const handleApproveRemediation = async () => {
    if (!remediation) return;
    setApprovalProcessing(true);
    try {
      await api.approveRemediation(remediation.id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalProcessing(false);
    }
  };

  if (loading || !incident) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-[#111820] rounded w-64 animate-pulse" />
        <div className="h-64 bg-[#111820] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#202833] pb-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2.5 rounded-xl bg-[#111820] border border-[#202833] text-slate-400 hover:text-slate-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                🔴 {incident.id}
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">{incident.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                CRITICAL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-4">
              <span>Service: <strong className="text-slate-200">{incident.service_name}</strong></span>
              <span>Detected: <strong className="text-slate-200">{new Date(incident.detected_at).toLocaleTimeString()}</strong></span>
              <span>Affected users: <strong className="text-slate-200">~{incident.affected_users.toLocaleString()}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunInvestigation}
            disabled={investigating}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${investigating ? 'animate-spin text-blue-200' : ''}`} />
            <span>{investigating ? 'Running Multi-Agent Engine...' : 'Re-Run AI Investigation'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#202833] pb-1 font-mono text-xs">
        {[
          { id: 'overview', label: 'AI Evidence & Root Cause', icon: ShieldCheck },
          { id: 'logs', label: 'Correlated Logs', icon: FileText },
          { id: 'metrics', label: 'Telemetry Metrics', icon: Activity },
          { id: 'traces', label: 'Distributed Traces', icon: GitCommit },
          { id: 'runbooks', label: 'SRE Runbooks (RAG)', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-600/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111820]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left = Investigation & Evidence (2 cols), Right = Incident Timeline (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* TAB 1: OVERVIEW & ROOT CAUSE */}
          {activeTab === 'overview' && (
            <>
              {/* AI Multi-Agent Workflow State Panel */}
              <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#202833] pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                      LangGraph Multi-Agent Orchestration
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    ✓ 8 Agents Completed
                  </span>
                </div>

                {/* Agent Progress Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    { name: 'Alert Analyzer', status: 'done', duration: '1.2s' },
                    { name: 'Log Investigator', status: 'done', duration: '1.8s' },
                    { name: 'Metrics Agent', status: 'done', duration: '1.4s' },
                    { name: 'Trace Investigator', status: 'done', duration: '1.6s' },
                    { name: 'Correlation Agent', status: 'done', duration: '1.3s' },
                    { name: 'RAG Knowledge', status: 'done', duration: '1.1s' },
                    { name: 'Root Cause Agent', status: 'done', duration: '1.5s' },
                    { name: 'Remediation Agent', status: remediation?.status === 'executed' ? 'done' : 'approval', duration: '1.7s' }
                  ].map((ag, i) => (
                    <div key={i} className="p-3 bg-[#0B0F14] border border-[#202833] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-200 text-[11px]">{ag.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{ag.duration}</p>
                      </div>
                      {ag.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Probable Root Cause Card */}
              <div className="p-6 bg-[#111820] border border-blue-500/30 rounded-xl space-y-4 glow-blue">
                <div className="flex items-center justify-between border-b border-[#202833] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Probable Root Cause Analysis</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold font-mono shadow-sm">
                    {incident.confidence_level || 'High confidence (0.91)'}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-100 leading-snug">
                  {incident.root_cause_summary || 'Database connection pool exhaustion following deployment payment-service v2.4.1.'}
                </p>

                {/* Empirical Evidence List */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Empirical Telemetry Evidence (5 Matches)
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      '✓ DB connections increased from 82 → 497 (6.1x spike)',
                      '✓ API p95 latency increased 22.9x (210ms → 4.82s)',
                      '✓ 5xx HTTP responses increased 191x (0.2% → 38.2%)',
                      '✓ Anomaly began 2 minutes after deployment payment-service v2.4.1',
                      '✓ Application logs contained QueuePool connection timeout errors'
                    ].map((ev, i) => (
                      <div key={i} className="p-2.5 bg-[#0B0F14] border border-[#202833] rounded-lg text-slate-300 flex items-center justify-between">
                        <span>{ev}</span>
                        <span className="text-[10px] text-blue-400 font-bold">Correlated</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment Correlation Card */}
                <div className="p-3.5 bg-[#0B0F14] border border-[#202833] rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <GitCommit className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-100">payment-service v2.4.1</p>
                      <p className="text-[10px] text-slate-500">Deployed 14:19 UTC · Git SHA: 9f8a3c1</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20 font-bold">
                    Temporal Correlation (2 min delta)
                  </span>
                </div>
              </div>

              {/* HUMAN APPROVAL & REMEDIATION CALLOUT */}
              {remediation && (
                <div className={`p-6 rounded-xl border space-y-4 ${
                  remediation.status === 'executed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 glow-emerald'
                    : 'bg-amber-950/20 border-amber-500/40 glow-amber'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                        Proposed Remediation Plan
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ⚠️ Risk Level: HIGH
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-100">{remediation.title}</p>
                    <p className="text-xs text-slate-300">{remediation.description}</p>

                    <div className="p-3.5 bg-[#0B0F14] rounded-xl border border-[#202833] space-y-1.5 font-mono text-xs text-slate-300">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Execution Steps:</p>
                      <p className="text-slate-200">1. Reduce connection concurrency on API gateway</p>
                      <p className="text-slate-200">2. Roll back payment-service deployment v2.4.1 → v2.4.0</p>
                      <p className="text-slate-200">3. Recycle 4 affected payment-api pod replicas</p>
                      <p className="text-slate-200">4. Verify error rate drops below 0.5% for 5 minutes</p>
                    </div>
                  </div>

                  {/* Approval Action Buttons */}
                  <div className="pt-2">
                    {remediation.status === 'executed' ? (
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>Approved & Executed by {remediation.approved_by || 'Ankit (SRE Lead)'}. Verification Agent confirmed metric recovery.</span>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#0B0F14] rounded-xl border border-amber-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Human approval required: This action will undo production pod deployment v2.4.1.</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={handleApproveRemediation}
                            disabled={approvalProcessing}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
                          >
                            <Zap className="w-4 h-4" />
                            <span>{approvalProcessing ? 'Executing Rollback...' : 'Approve Rollback'}</span>
                          </button>
                          <button className="px-4 py-2.5 rounded-xl bg-[#1A232E] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700">
                            Reject
                          </button>
                          <button className="px-4 py-2.5 rounded-xl bg-[#1A232E] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700">
                            Modify Plan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: CORRELATED LOGS */}
          {activeTab === 'logs' && (
            <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Correlated Error Log Stream</h3>
              <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#202833] space-y-2 text-rose-300">
                <p>[14:23:12 UTC] ERROR payment-api - sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached</p>
                <p>[14:23:14 UTC] FATAL postgres-db - psycopg2.OperationalError: FATAL: remaining connection slots reserved</p>
                <p>[14:23:18 UTC] ERROR api-gateway - POST /api/payment - 500 Internal Server Error (Duration: 4821ms)</p>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY METRICS */}
          {activeTab === 'metrics' && (
            <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Incident Telemetry Snapshot</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#202833]">
                  <span className="text-slate-500 block">Error Rate</span>
                  <span className="text-xl font-bold text-rose-400">38.2% (Baseline: 0.2%)</span>
                </div>
                <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#202833]">
                  <span className="text-slate-500 block">p95 Latency</span>
                  <span className="text-xl font-bold text-amber-400">4,820ms (Baseline: 210ms)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRACES */}
          {activeTab === 'traces' && (
            <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Trace Waterfall (Trace ID: tr-8901249-payment)</h3>
              <div className="p-3 bg-[#0B0F14] rounded-lg border border-[#202833] space-y-2">
                <div className="flex justify-between text-blue-400 font-bold">
                  <span>POST /api/payment (api-gateway)</span>
                  <span>4,820ms</span>
                </div>
                <div className="pl-4 flex justify-between text-rose-400 font-bold">
                  <span>process_checkout (payment-api)</span>
                  <span>4,810ms</span>
                </div>
                <div className="pl-8 flex justify-between text-amber-400 font-bold">
                  <span>acquire_connection_pool (postgres-db)</span>
                  <span>4,790ms</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RUNBOOKS */}
          {activeTab === 'runbooks' && (
            <div className="p-5 bg-[#111820] border border-[#202833] rounded-xl space-y-3 font-mono text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Retrieved Runbook: DB-POOL-003</h3>
              <p className="text-slate-300">Runbook for database connection pool exhaustion. Specifies undoing recent rollouts and restarting saturated application pods.</p>
            </div>
          )}

        </div>

        {/* Right Column: Chronological Incident Timeline */}
        <div className="bg-[#111820] border border-[#202833] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202833] pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Incident Timeline
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{events.length} Events</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#202833]">
            {events.map((ev, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#111820]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{ev.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ev.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
