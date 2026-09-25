import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.service import Service
from app.models.telemetry import ServiceMetric, LogRecord, TraceSpan, Deployment
from app.models.incident import Incident, IncidentEvent

class TelemetrySimulator:
    def __init__(self):
        self.active_scenario: Optional[str] = None
        self.scenario_started_at: Optional[datetime] = None
        self.target_service_name: str = "payment-api"

    async def inject_custom_failure(
        self,
        db: AsyncSession,
        service_name: str,
        error_rate: float,
        p95_latency: float,
        cpu_util: float,
        db_connections: int,
        custom_error_log: str
    ) -> Dict[str, Any]:
        """Injects a custom user-configured failure scenario."""
        self.active_scenario = f"custom_{service_name}"
        self.scenario_started_at = datetime.now(timezone.utc)
        self.target_service_name = service_name

        res = await db.execute(select(Service).where(Service.name == service_name))
        service = res.scalars().first()
        if not service:
            raise ValueError(f"Service {service_name} not found")

        service.status = "critical"
        service.error_rate = error_rate
        service.p95_latency_ms = p95_latency
        service.cpu_utilization = cpu_util
        service.active_alerts = 3

        # Create Incident
        inc_id = f"INC-{random.randint(1100, 9999)}"
        incident = Incident(
            id=inc_id,
            title=f"Custom Chaos Scenario — {service.display_name} degradation",
            service_id=service.id,
            service_name=service.name,
            severity="critical",
            status="open",
            error_rate=error_rate,
            p95_latency_ms=p95_latency,
            affected_users=random.randint(5000, 25000),
            detected_at=self.scenario_started_at
        )
        db.add(incident)

        # Log Record
        log = LogRecord(
            service_id=service.id,
            service_name=service.name,
            level="ERROR",
            message=custom_error_log,
            trace_id=f"tr-{uuid.uuid4().hex[:8]}"
        )
        db.add(log)

        # Service metric snapshot
        snapshot = ServiceMetric(
            service_id=service.id,
            service_name=service.name,
            timestamp=self.scenario_started_at,
            cpu_utilization=cpu_util,
            memory_utilization=78.0,
            request_rate=240.0,
            error_rate=error_rate,
            p95_latency_ms=p95_latency,
            db_connections=db_connections,
            active_alerts=3
        )
        db.add(snapshot)

        await db.commit()
        return {
            "status": "custom_failure_injected",
            "incident_id": inc_id,
            "service": service_name,
            "metrics": {
                "error_rate": error_rate,
                "p95_latency_ms": p95_latency,
                "db_connections": db_connections,
                "cpu_utilization": cpu_util
            }
        }

    async def inject_failure(self, db: AsyncSession, scenario: str, target_service: str = "payment-api") -> Dict[str, Any]:
        """Injects a pre-built failure scenario into the telemetry simulation."""
        self.active_scenario = scenario
        self.scenario_started_at = datetime.now(timezone.utc)
        self.target_service_name = target_service

        res = await db.execute(select(Service).where(Service.name == target_service))
        service = res.scalars().first()
        if not service:
            raise ValueError(f"Service {target_service} not found")

        service.status = "critical" if scenario in ["db_connection_exhaustion", "deployment_regression"] else "degraded"
        
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
        else:
            service.error_rate = 32.8
            service.p95_latency_ms = 4120.0
            service.cpu_utilization = 88.0
            service.memory_utilization = 79.0
            service.active_alerts = 3
            db_conn = 460
            title = "Deployment regression payment-service v2.4.1 causing elevated 5xx errors"

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
            )
        ]
        for lg in error_logs:
            db.add(lg)

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
            )
        ]
        for sp in spans:
            db.add(sp)

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
        """Resets telemetry back to healthy baseline state."""
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
