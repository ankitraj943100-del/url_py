from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AlertPayload(BaseModel):
    incident_id: str
    service_name: str
    severity: str
    triggered_at: str
    metric_name: str = "error_rate"
    metric_value: float = 38.2
    threshold: float = 2.0

class LogEvidence(BaseModel):
    total_logs_analyzed: int = 14283
    error_count: int = 327
    top_exceptions: List[str] = [
        "sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached",
        "psycopg2.OperationalError: FATAL: remaining connection slots reserved"
    ]
    sample_error_logs: List[Dict[str, Any]] = []
    correlated_trace_ids: List[str] = ["tr-8901249-payment"]

class MetricEvidence(BaseModel):
    baseline_cpu: float = 34.0
    incident_cpu: float = 91.0
    baseline_latency_ms: float = 210.0
    incident_latency_ms: float = 4820.0
    baseline_error_rate: float = 0.2
    incident_error_rate: float = 38.2
    baseline_db_connections: int = 82
    incident_db_connections: int = 497
    anomaly_detected: bool = True

class TraceEvidence(BaseModel):
    failing_spans: List[Dict[str, Any]] = []
    root_failing_service: str = "postgres-db"
    bottleneck_operation: str = "acquire_connection_pool"
    avg_span_delay_ms: float = 4790.0

class DeploymentEvidence(BaseModel):
    deployment_found: bool = True
    version: str = "v2.4.1"
    deployed_at: str = "14:19 UTC"
    time_delta_minutes: int = 2
    git_sha: str = "9f8a3c1"

class RAGDocumentRef(BaseModel):
    id: str
    title: str
    document_type: str
    relevance_score: float
    content_snippet: str

class RootCauseHypothesis(BaseModel):
    summary: str = "Database connection pool exhaustion following deployment payment-service v2.4.1."
    confidence_level: str = "High confidence"
    raw_confidence: float = 0.91
    evidence_bullets: List[str] = [
        "DB connections increased from 82 → 497 (6.1x spike)",
        "API latency increased 22.9x (210ms → 4.8s)",
        "5xx HTTP responses increased 191x (0.2% → 38.2%)",
        "Spike began 2 minutes after deployment payment-service v2.4.1",
        "Application logs contain QueuePool timeout errors"
    ]

class RemediationPlan(BaseModel):
    remediation_id: str = "rem-9021"
    title: str = "Roll back payment-service to v2.4.0 and recycle pod pool"
    action_type: str = "rollback_deployment"
    risk_level: str = "high"
    description: str = "Rolls back payment-service deployment from v2.4.1 to previous stable v2.4.0 release and restarts pods."
    steps: List[str] = [
        "1. Reduce connection concurrency",
        "2. Roll back payment-service v2.4.1 to v2.4.0",
        "3. Restart affected payment-api pods",
        "4. Verify error rate for 5 minutes"
    ]

class IncidentState(BaseModel):
    incident_id: str
    service_name: str = "payment-api"
    severity: str = "critical"
    alert: AlertPayload
    
    # Telemetry outputs
    log_evidence: Optional[LogEvidence] = None
    metric_evidence: Optional[MetricEvidence] = None
    trace_evidence: Optional[TraceEvidence] = None
    deployment_evidence: Optional[DeploymentEvidence] = None
    
    # Derived outputs
    temporal_correlation: Optional[Dict[str, Any]] = None
    retrieved_documents: List[RAGDocumentRef] = Field(default_factory=list)
    root_cause: Optional[RootCauseHypothesis] = None
    remediation_plan: Optional[RemediationPlan] = None
    
    # Safety & Approval Gate
    requires_human_approval: bool = True
    approval_status: str = "pending" # 'pending', 'approved', 'rejected'
    
    # Verification & Resolution
    recovery_verified: bool = False
    postmortem_markdown: Optional[str] = None
    workflow_status: str = "running"
    completed_agent_ids: List[str] = Field(default_factory=list)
