from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List

from app.core.database import get_db
from app.models.telemetry import LogRecord, TraceSpan, ServiceMetric

router = APIRouter(prefix="", tags=["Telemetry"])

@router.get("/logs")
async def search_logs(
    service: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LogRecord).order_by(LogRecord.timestamp.desc()).limit(limit)
    if service and service != "all":
        stmt = stmt.where(LogRecord.service_name == service)
    if level and level != "all":
        stmt = stmt.where(LogRecord.level == level)

    res = await db.execute(stmt)
    logs = res.scalars().all()

    if search:
        s_lower = search.lower()
        logs = [
            l for l in logs
            if s_lower in l.message.lower() or (l.trace_id and s_lower in l.trace_id.lower())
        ]

    return logs

@router.get("/traces/{trace_id}")
async def get_trace_waterfall(trace_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(TraceSpan).where(TraceSpan.trace_id == trace_id).order_by(TraceSpan.start_time.asc()))
    spans = res.scalars().all()
    if not spans:
        raise HTTPException(status_code=404, detail=f"Trace {trace_id} not found")

    root_span = next((s for s in spans if s.parent_span_id is None), spans[0])
    services_involved = list(set(s.service_name for s in spans))

    return {
        "trace_id": trace_id,
        "total_duration_ms": max(s.duration_ms for s in spans),
        "service_count": len(services_involved),
        "services": services_involved,
        "root_span": root_span,
        "spans": spans
    }
