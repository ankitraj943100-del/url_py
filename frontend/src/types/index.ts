export interface Service {
  id: string;
  name: string;
  display_name: string;
  environment: string;
  status: 'healthy' | 'degraded' | 'warning' | 'critical';
  owner_team: string;
  repository_url?: string;
  description?: string;
  tier: string;
  request_rate: number;
  error_rate: number;
  p95_latency_ms: number;
  cpu_utilization: number;
  memory_utilization: number;
  active_alerts: number;
}

export interface Incident {
  id: string;
  title: string;
  service_id: string;
  service_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'remediating' | 'verifying' | 'resolved' | 'closed';
  error_rate: number;
  p95_latency_ms: number;
  affected_users: number;
  root_cause_summary?: string;
  confidence_level?: string;
  evidence_json?: string[];
  assigned_to?: string;
  detected_at: string;
  resolved_at?: string;
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  event_type: string;
  title: string;
  message: string;
  source: string;
  metadata_json?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export interface AgentRun {
  id: string;
  incident_id: string;
  agent_id: string;
  agent_name: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_approval';
  duration_ms: number;
  summary?: string;
  output_json?: Record<string, any>;
}

export interface Remediation {
  id: string;
  incident_id: string;
  title: string;
  action_type: string;
  description: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  details_json?: {
    steps?: string[];
  };
  approved_by?: string;
  approved_at?: string;
  executed_at?: string;
}

export interface LogRecord {
  id: string;
  service_id: string;
  service_name: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  trace_id?: string;
  span_id?: string;
  attributes_json?: Record<string, any>;
}

export interface TraceSpan {
  id: string;
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  service_id: string;
  service_name: string;
  operation_name: string;
  start_time: string;
  duration_ms: number;
  status_code: 'OK' | 'ERROR';
  http_method?: string;
  http_path?: string;
  error_message?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  document_type: 'runbook' | 'architecture' | 'postmortem' | 'doc';
  service_name?: string;
  content: string;
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface Postmortem {
  id: string;
  incident_id: string;
  title: string;
  summary: string;
  impact_analysis: string;
  timeline_markdown: string;
  root_cause_analysis: string;
  contributing_factors: string;
  resolution_steps: string;
  preventive_actions: Array<{ action: string; owner: string; status: string }>;
  lessons_learned?: string;
  created_at: string;
}
