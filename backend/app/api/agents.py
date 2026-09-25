from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.agent import Agent, AgentRun

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("")
async def list_agents(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Agent))
    return res.scalars().all()

@router.get("/runs")
async def list_agent_runs(incident_id: str = "INC-1042", db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(AgentRun).where(AgentRun.incident_id == incident_id).order_by(AgentRun.started_at.asc())
    )
    return res.scalars().all()
