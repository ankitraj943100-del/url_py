from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.incident import Incident
from app.models.postmortem import Postmortem

router = APIRouter(prefix="/postmortems", tags=["Postmortems"])

@router.get("")
async def list_postmortems(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Postmortem).order_by(Postmortem.created_at.desc()))
    return res.scalars().all()

@router.get("/{incident_id}")
async def get_postmortem(incident_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Postmortem).where((Postmortem.incident_id == incident_id) | (Postmortem.id == incident_id)))
    postmortem = res.scalars().first()
    if not postmortem:
        raise HTTPException(status_code=404, detail="Postmortem not found for this incident")
    return postmortem

@router.post("/generate")
async def generate_postmortem(incident_id: str = "INC-1042", db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    pm_res = await db.execute(select(Postmortem).where(Postmortem.incident_id == incident_id))
    pm = pm_res.scalars().first()
    
    if not pm:
        pm = Postmortem(
            incident_id=incident.id,
            title=f"INC-1042 Postmortem — {incident.title}",
            summary="Payment API experienced elevated HTTP 5xx responses (38.2%) and p95 latency spike (4.82s) due to database connection pool exhaustion triggered by deployment v2.4.1.",
            impact_analysis="Approximately 14,200 user checkout transactions were affected over an 18-minute window before automated AI detection and operator-approved rollback.",
            timeline_markdown="""- **14:19 UTC** — GitHub Actions deployed payment-service v2.4.1.
- **14:21 UTC** — Postgres connection pool saturated (82 → 497 connections).
- **14:22 UTC** — API latency spiked from 210ms to 4.82s.
- **14:23 UTC** — 5xx Error rate spiked to 38.2%. Alert triggered.
- **14:24 UTC** — SentinelOps AI multi-agent investigation launched.
- **14:26 UTC** — Root cause hypothesis generated (High confidence 0.91).
- **14:28 UTC** — Remediation rollback approved by SRE Lead Ankit.
- **14:34 UTC** — Verification Agent confirmed recovery (0.2% error rate, 185ms latency).""",
            root_cause_analysis="Commit 9f8a3c1 in payment-service v2.4.1 introduced a regression in async database session management by omitting context manager cleanup on checkout retry loops. Concurrency starved the 50-connection pool.",
            contributing_factors="1. Lack of connection pool acquisition linter in pre-merge CI check.\n2. Inadequate staging load testing for retry edge-cases.",
            resolution_steps="1. Approved and executed rollback of payment-service from v2.4.1 to v2.4.0.\n2. Recycled Kubernetes payment-api pods to immediately purge dead connections.",
            preventive_actions=[
                {"action": "Add mandatory SQLAlchemy connection pool linter to CI pipeline", "owner": "Platform Team", "status": "In Progress"},
                {"action": "Increase DB connection timeout alerting threshold", "owner": "SRE Team", "status": "Completed"},
                {"action": "Implement automatic connection recycling on pod threshold breach", "owner": "DevOps", "status": "Planned"}
            ],
            lessons_learned="SentinelOps AI multi-agent temporal correlation reduced root-cause discovery time from ~25 minutes manual dashboard checking to under 3 minutes."
        )
        db.add(pm)
        await db.commit()

    return pm
