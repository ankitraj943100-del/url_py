from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.remediation import Remediation
from app.models.incident import Incident, IncidentEvent
from app.simulator.engine import simulator_engine

router = APIRouter(prefix="/remediations", tags=["Remediations"])

@router.post("/{id}/approve")
async def approve_remediation(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Remediation).where((Remediation.id == id) | (Remediation.incident_id == id)))
    rem = res.scalars().first()
    if not rem:
        raise HTTPException(status_code=404, detail="Remediation plan not found")

    rem.status = "executed"
    rem.approved_by = "Ankit (SRE Lead)"
    rem.approved_at = datetime.now(timezone.utc)
    rem.executed_at = datetime.now(timezone.utc)

    # 1. Post timeline event
    app_ev = IncidentEvent(
        incident_id=rem.incident_id,
        timestamp=datetime.now(timezone.utc),
        event_type="human_approval",
        title="Human Approval Granted — Rollback Approved",
        message="Operator Ankit approved rollback of payment-service from v2.4.1 to v2.4.0.",
        source="human_operator"
    )
    db.add(app_ev)

    exec_ev = IncidentEvent(
        incident_id=rem.incident_id,
        timestamp=datetime.now(timezone.utc),
        event_type="remediation_executed",
        title="Remediation Executed — Rollback complete",
        message="payment-service v2.4.0 deployed. Recycled 4 pod replicas. Verification agent polling started.",
        source="remediation_agent"
    )
    db.add(exec_ev)

    # 2. Trigger simulator recovery
    await simulator_engine.recover(db, target_service="payment-api")
    await db.commit()

    return {
        "status": "approved_and_executed",
        "remediation_id": rem.id,
        "incident_id": rem.incident_id,
        "message": "Rollback completed. Telemetry metrics normalized. Verification agent confirmed recovery."
    }

@router.post("/{id}/reject")
async def reject_remediation(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Remediation).where((Remediation.id == id) | (Remediation.incident_id == id)))
    rem = res.scalars().first()
    if not rem:
        raise HTTPException(status_code=404, detail="Remediation plan not found")

    rem.status = "rejected"
    await db.commit()
    return {"status": "rejected", "remediation_id": rem.id}
