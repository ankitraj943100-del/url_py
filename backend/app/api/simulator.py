from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.simulator.engine import simulator_engine

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class InjectRequest(BaseModel):
    scenario: str = "db_connection_exhaustion"
    target_service: str = "payment-api"

class CustomInjectRequest(BaseModel):
    service_name: str = "payment-api"
    error_rate: float = 45.0
    p95_latency: float = 6200.0
    cpu_util: float = 95.0
    db_connections: int = 480
    custom_error_log: str = "OOMKilled: Memory limit of 2Gi exceeded on payment-api pod"

@router.post("/inject")
async def inject_scenario(req: InjectRequest, db: AsyncSession = Depends(get_db)):
    try:
        res = await simulator_engine.inject_failure(db, req.scenario, req.target_service)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inject_custom")
async def inject_custom_scenario(req: CustomInjectRequest, db: AsyncSession = Depends(get_db)):
    try:
        res = await simulator_engine.inject_custom_failure(
            db, req.service_name, req.error_rate, req.p95_latency, req.cpu_util, req.db_connections, req.custom_error_log
        )
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
