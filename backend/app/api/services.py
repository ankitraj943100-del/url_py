from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.service import Service
from app.models.telemetry import ServiceMetric

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("")
async def list_services(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Service).order_by(Service.name.asc()))
    return res.scalars().all()

@router.get("/{id}")
async def get_service(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Service).where(Service.id == id))
    service = res.scalars().first()
    if not service:
        # Try looking up by name
        res = await db.execute(select(Service).where(Service.name == id))
        service = res.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.get("/{id}/metrics")
async def get_service_metrics(id: str, limit: int = 30, db: AsyncSession = Depends(get_db)):
    # Find service ID
    res = await db.execute(select(Service).where((Service.id == id) | (Service.name == id)))
    service = res.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    m_res = await db.execute(
        select(ServiceMetric)
        .where(ServiceMetric.service_id == service.id)
        .order_by(ServiceMetric.timestamp.desc())
        .limit(limit)
    )
    metrics = m_res.scalars().all()
    metrics.reverse()
    return metrics
