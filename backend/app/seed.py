import asyncio
import os
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.service import Service
from app.models.incident import Incident, IncidentEvent
from app.models.agent import Agent
from app.models.telemetry import ServiceMetric, LogRecord, TraceSpan, Deployment
from app.models.remediation import Remediation
from app.models.postmortem import Postmortem
from app.rag.vector_store import rag_vector_store
from app.agents.orchestrator import seed_agents_if_needed

INITIAL_SERVICES = [
    {"name": "api-gateway", "display_name": "API Gateway", "status": "healthy", "tier": "tier-1", "req_rate": 850.0, "err_rate": 0.05, "p95": 42.0, "cpu": 28.0, "alerts": 0},
    {"name": "auth-service", "display_name": "Auth Service", "status": "healthy", "tier": "tier-1", "req_rate": 420.0, "err_rate": 0.1, "p95": 78.0, "cpu": 32.0, "alerts": 0},
    {"name": "payment-api", "display_name": "Payment API", "status": "critical", "tier": "tier-1", "req_rate": 340.0, "err_rate": 38.2, "p95": 4820.0, "cpu": 91.0, "alerts": 3},
    {"name": "user-service", "display_name": "User Service", "status": "healthy", "tier": "tier-2", "req_rate": 290.0, "err_rate": 0.15, "p95": 110.0, "cpu": 24.0, "alerts": 0},
    {"name": "notification-service", "display_name": "Notification Service", "status": "degraded", "tier": "tier-2", "req_rate": 180.0, "err_rate": 3.4, "p95": 620.0, "cpu": 68.0, "alerts": 1},
    {"name": "post-service", "display_name": "Post Service", "status": "healthy", "tier": "tier-2", "req_rate": 510.0, "err_rate": 0.2, "p95": 140.0, "cpu": 36.0, "alerts": 0},
    {"name": "postgres-db", "display_name": "PostgreSQL Database", "status": "warning", "tier": "infrastructure", "req_rate": 1200.0, "err_rate": 2.1, "p95": 890.0, "cpu": 84.0, "alerts": 1},
    {"name": "redis-cache", "display_name": "Redis Cache Cluster", "status": "healthy", "tier": "infrastructure", "req_rate": 3400.0, "err_rate": 0.0, "p95": 4.5, "cpu": 18.0, "alerts": 0}
]

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed User
        u_res = await db.execute(select(User).where(User.email == "ankit@sentinelops.ai"))
        if not u_res.scalars().first():
            db.add(User(name="Ankit Raj", email="ankit@sentinelops.ai", role="SRE Lead"))

        # 2. Seed Services
        service_map = {}
        for s in INITIAL_SERVICES:
            s_res = await db.execute(select(Service).where(Service.name == s["name"]))
            existing = s_res.scalars().first()
            if not existing:
                srv = Service(
                    name=s["name"],
                    display_name=s["display_name"],
                    status=s["status"],
                    tier=s["tier"],
                    request_rate=s["req_rate"],
                    error_rate=s["err_rate"],
                    p95_latency_ms=s["p95"],
                    cpu_utilization=s["cpu"],
                    memory_utilization=s["cpu"] + 12.0,
                    active_alerts=s["alerts"]
                )
                db.add(srv)
                await db.flush()
                service_map[s["name"]] = srv.id
            else:
                service_map[s["name"]] = existing.id

        # 3. Seed Agents
        await seed_agents_if_needed(db)

        # 4. Seed Knowledge Documents (RAG)
        kb_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "knowledge-base"))
        if os.path.exists(kb_dir):
            await rag_vector_store.initialize_knowledge_base(db, kb_dir)

        # 5. Seed Default Critical Incident INC-1042 if missing
        inc_res = await db.execute(select(Incident).where(Incident.id == "INC-1042"))
        if not inc_res.scalars().first() and "payment-api" in service_map:
            p_id = service_map["payment-api"]
            inc = Incident(
                id="INC-1042",
                title="Payment API degradation — DB connection pool exhaustion",
                service_id=p_id,
                service_name="payment-api",
                severity="critical",
                status="open",
                error_rate=38.2,
                p95_latency_ms=4820.0,
                affected_users=14200,
                detected_at=datetime.now(timezone.utc) - timedelta(minutes=18),
                root_cause_summary="Database connection pool exhaustion following deployment payment-service v2.4.1.",
                confidence_level="High confidence",
                evidence_json=[
                    "DB connections increased from 82 → 497 (6.1x spike)",
                    "API latency increased 22.9x (210ms → 4.8s)",
                    "5xx HTTP responses increased 191x (0.2% → 38.2%)",
                    "Spike began 2 minutes after deployment payment-service v2.4.1",
                    "Payment service opened significantly more connections without context manager release"
                ]
            )
            db.add(inc)

            # Events
            now = datetime.now(timezone.utc)
            events = [
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=18), event_type="alert_detected", title="Alert detected", message="Prometheus alert triggered: Payment API error rate > 5%.", source="alert_manager"),
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=17), event_type="ai_investigation_started", title="AI investigation started", message="SentinelOps AI multi-agent workflow launched.", source="orchestrator"),
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=16), event_type="metric_anomaly", title="Database connection spike detected", message="DB connections increased from 82 to 497.", source="metrics_agent"),
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=15), event_type="deployment_correlated", title="Deployment correlation found", message="Deployment payment-service v2.4.1 detected 2 minutes prior.", source="correlation_agent"),
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=13), event_type="hypothesis_generated", title="Root cause hypothesis generated", message="High confidence (0.91): DB pool exhaustion after v2.4.1 release.", source="root_cause_agent"),
                IncidentEvent(incident_id="INC-1042", timestamp=now - timedelta(minutes=11), event_type="remediation_proposed", title="Remediation proposed", message="Rollback payment-service v2.4.1 -> v2.4.0 and restart pods.", source="remediation_agent")
            ]
            for ev in events:
                db.add(ev)

            # Remediation
            db.add(Remediation(
                id="rem-9021",
                incident_id="INC-1042",
                title="Roll back payment-service to v2.4.0 and recycle pod pool",
                action_type="rollback_deployment",
                description="Rolls back payment-service deployment from v2.4.1 to previous stable v2.4.0 release and restarts pods.",
                risk_level="high",
                status="pending",
                details_json={"steps": [
                    "1. Reduce connection concurrency",
                    "2. Roll back payment-service v2.4.1 to v2.4.0",
                    "3. Restart affected payment-api pods",
                    "4. Verify error rate for 5 minutes"
                ]}
            ))

        await db.commit()
        print("Database successfully initialized and seeded!")

if __name__ == "__main__":
    asyncio.run(seed_database())
