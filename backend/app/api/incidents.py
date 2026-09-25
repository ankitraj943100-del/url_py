from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.core.database import get_db
from app.models.incident import Incident, IncidentEvent
from app.models.agent import AgentRun
from app.models.remediation import Remediation
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("")
async def list_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Incident).order_by(Incident.detected_at.desc())
    if severity and severity != "all":
        stmt = stmt.where(Incident.severity == severity)
    if status and status != "all":
        stmt = stmt.where(Incident.status == status)
    
    res = await db.execute(stmt)
    incidents = res.scalars().all()

    if search:
        s_lower = search.lower()
        incidents = [
            inc for inc in incidents
            if s_lower in inc.id.lower() or s_lower in inc.title.lower() or s_lower in inc.service_name.lower()
        ]

    return incidents

@router.get("/{id}")
async def get_incident_details(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Incident).where(Incident.id == id))
    incident = res.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Fetch events
    ev_res = await db.execute(select(IncidentEvent).where(IncidentEvent.incident_id == id).order_by(IncidentEvent.timestamp.asc()))
    events = ev_res.scalars().all()

    # Fetch agent runs
    ag_res = await db.execute(select(AgentRun).where(AgentRun.incident_id == id).order_by(AgentRun.started_at.asc()))
    agent_runs = ag_res.scalars().all()

    # Fetch remediation
    rem_res = await db.execute(select(Remediation).where(Remediation.incident_id == id))
    remediation = rem_res.scalars().first()

    return {
        "incident": incident,
        "events": events,
        "agent_runs": agent_runs,
        "remediation": remediation
    }

@router.post("/{id}/investigate")
async def trigger_investigation(id: str, db: AsyncSession = Depends(get_db)):
    try:
        state = await orchestrator.run_investigation_workflow(db, id)
        return {"status": "investigation_completed", "incident_id": id, "state": state.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}/timeline")
async def get_incident_timeline(id: str, db: AsyncSession = Depends(get_db)):
    ev_res = await db.execute(select(IncidentEvent).where(IncidentEvent.incident_id == id).order_by(IncidentEvent.timestamp.asc()))
    return ev_res.scalars().all()

@router.get("/{id}/agents")
async def get_incident_agents(id: str, db: AsyncSession = Depends(get_db)):
    ag_res = await db.execute(select(AgentRun).where(AgentRun.incident_id == id).order_by(AgentRun.started_at.asc()))
    return ag_res.scalars().all()
