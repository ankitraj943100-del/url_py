import { Service, Incident, IncidentEvent, Agent, AgentRun, Remediation, LogRecord, TraceSpan, KnowledgeDocument, Postmortem } from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  getDashboardSummary: () => fetchJSON<any>('/dashboard/summary'),

  getIncidents: (params?: { severity?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return fetchJSON<Incident[]>(`/incidents?${query.toString()}`);
  },

  getIncidentDetails: (id: string) => fetchJSON<{
    incident: Incident;
    events: IncidentEvent[];
    agent_runs: AgentRun[];
    remediation?: Remediation;
  }>(`/incidents/${id}`),

  triggerInvestigation: (id: string) => fetchJSON<any>(`/incidents/${id}/investigate`, { method: 'POST' }),

  getServices: () => fetchJSON<Service[]>('/services'),
  getServiceMetrics: (id: string) => fetchJSON<any[]>(`/services/${id}/metrics`),

  getLogs: (params?: { service?: string; level?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.service) query.append('service', params.service);
    if (params?.level) query.append('level', params.level);
    if (params?.search) query.append('search', params.search);
    return fetchJSON<LogRecord[]>(`/logs?${query.toString()}`);
  },

  getTraceWaterfall: (traceId: string) => fetchJSON<{
    trace_id: string;
    total_duration_ms: number;
    service_count: number;
    services: string[];
    root_span: TraceSpan;
    spans: TraceSpan[];
  }>(`/traces/${traceId}`),

  getAgents: () => fetchJSON<Agent[]>('/agents'),
  getAgentRuns: (incidentId: string = 'INC-1042') => fetchJSON<AgentRun[]>(`/agents/runs?incident_id=${incidentId}`),

  approveRemediation: (id: string) => fetchJSON<any>(`/remediations/${id}/approve`, { method: 'POST' }),
  rejectRemediation: (id: string) => fetchJSON<any>(`/remediations/${id}/reject`, { method: 'POST' }),

  injectSimulator: (scenario: string, targetService: string = 'payment-api') =>
    fetchJSON<any>('/simulator/inject', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_service: targetService })
    }),

  resetSimulator: () => fetchJSON<any>('/simulator/reset', { method: 'POST' }),

  getReplay: (incidentId: string = 'INC-1042') => fetchJSON<any>(`/replay/${incidentId}`),

  getPostmortems: () => fetchJSON<Postmortem[]>('/postmortems'),
  getPostmortem: (incidentId: string) => fetchJSON<Postmortem>(`/postmortems/${incidentId}`),
  generatePostmortem: (incidentId: string = 'INC-1042') =>
    fetchJSON<Postmortem>(`/postmortems/generate?incident_id=${incidentId}`, { method: 'POST' }),

  getKnowledgeDocuments: () => fetchJSON<KnowledgeDocument[]>('/knowledge'),

  chatCopilot: (message: string, incidentId: string = 'INC-1042') =>
    fetchJSON<any>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, incident_id: incidentId })
    })
};
