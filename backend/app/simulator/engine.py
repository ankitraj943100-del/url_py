import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.service import Service
from app.models.telemetry import ServiceMetric, LogRecord, TraceSpan, Deployment
from app.models.incident import Incident, IncidentEvent

class TelemetrySimulator:
    def __init__(self):
        self.active_scenario: Optional[str] = None
        self.scenario_started_at: Optional[datetime] = None
        self.target_service_name: str = "payment-api"

    async def inject_failure(self, db: AsyncSession, scenario: str, target_service: str = "payment-api") -> Dict[str, Any]:
        """Injects a failure scenario into the telemetry simulation."""
        self.active_scenario = scenario
        self.scenario_started_at = datetime.now(timezone.utc)
        self.target_service_name = target_service

        # 1. Get service
        res = await db.execute(select(Service).where(Service.name == target_service))
        service = res.scalars().first()
        if not service:
            raise ValueError(f"Service {target_service} not found")

        # 2. Update service status
        service.status = "critical" if scenario in ["db_connection_exhaustion", "deployment_regression"] else "degraded"
        
        # Scenario metrics config
        if scenario == "db_connection_exhaustion":
            service.error_rate = 38.2
            service.p95_latency_ms = 4820.0
            service.cpu_utilization = 91.0
            service.memory_utilization = 84.0
            service.active_alerts = 3
            db_conn = 497
            title = "Payment API degradation — DB connection pool exhaustion"
        elif scenario == "cpu_spike":
            service.error_rate = 14.5
            service.p95_latency_ms = 2100.0
            service.cpu_utilization = 98.4
            service.memory_utilization = 62.0
            service.active_alerts = 2
            db_conn = 120
            title = "Payment API high CPU utilization breach (> 95%)"
        elif scenario == "redis_failure":
            service.error_rate = 24.1
            service.p95_latency_ms = 3100.0
            service.cpu_utilization = 55.0
            service.memory_utilization = 78.0
            service.active_alerts = 2
            db_conn = 95
            title = "Redis connection timeouts causing auth session fallback failures"
        else: # deployment_regression or latency
            service.error_rate = 32.8
            service.p95_latency_ms = 4120.0
            service.cpu_utilization = 88.0
            service.memory_utilization = 79.0
            service.active_alerts = 3
            db_conn = 460
            title = "Deployment regression payment-service v2.4.1 causing elevated 5xx errors"

        # 3. Insert deployment event if deployment_regression or db_connection_exhaustion
        deploy_time = self.scenario_started_at - timedelta(minutes=4)
        deployment = Deployment(
            service_id=service.id,
            service_name=service.name,
            version="v2.4.1",
            git_sha="9f8a3c1",
            deployed_by="CI/CD Pipeline (GitHub Actions)",
            deployed_at=deploy_time,
            changelog="Updated payment retry logic and async DB session handler.",
            config_changes_json={"max_db_pool": 50, "statement_timeout_ms": 30000}
        )
        db.add(deployment)

        # 4. Check if incident INC-1042 already exists or create new
        inc_res = await db.execute(select(Incident).where(Incident.id == "INC-1042"))
        incident = inc_res.scalars().first()
        if not incident:
            incident = Incident(
                id="INC-1042",
                title=title,
                service_id=service.id,
                service_name=service.name,
                severity="critical",
                status="open",
                error_rate=service.error_rate,
                p95_latency_ms=service.p95_latency_ms,
                affected_users=14200,
                detected_at=self.scenario_started_at,
                root_cause_summary=None,
                confidence_level=None
            )
            db.add(incident)
        else:
            incident.status = "open"
            incident.error_rate = service.error_rate
            incident.p95_latency_ms = service.p95_latency_ms
            incident.detected_at = self.scenario_started_at
            incident.resolved_at = None

        # 5. Add initial timeline events
        events = [
            IncidentEvent(
                incident_id="INC-1042",
                timestamp=deploy_time,
                event_type="deployment_executed",
                title="Deployment v2.4.1 executed",
                message="payment-service v2.4.1 deployed to production cluster by GitHub Actions pipeline.",
                source="ci_cd"
            ),
            IncidentEvent(
                incident_id="INC-1042",
                timestamp=self.scenario_started_at - timedelta(minutes=2),
                event_type="metric_anomaly",
                title="Database connection spike detected",
                message="DB connections on payment-api increased rapidly from 82 to 497 connections.",
                source="prometheus"
            ),
            IncidentEvent(
                incident_id="INC-1042",
                timestamp=self.scenario_started_at,
                event_type="alert_triggered",
                title="Critical Alert: High 5xx error rate",
                message="payment-api error rate breached threshold (38.2% > 2.0%). SentinelOps AI incident created.",
                source="alert_manager"
            )
        ]
        for ev in events:
            db.add(ev)

        # 6. Generate failure log entries with trace IDs
        trace_id = "tr-8901249-payment"
        error_logs = [
            LogRecord(
                service_id=service.id,
                service_name=service.name,
                level="ERROR",
                message="sqlalchemy.exc.TimeoutError: QueuePool limit of size 50 overflow 10 reached, cannot get connection from pool",
                trace_id=trace_id,
                span_id="sp-101",
                attributes_json={"exception": "TimeoutError", "pool_size": 50, "active_conn": 497}
            ),
            LogRecord(
                service_id=service.id,
                service_name=service.name,
                level="ERROR",
                message="POST /api/payment - 500 Internal Server Error (Duration: 4821ms)",
                trace_id=trace_id,
                span_id="sp-100",
                attributes_json={"status_code": 500, "duration_ms": 4821.0}
            ),
            LogRecord(
                service_id=service.id,
                service_name=service.name,
                level="FATAL",
                message="psycopg2.OperationalError: FATAL: remaining connection slots are reserved for non-replication superuser connections",
                trace_id=trace_id,
                span_id="sp-102",
                attributes_json={"db_host": "postgres-db:5432"}
            )
        ]
        for lg in error_logs:
            db.add(lg)

        # 7. Generate trace span waterfall
        spans = [
            TraceSpan(
                trace_id=trace_id,
                span_id="sp-root",
                parent_span_id=None,
                service_id=service.id,
                service_name="api-gateway",
                operation_name="POST /api/payment",
                start_time=self.scenario_started_at,
                duration_ms=4820.0,
                status_code="ERROR",
                http_method="POST",
                http_path="/api/payment",
                error_message="HTTP 500 Internal Server Error"
            ),
            TraceSpan(
                trace_id=trace_id,
                span_id="sp-100",
                parent_span_id="sp-root",
                service_id=service.id,
                service_name="payment-api",
                operation_name="process_checkout",
                start_time=self.scenario_started_at + timedelta(milliseconds=10),
                duration_ms=4810.0,
                status_code="ERROR",
                http_method="POST",
                http_path="/v1/checkout",
                error_message="Database pool exhaustion timeout"
            ),
            TraceSpan(
                trace_id=trace_id,
                span_id="sp-101",
                parent_span_id="sp-100",
                service_id=service.id,
                service_name="postgres-db",
                operation_name="acquire_connection_pool",
                start_time=self.scenario_started_at + timedelta(milliseconds=15),
                duration_ms=4790.0,
                status_code="ERROR",
                error_message="QueuePool limit overflow"
            )
        ]
        for sp in spans:
            db.add(sp)

        # 8. Record telemetry snapshot point
        metric_snapshot = ServiceMetric(
            service_id=service.id,
            service_name=service.name,
            timestamp=self.scenario_started_at,
            cpu_utilization=service.cpu_utilization,
            memory_utilization=service.memory_utilization,
            request_rate=service.request_rate,
            error_rate=service.error_rate,
            p95_latency_ms=service.p95_latency_ms,
            db_connections=db_conn,
            active_alerts=service.active_alerts
        )
        db.add(metric_snapshot)

        await db.commit()
        return {
            "status": "failure_injected",
            "scenario": scenario,
            "incident_id": "INC-1042",
            "service": target_service,
            "metrics": {
                "error_rate": service.error_rate,
                "p95_latency_ms": service.p95_latency_ms,
                "db_connections": db_conn,
                "cpu_utilization": service.cpu_utilization
            }
        }

    async def recover(self, db: AsyncSession, target_service: str = "payment-api") -> Dict[str, Any]:
        """Resets telemetry back to healthy state after successful remediation."""
        self.active_scenario = None
        
        res = await db.execute(select(Service).where(Service.name == target_service))
        service = res.scalars().first()
        if service:
            service.status = "healthy"
            service.error_rate = 0.2
            service.p95_latency_ms = 185.0
            service.cpu_utilization = 34.0
            service.memory_utilization = 48.0
            service.active_alerts = 0

            # Record healthy metric snapshot
            metric_snapshot = ServiceMetric(
                service_id=service.id,
                service_name=service.name,
                timestamp=datetime.now(timezone.utc),
                cpu_utilization=34.0,
                memory_utilization=48.0,
                request_rate=120.0,
                error_rate=0.2,
                p95_latency_ms=185.0,
                db_connections=74,
                active_alerts=0
            )
            db.add(metric_snapshot)

        # Mark incident resolved
        inc_res = await db.execute(select(Incident).where(Incident.id == "INC-1042"))
        incident = inc_res.scalars().first()
        if incident:
            incident.status = "resolved"
            incident.resolved_at = datetime.now(timezone.utc)

            resolved_event = IncidentEvent(
                incident_id="INC-1042",
                timestamp=datetime.now(timezone.utc),
                event_type="incident_resolved",
                title="Incident Resolved — Recovery Verified",
                message="Verification Agent confirmed metrics normalized for 3 consecutive cycles (Error rate: 0.2%, Latency: 185ms).",
                source="verification_agent"
            )
            db.add(resolved_event)

        await db.commit()
        return {"status": "recovered", "service": target_service}

simulator_engine = TelemetrySimulator()
