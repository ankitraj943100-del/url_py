import { Service, Incident, IncidentEvent, Agent, AgentRun, Remediation, LogRecord, TraceSpan, KnowledgeDocument, Postmortem } from '../types';
import {
  MOCK_SERVICES,
  MOCK_INCIDENT,
  MOCK_RESOLVED_INCIDENT,
  MOCK_INCIDENT_EVENTS,
  MOCK_REMEDIATION,
  MOCK_AGENTS,
  MOCK_AGENT_RUNS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_LOGS,
  MOCK_TRACE_WATERFALL,
  MOCK_REPLAY,
  MOCK_POSTMORTEM,
  MOCK_KNOWLEDGE_DOCUMENTS
} from './mockData';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

async function fetchJSON<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    if (!res.ok) {
      if (fallback !== undefined) {
        return fallback;
      }
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  getDashboardSummary: () =>
    fetchJSON<any>('/dashboard/summary', undefined, MOCK_DASHBOARD_SUMMARY),

  getIncidents: (params?: { severity?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    let incidentsList = [MOCK_INCIDENT, MOCK_RESOLVED_INCIDENT];
    if (params?.severity && params.severity !== 'all') {
      incidentsList = incidentsList.filter(i => i.severity === params.severity);
    }
    if (params?.status && params.status !== 'all') {
      incidentsList = incidentsList.filter(i => i.status === params.status);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      incidentsList = incidentsList.filter(i => i.id.toLowerCase().includes(s) || i.title.toLowerCase().includes(s));
    }

    return fetchJSON<Incident[]>(`/incidents?${query.toString()}`, undefined, incidentsList);
  },

  getIncidentDetails: (id: string) => {
    const fallbackDetails = {
      incident: MOCK_INCIDENT,
      events: MOCK_INCIDENT_EVENTS,
      agent_runs: MOCK_AGENT_RUNS,
      remediation: MOCK_REMEDIATION
    };
    return fetchJSON<{
      incident: Incident;
      events: IncidentEvent[];
      agent_runs: AgentRun[];
      remediation?: Remediation;
    }>(`/incidents/${id}`, undefined, fallbackDetails);
  },

  triggerInvestigation: (id: string) =>
    fetchJSON<any>(`/incidents/${id}/investigate`, { method: 'POST' }, {
      status: 'started',
      message: 'LangGraph multi-agent investigation successfully triggered',
      incident_id: id
    }),

  getServices: () =>
    fetchJSON<Service[]>('/services', undefined, MOCK_SERVICES),

  getServiceMetrics: (id: string) => {
    const now = Date.now();
    const fallbackMetrics = Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(now - (30 - i) * 60000).toISOString(),
      request_rate: 320 + Math.sin(i / 2) * 40,
      error_rate: i > 20 ? 38.2 : 0.2,
      latency_p95: i > 20 ? 4820 : 210,
      cpu_percent: i > 20 ? 91.0 : 34.0,
      memory_percent: 88.0,
      active_connections: i > 20 ? 497 : 82
    }));
    return fetchJSON<any[]>(`/services/${id}/metrics`, undefined, fallbackMetrics);
  },

  getLogs: (params?: { service?: string; level?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.service) query.append('service', params.service);
    if (params?.level) query.append('level', params.level);
    if (params?.search) query.append('search', params.search);

    let logs = [...MOCK_LOGS];
    if (params?.service && params.service !== 'all') {
      logs = logs.filter(l => l.service_name === params.service);
    }
    if (params?.level && params.level !== 'all') {
      logs = logs.filter(l => l.level === params.level);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      logs = logs.filter(l => l.message.toLowerCase().includes(s));
    }

    return fetchJSON<LogRecord[]>(`/logs?${query.toString()}`, undefined, logs);
  },

  getTraceWaterfall: (traceId: string) =>
    fetchJSON<{
      trace_id: string;
      total_duration_ms: number;
      service_count: number;
      services: string[];
      root_span: TraceSpan;
      spans: TraceSpan[];
    }>(`/traces/${traceId}`, undefined, MOCK_TRACE_WATERFALL),

  getAgents: () =>
    fetchJSON<Agent[]>('/agents', undefined, MOCK_AGENTS),

  getAgentRuns: (incidentId: string = 'INC-1042') =>
    fetchJSON<AgentRun[]>(`/agents/runs?incident_id=${incidentId}`, undefined, MOCK_AGENT_RUNS),

  approveRemediation: (id: string) =>
    fetchJSON<any>(`/remediations/${id}/approve`, { method: 'POST' }, {
      status: 'approved',
      message: 'Remediation action approved by operator and scheduled for automated execution'
    }),

  rejectRemediation: (id: string) =>
    fetchJSON<any>(`/remediations/${id}/reject`, { method: 'POST' }, {
      status: 'rejected',
      message: 'Remediation plan rejected by operator'
    }),

  injectSimulator: (scenario: string, targetService: string = 'payment-api') =>
    fetchJSON<any>('/simulator/inject', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_service: targetService })
    }, {
      status: 'injected',
      scenario,
      target_service: targetService,
      incident_id: 'INC-1042'
    }),

  resetSimulator: () =>
    fetchJSON<any>('/simulator/reset', { method: 'POST' }, {
      status: 'reset',
      message: 'Simulator state reset successfully to healthy production baseline'
    }),

  getReplay: (incidentId: string = 'INC-1042') =>
    fetchJSON<any>(`/replay/${incidentId}`, undefined, MOCK_REPLAY),

  getPostmortems: () =>
    fetchJSON<Postmortem[]>('/postmortems', undefined, [MOCK_POSTMORTEM]),

  getPostmortem: (incidentId: string) =>
    fetchJSON<Postmortem>(`/postmortems/${incidentId}`, undefined, MOCK_POSTMORTEM),

  generatePostmortem: (incidentId: string = 'INC-1042') =>
    fetchJSON<Postmortem>(`/postmortems/generate?incident_id=${incidentId}`, { method: 'POST' }, MOCK_POSTMORTEM),

  getKnowledgeDocuments: () =>
    fetchJSON<KnowledgeDocument[]>('/knowledge', undefined, MOCK_KNOWLEDGE_DOCUMENTS),

  chatCopilot: (message: string, incidentId: string = 'INC-1042') =>
    fetchJSON<any>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, incident_id: incidentId })
    }, {
      answer: `Analyzing incident ${incidentId}: Database connection pool exhaustion on payment-api was introduced by deployment v2.4.1 (commit 9f8a3c1). Root Cause Agent reports 94% confidence. Recommended remediation is to rollback to v2.4.0 and recycle pods.`,
      sources: [
        'Runbook: Payment API Connection Pool Sizing',
        'Postmortem: INC-1042 Analysis',
        'Deployment Record: payment-service:v2.4.1'
      ]
    })
};
