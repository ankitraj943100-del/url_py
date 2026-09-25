from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.incident import Incident, IncidentEvent

router = APIRouter(prefix="/replay", tags=["Incident Replay"])

@router.get("/{incident_id}")
async def get_incident_replay(incident_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    ev_res = await db.execute(select(IncidentEvent).where(IncidentEvent.incident_id == incident_id).order_by(IncidentEvent.timestamp.asc()))
    events = ev_res.scalars().all()

    # Timeline replay sequence frames
    replay_steps = [
        {
            "step": 1,
            "timestamp": "14:19 UTC",
            "title": "Deployment v2.4.1 Executed",
            "description": "GitHub Actions pipeline deployed payment-service v2.4.1 into production.",
            "metrics": {"error_rate": 0.2, "latency_ms": 190, "db_conn": 82, "cpu": 34.0},
            "badge": "Deployment"
        },
        {
            "step": 2,
            "timestamp": "14:21 UTC",
            "title": "Database Connection Pool Spike",
            "description": "DB connections on payment-api spiked from 82 to 497 connections.",
            "metrics": {"error_rate": 2.4, "latency_ms": 680, "db_conn": 497, "cpu": 63.0},
            "badge": "Anomaly"
        },
        {
            "step": 3,
            "timestamp": "14:22 UTC",
            "title": "Latency Degraded to 4.8s",
            "description": "p95 latency breached threshold (210ms → 4820ms). Request queues backing up.",
            "metrics": {"error_rate": 12.8, "latency_ms": 4820, "db_conn": 497, "cpu": 88.0},
            "badge": "Latency"
        },
        {
            "step": 4,
            "timestamp": "14:23 UTC",
            "title": "5xx Error Rate Spike & Sentinel Alert",
            "description": "HTTP 500 errors reached 38.2%. Critical alert triggered incident INC-1042.",
            "metrics": {"error_rate": 38.2, "latency_ms": 4820, "db_conn": 497, "cpu": 91.0},
            "badge": "Alert"
        },
        {
            "step": 5,
            "timestamp": "14:24 UTC",
            "title": "AI Investigation Started",
            "description": "LangGraph multi-agent workflow launched parallel telemetry investigations.",
            "metrics": {"error_rate": 38.2, "latency_ms": 4820, "db_conn": 497, "cpu": 91.0},
            "badge": "AI Investigation"
        },
        {
            "step": 6,
            "timestamp": "14:26 UTC",
            "title": "Root Cause Hypothesis & Evidence",
            "description": "Root Cause Agent identified DB pool exhaustion following deployment v2.4.1 (0.91 confidence).",
            "metrics": {"error_rate": 38.2, "latency_ms": 4820, "db_conn": 497, "cpu": 91.0},
            "badge": "Root Cause"
        },
        {
            "step": 7,
            "timestamp": "14:28 UTC",
            "title": "Remediation Proposed & Approved",
            "description": "Remediation Agent proposed rollback to v2.4.0. Operator Ankit approved.",
            "metrics": {"error_rate": 38.2, "latency_ms": 4820, "db_conn": 497, "cpu": 91.0},
            "badge": "Approval"
        },
        {
            "step": 8,
            "timestamp": "14:34 UTC",
            "title": "Incident Resolved & Recovery Verified",
            "description": "Rollback completed. Verification Agent confirmed error rate 0.2% and latency 185ms.",
            "metrics": {"error_rate": 0.2, "latency_ms": 185, "db_conn": 74, "cpu": 34.0},
            "badge": "Resolved"
        }
    ]

    return {
        "incident_id": incident_id,
        "title": incident.title,
        "total_steps": len(replay_steps),
        "steps": replay_steps,
        "events": events
    }
