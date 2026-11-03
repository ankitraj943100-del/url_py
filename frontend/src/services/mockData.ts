import { Service, Incident, IncidentEvent, Agent, AgentRun, Remediation, LogRecord, TraceSpan, KnowledgeDocument, Postmortem } from '../types';

export const MOCK_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'payment-api',
    display_name: 'Payment API',
    environment: 'production',
    status: 'critical',
    owner_team: 'Core Checkout',
    tier: 'tier-1',
    request_rate: 340.0,
    error_rate: 38.2,
    p95_latency_ms: 4820.0,
    cpu_utilization: 91.0,
    memory_utilization: 88.0,
    active_alerts: 3
  },
  {
    id: 'srv-2',
    name: 'api-gateway',
    display_name: 'API Gateway',
    environment: 'production',
    status: 'healthy',
    owner_team: 'Platform Edge',
    tier: 'tier-1',
    request_rate: 850.0,
    error_rate: 0.05,
    p95_latency_ms: 42.0,
    cpu_utilization: 28.0,
    memory_utilization: 40.0,
    active_alerts: 0
  },
  {
    id: 'srv-3',
    name: 'auth-service',
    display_name: 'Auth Service',
    environment: 'production',
    status: 'healthy',
    owner_team: 'Identity & Access',
    tier: 'tier-1',
    request_rate: 420.0,
    error_rate: 0.1,
    p95_latency_ms: 78.0,
    cpu_utilization: 32.0,
    memory_utilization: 45.0,
    active_alerts: 0
  },
  {
    id: 'srv-4',
    name: 'user-service',
    display_name: 'User Service',
    environment: 'production',
    status: 'healthy',
    owner_team: 'Accounts Team',
    tier: 'tier-2',
    request_rate: 290.0,
    error_rate: 0.15,
    p95_latency_ms: 110.0,
    cpu_utilization: 24.0,
    memory_utilization: 36.0,
    active_alerts: 0
  },
  {
    id: 'srv-5',
    name: 'notification-service',
    display_name: 'Notification Service',
    environment: 'production',
    status: 'degraded',
    owner_team: 'Communications',
    tier: 'tier-2',
    request_rate: 180.0,
    error_rate: 3.4,
    p95_latency_ms: 620.0,
    cpu_utilization: 68.0,
    memory_utilization: 75.0,
    active_alerts: 1
  },
  {
    id: 'srv-6',
    name: 'post-service',
    display_name: 'Post Service',
    environment: 'production',
    status: 'healthy',
    owner_team: 'Content Platform',
    tier: 'tier-2',
    request_rate: 510.0,
    error_rate: 0.2,
    p95_latency_ms: 140.0,
    cpu_utilization: 36.0,
    memory_utilization: 48.0,
    active_alerts: 0
  },
  {
    id: 'srv-7',
    name: 'postgres-db',
    display_name: 'PostgreSQL Database',
    environment: 'production',
    status: 'warning',
    owner_team: 'Data Infra',
    tier: 'infrastructure',
    request_rate: 1200.0,
    error_rate: 2.1,
    p95_latency_ms: 890.0,
    cpu_utilization: 84.0,
    memory_utilization: 92.0,
    active_alerts: 1
  },
  {
    id: 'srv-8',
    name: 'redis-cache',
    display_name: 'Redis Cache Cluster',
    environment: 'production',
    status: 'healthy',
    owner_team: 'Data Infra',
    tier: 'infrastructure',
    request_rate: 3400.0,
    error_rate: 0.0,
    p95_latency_ms: 4.5,
    cpu_utilization: 18.0,
    memory_utilization: 30.0,
    active_alerts: 0
  }
];

export const MOCK_INCIDENT: Incident = {
  id: 'INC-1042',
  title: 'Payment API degradation — DB connection pool exhaustion',
  service_id: 'srv-1',
  service_name: 'payment-api',
  severity: 'critical',
  status: 'investigating',
  error_rate: 38.2,
  p95_latency_ms: 4820.0,
  affected_users: 14200,
  detected_at: new Date(Date.now() - 18 * 60000).toISOString(),
  root_cause_summary: 'Database connection pool exhaustion following deployment payment-service v2.4.1.',
  confidence_level: 'High confidence (94%)',
  evidence_json: [
    'DB connections increased from 82 → 497 (6.1x spike)',
    'API latency increased 22.9x (210ms → 4.8s)',
    '5xx HTTP responses increased 191x (0.2% → 38.2%)',
    'Spike began 2 minutes after deployment payment-service v2.4.1',
    'Payment service opened significantly more connections without context manager release'
  ]
};

export const MOCK_RESOLVED_INCIDENT: Incident = {
  id: 'INC-1039',
  title: 'Notification Service webhook retry queue congestion',
  service_id: 'srv-5',
  service_name: 'notification-service',
  severity: 'medium',
  status: 'resolved',
  error_rate: 0.1,
  p95_latency_ms: 120.0,
  affected_users: 480,
  detected_at: new Date(Date.now() - 120 * 60000).toISOString(),
  resolved_at: new Date(Date.now() - 45 * 60000).toISOString(),
  root_cause_summary: 'Downstream webhook endpoint timeout triggered exponential backoff backlog.',
  confidence_level: 'High confidence (98%)'
};

export const MOCK_INCIDENT_EVENTS: IncidentEvent[] = [
  {
    id: 'ev-1',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    event_type: 'alert_detected',
    title: 'Alert detected',
    message: 'Prometheus alert triggered: Payment API error rate > 5%.',
    source: 'alert_manager'
  },
  {
    id: 'ev-2',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 17 * 60000).toISOString(),
    event_type: 'ai_investigation_started',
    title: 'AI investigation started',
    message: 'SentinelOps AI multi-agent LangGraph workflow launched.',
    source: 'orchestrator'
  },
  {
    id: 'ev-3',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 16 * 60000).toISOString(),
    event_type: 'metric_anomaly',
    title: 'Database connection spike detected',
    message: 'DB connections increased from 82 to 497.',
    source: 'metrics_agent'
  },
  {
    id: 'ev-4',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    event_type: 'deployment_correlated',
    title: 'Deployment correlation found',
    message: 'Deployment payment-service v2.4.1 detected 2 minutes prior.',
    source: 'correlation_agent'
  },
  {
    id: 'ev-5',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 13 * 60000).toISOString(),
    event_type: 'hypothesis_generated',
    title: 'Root cause hypothesis generated',
    message: 'High confidence (0.91): DB pool exhaustion after v2.4.1 release.',
    source: 'root_cause_agent'
  },
  {
    id: 'ev-6',
    incident_id: 'INC-1042',
    timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    event_type: 'remediation_proposed',
    title: 'Remediation proposed',
    message: 'Rollback payment-service v2.4.1 -> v2.4.0 and recycle pod pool.',
    source: 'remediation_agent'
  }
];

export const MOCK_REMEDIATION: Remediation = {
  id: 'rem-9021',
  incident_id: 'INC-1042',
  title: 'Roll back payment-service to v2.4.0 and recycle pod pool',
  action_type: 'rollback_deployment',
  description: 'Rolls back payment-service deployment from v2.4.1 to previous stable v2.4.0 release and restarts pods.',
  risk_level: 'high',
  status: 'pending',
  details_json: {
    steps: [
      '1. Reduce connection concurrency',
      '2. Roll back payment-service v2.4.1 to v2.4.0',
      '3. Restart affected payment-api pods',
      '4. Verify error rate for 5 minutes'
    ]
  }
};

export const MOCK_AGENTS: Agent[] = [
  { id: 'ag-1', name: 'Alert Analyzer', type: 'alert', description: 'Parses alerting signals and classifies urgency', status: 'completed' },
  { id: 'ag-2', name: 'Log Investigator', type: 'logs', description: 'Searches cluster logs and extracts stack traces', status: 'completed' },
  { id: 'ag-3', name: 'Metrics Investigator', type: 'metrics', description: 'Analyzes anomalies across CPU, latency & connection pools', status: 'completed' },
  { id: 'ag-4', name: 'Trace Investigator', type: 'traces', description: 'Navigates distributed OpenTelemetry trace waterfalls', status: 'completed' },
  { id: 'ag-5', name: 'Temporal Correlation Agent', type: 'correlation', description: 'Correlates deployment timestamps with anomaly spikes', status: 'completed' },
  { id: 'ag-6', name: 'RAG Knowledge Agent', type: 'rag', description: 'Retrieves relevant SRE runbooks via pgvector embeddings', status: 'completed' },
  { id: 'ag-7', name: 'Root Cause Agent', type: 'root_cause', description: 'Synthesizes agent evidence into scored hypotheses', status: 'completed' },
  { id: 'ag-8', name: 'Remediation Agent', type: 'remediation', description: 'Generates automated rollback and mitigation playbooks', status: 'completed' },
  { id: 'ag-9', name: 'Verification Agent', type: 'verification', description: 'Monitors SLO recovery post-remediation', status: 'running' },
  { id: 'ag-10', name: 'Postmortem Generator', type: 'postmortem', description: 'Generates comprehensive post-incident retrospective', status: 'idle' }
];

export const MOCK_AGENT_RUNS: AgentRun[] = [
  {
    id: 'run-1',
    incident_id: 'INC-1042',
    agent_id: 'ag-1',
    agent_name: 'Alert Analyzer',
    started_at: new Date(Date.now() - 17 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 16.9 * 60000).toISOString(),
    status: 'completed',
    duration_ms: 18,
    summary: 'Detected critical severity breach on Payment API (HTTP 500 rate 38.2% vs threshold 5.0%).'
  },
  {
    id: 'run-2',
    incident_id: 'INC-1042',
    agent_id: 'ag-2',
    agent_name: 'Log Investigator',
    started_at: new Date(Date.now() - 16.8 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 16.5 * 60000).toISOString(),
    status: 'completed',
    duration_ms: 22,
    summary: 'Discovered 420 occurrences of `sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached`.'
  },
  {
    id: 'run-3',
    incident_id: 'INC-1042',
    agent_id: 'ag-3',
    agent_name: 'Metrics Investigator',
    started_at: new Date(Date.now() - 16.8 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 16.4 * 60000).toISOString(),
    status: 'completed',
    duration_ms: 19,
    summary: 'Confirmed DB connection pool saturation (82 -> 497 connections) concurrent with p95 latency surge to 4,820ms.'
  },
  {
    id: 'run-4',
    incident_id: 'INC-1042',
    agent_id: 'ag-5',
    agent_name: 'Temporal Correlation Agent',
    started_at: new Date(Date.now() - 16.2 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 15.9 * 60000).toISOString(),
    status: 'completed',
    duration_ms: 17,
    summary: 'Correlated failure onset precisely 120 seconds after deployment payment-service v2.4.1.'
  },
  {
    id: 'run-5',
    incident_id: 'INC-1042',
    agent_id: 'ag-7',
    agent_name: 'Root Cause Agent',
    started_at: new Date(Date.now() - 15.5 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 15.1 * 60000).toISOString(),
    status: 'completed',
    duration_ms: 31,
    summary: 'Root cause confirmed: async session connection leak in payment-service v2.4.1 checkout loop (0.94 confidence).'
  },
  {
    id: 'run-6',
    incident_id: 'INC-1042',
    agent_id: 'ag-8',
    agent_name: 'Remediation Agent',
    started_at: new Date(Date.now() - 14.8 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 14.5 * 60000).toISOString(),
    status: 'waiting_approval',
    duration_ms: 24,
    summary: 'Formulated plan: Roll back payment-service to v2.4.0 and recycle connection pool. Awaiting human approval.'
  }
];

export const MOCK_DASHBOARD_SUMMARY = {
  kpis: {
    system_uptime: { value: 99.92, previous_value: 99.91, trend: '+0.01%', status: 'healthy' },
    active_incidents: { value: 1, previous_value: 1, trend: '+1 critical', status: 'critical' },
    error_rate: { value: 4.88, previous_value: 0.3, trend: '+4.58%', status: 'critical' },
    p95_latency_ms: { value: 745.2, previous_value: 210.0, trend: '+535.2ms', status: 'warning' },
    total_alerts: { value: 5, previous_value: 1, trend: '+4', status: 'warning' }
  },
  service_health_counts: {
    healthy: 5,
    degraded: 1,
    warning: 1,
    critical: 1
  },
  services: MOCK_SERVICES.map(s => ({
    id: s.id,
    name: s.name,
    display_name: s.display_name,
    status: s.status,
    error_rate: s.error_rate,
    p95_latency_ms: s.p95_latency_ms,
    active_alerts: s.active_alerts
  })),
  active_incidents: [
    {
      id: MOCK_INCIDENT.id,
      title: MOCK_INCIDENT.title,
      service_name: MOCK_INCIDENT.service_name,
      severity: MOCK_INCIDENT.severity,
      status: MOCK_INCIDENT.status,
      error_rate: MOCK_INCIDENT.error_rate,
      p95_latency_ms: MOCK_INCIDENT.p95_latency_ms,
      affected_users: MOCK_INCIDENT.affected_users,
      detected_at: MOCK_INCIDENT.detected_at
    }
  ]
};

export const MOCK_LOGS: LogRecord[] = [
  {
    id: 'log-1',
    service_id: 'srv-1',
    service_name: 'payment-api',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    level: 'ERROR',
    message: 'sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached, connection timed out, timeout 30.00',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-db-001'
  },
  {
    id: 'log-2',
    service_id: 'srv-1',
    service_name: 'payment-api',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    level: 'ERROR',
    message: 'POST /api/payment/checkout failed - 500 Internal Server Error (Duration: 4820ms)',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-root-001'
  },
  {
    id: 'log-3',
    service_id: 'srv-2',
    service_name: 'api-gateway',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    level: 'WARN',
    message: 'Upstream payment-api responded with 500 after 4820ms. Circuit breaker threshold at 78%.',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-gw-001'
  },
  {
    id: 'log-4',
    service_id: 'srv-7',
    service_name: 'postgres-db',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    level: 'WARN',
    message: 'max_connections reached threshold: 497 active sessions out of 500 max configured.',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-db-002'
  },
  {
    id: 'log-5',
    service_id: 'srv-3',
    service_name: 'auth-service',
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    level: 'INFO',
    message: 'JWT Bearer token verification successful for user usr_948210.',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-auth-001'
  }
];

export const MOCK_TRACE_WATERFALL = {
  trace_id: 'tr-8901249-payment',
  total_duration_ms: 4820,
  service_count: 4,
  services: ['api-gateway', 'auth-service', 'payment-api', 'postgres-db'],
  root_span: {
    id: 'sp-gw-001',
    trace_id: 'tr-8901249-payment',
    span_id: 'sp-gw-001',
    service_id: 'srv-2',
    service_name: 'api-gateway',
    operation_name: 'POST /api/v1/checkout',
    start_time: new Date(Date.now() - 10 * 60000).toISOString(),
    duration_ms: 4820,
    status_code: 'ERROR' as const,
    http_method: 'POST',
    http_path: '/api/v1/checkout',
    error_message: '500 Internal Server Error from upstream payment-api'
  },
  spans: [
    {
      id: 'sp-gw-001',
      trace_id: 'tr-8901249-payment',
      span_id: 'sp-gw-001',
      service_id: 'srv-2',
      service_name: 'api-gateway',
      operation_name: 'POST /api/v1/checkout',
      start_time: new Date(Date.now() - 10 * 60000).toISOString(),
      duration_ms: 4820,
      status_code: 'ERROR' as const,
      http_method: 'POST',
      http_path: '/api/v1/checkout',
      error_message: '500 Internal Server Error'
    },
    {
      id: 'sp-auth-001',
      trace_id: 'tr-8901249-payment',
      span_id: 'sp-auth-001',
      parent_span_id: 'sp-gw-001',
      service_id: 'srv-3',
      service_name: 'auth-service',
      operation_name: 'validate_token',
      start_time: new Date(Date.now() - 9.9 * 60000).toISOString(),
      duration_ms: 38,
      status_code: 'OK' as const,
      http_method: 'POST',
      http_path: '/auth/verify'
    },
    {
      id: 'sp-pay-001',
      trace_id: 'tr-8901249-payment',
      span_id: 'sp-pay-001',
      parent_span_id: 'sp-gw-001',
      service_id: 'srv-1',
      service_name: 'payment-api',
      operation_name: 'process_payment',
      start_time: new Date(Date.now() - 9.8 * 60000).toISOString(),
      duration_ms: 4780,
      status_code: 'ERROR' as const,
      http_method: 'POST',
      http_path: '/payment/charge',
      error_message: 'QueuePool timeout: connection starved'
    },
    {
      id: 'sp-db-001',
      trace_id: 'tr-8901249-payment',
      span_id: 'sp-db-001',
      parent_span_id: 'sp-pay-001',
      service_id: 'srv-7',
      service_name: 'postgres-db',
      operation_name: 'acquire_connection',
      start_time: new Date(Date.now() - 9.7 * 60000).toISOString(),
      duration_ms: 4720,
      status_code: 'ERROR' as const,
      error_message: 'Connection pool timeout after 4720ms'
    }
  ]
};

export const MOCK_REPLAY = {
  incident_id: 'INC-1042',
  title: 'Payment API degradation — DB connection pool exhaustion',
  total_steps: 8,
  steps: [
    {
      step: 1,
      timestamp: '14:19 UTC',
      title: 'Deployment v2.4.1 Executed',
      description: 'GitHub Actions pipeline deployed payment-service v2.4.1 into production.',
      metrics: { error_rate: 0.2, latency_ms: 190, db_conn: 82, cpu: 34.0 },
      badge: 'Deployment'
    },
    {
      step: 2,
      timestamp: '14:21 UTC',
      title: 'Database Connection Pool Spike',
      description: 'DB connections on payment-api spiked from 82 to 497 connections.',
      metrics: { error_rate: 2.4, latency_ms: 680, db_conn: 497, cpu: 63.0 },
      badge: 'Anomaly'
    },
    {
      step: 3,
      timestamp: '14:22 UTC',
      title: 'Latency Degraded to 4.8s',
      description: 'p95 latency breached threshold (210ms -> 4820ms). Request queues backing up.',
      metrics: { error_rate: 12.8, latency_ms: 4820, db_conn: 497, cpu: 88.0 },
      badge: 'Latency'
    },
    {
      step: 4,
      timestamp: '14:23 UTC',
      title: '5xx Error Rate Spike & Sentinel Alert',
      description: 'HTTP 500 errors reached 38.2%. Critical alert triggered incident INC-1042.',
      metrics: { error_rate: 38.2, latency_ms: 4820, db_conn: 497, cpu: 91.0 },
      badge: 'Alert'
    },
    {
      step: 5,
      timestamp: '14:24 UTC',
      title: 'AI Investigation Started',
      description: 'LangGraph multi-agent workflow launched parallel telemetry investigations.',
      metrics: { error_rate: 38.2, latency_ms: 4820, db_conn: 497, cpu: 91.0 },
      badge: 'AI Investigation'
    },
    {
      step: 6,
      timestamp: '14:26 UTC',
      title: 'Root Cause Hypothesis & Evidence',
      description: 'Root Cause Agent identified DB pool exhaustion following deployment v2.4.1 (0.94 confidence).',
      metrics: { error_rate: 38.2, latency_ms: 4820, db_conn: 497, cpu: 91.0 },
      badge: 'Root Cause'
    },
    {
      step: 7,
      timestamp: '14:28 UTC',
      title: 'Remediation Proposed & Approved',
      description: 'Remediation Agent proposed rollback to v2.4.0. Operator Ankit approved.',
      metrics: { error_rate: 38.2, latency_ms: 4820, db_conn: 497, cpu: 91.0 },
      badge: 'Approval'
    },
    {
      step: 8,
      timestamp: '14:34 UTC',
      title: 'Incident Resolved & Recovery Verified',
      description: 'Rollback completed. Verification Agent confirmed error rate 0.2% and latency 185ms.',
      metrics: { error_rate: 0.2, latency_ms: 185, db_conn: 74, cpu: 34.0 },
      badge: 'Resolved'
    }
  ]
};

export const MOCK_POSTMORTEM: Postmortem = {
  id: 'pm-1042',
  incident_id: 'INC-1042',
  title: 'INC-1042 Postmortem — Payment API DB Connection Exhaustion',
  summary: 'Payment API experienced elevated HTTP 5xx responses (38.2%) and p95 latency spike (4.82s) due to database connection pool exhaustion triggered by deployment v2.4.1.',
  impact_analysis: 'Approximately 14,200 user checkout transactions were affected over an 18-minute window before automated AI detection and operator-approved rollback.',
  timeline_markdown: `- **14:19 UTC** — GitHub Actions deployed payment-service v2.4.1.
- **14:21 UTC** — Postgres connection pool saturated (82 → 497 connections).
- **14:22 UTC** — API latency spiked from 210ms to 4.82s.
- **14:23 UTC** — 5xx Error rate spiked to 38.2%. Alert triggered.
- **14:24 UTC** — SentinelOps AI multi-agent investigation launched.
- **14:26 UTC** — Root cause hypothesis generated (High confidence 0.94).
- **14:28 UTC** — Remediation rollback approved by SRE Lead Ankit.
- **14:34 UTC** — Verification Agent confirmed recovery (0.2% error rate, 185ms latency).`,
  root_cause_analysis: 'Commit 9f8a3c1 in payment-service v2.4.1 introduced a regression in async database session management by omitting context manager cleanup on checkout retry loops. Concurrency starved the 50-connection pool.',
  contributing_factors: '1. Lack of connection pool acquisition linter in pre-merge CI check.\n2. Inadequate staging load testing for retry edge-cases.',
  resolution_steps: '1. Approved and executed rollback of payment-service from v2.4.1 to v2.4.0.\n2. Recycled Kubernetes payment-api pods to immediately purge dead connections.',
  preventive_actions: [
    { action: 'Add mandatory SQLAlchemy connection pool linter to CI pipeline', owner: 'Platform Team', status: 'In Progress' },
    { action: 'Increase DB connection timeout alerting threshold', owner: 'SRE Team', status: 'Completed' },
    { action: 'Implement automatic connection recycling on pod threshold breach', owner: 'DevOps', status: 'Planned' }
  ],
  lessons_learned: 'SentinelOps AI multi-agent temporal correlation reduced root-cause discovery time from ~25 minutes manual dashboard checking to under 3 minutes.',
  created_at: new Date(Date.now() - 60 * 60000).toISOString()
};

export const MOCK_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'kb-1',
    title: 'Runbook: Payment API Connection Pool Sizing & Troubleshooting',
    document_type: 'runbook',
    service_name: 'payment-api',
    content: `# Payment API Connection Pool Runbook\n\n## Symptoms\n- Elevated HTTP 500 error rates on /api/v1/checkout\n- p95 latency exceeding 3,000ms\n- Logs with 'QueuePool limit of size 50 overflow 10 reached'\n\n## Immediate Mitigation Steps\n1. Check current active database connections via pg_stat_activity.\n2. If connection leak suspected after deployment, trigger rollback.\n3. Restart payment-api deployment pods in rolling batches.\n4. Verify error rate stabilizes below 0.5% over 5 minutes.`,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'kb-2',
    title: 'Runbook: Redis Cluster Sentinel Failover & Memory Pressure',
    document_type: 'runbook',
    service_name: 'redis-cache',
    content: `# Redis Cluster Failover Runbook\n\n## Symptoms\n- Read latency spike on cached sessions\n- Sentinel election alerts in Slack #sre-alerts\n\n## Mitigation Steps\n1. Execute 'redis-cli info replication' on the primary node.\n2. Check evicted_keys and used_memory metrics.\n3. If primary node is unresponsive, confirm sentinel failover promoted replica.`,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'kb-3',
    title: 'Architecture: Multi-Agent SRE Orchestration Pipeline',
    document_type: 'architecture',
    service_name: 'sentinelops-core',
    content: `# SentinelOps AI Core Architecture\n\nSentinelOps AI employs a stateful LangGraph directed acyclic graph (DAG) composed of specialized telemetry agents:\n1. Alert Analyzer\n2. Log Investigator\n3. Metrics Investigator\n4. Trace Investigator\n5. Temporal Correlation Agent\n6. RAG Knowledge Agent\n7. Root Cause Synthesizer\n8. Human-in-the-Loop Remediation Gate`,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  }
];
