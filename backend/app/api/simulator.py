from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.simulator.engine import simulator_engine

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class InjectRequest(BaseModel):
    scenario: str = "db_connection_exhaustion"
    target_service: str = "payment-api"

@router.post("/inject")
async def inject_scenario(req: InjectRequest, db: AsyncSession = Depends(get_db)):
    try:
        res = await simulator_engine.inject_failure(db, req.scenario, req.target_service)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset")
async def reset_scenario(target_service: str = "payment-api", db: AsyncSession = Depends(get_db)):
    res = await simulator_engine.recover(db, target_service)
    return res

@router.get("/status")
async def get_simulator_status():
    return {
        "active_scenario": simulator_engine.active_scenario,
        "scenario_started_at": simulator_engine.scenario_started_at.isoformat() if simulator_engine.scenario_started_at else None,
        "target_service": simulator_engine.target_service_name
    }
