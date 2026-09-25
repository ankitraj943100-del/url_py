from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.service import Service
from app.models.incident import Incident

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    # Fetch all services
    res = await db.execute(select(Service))
    services = res.scalars().all()
    
    healthy_count = sum(1 for s in services if s.status == "healthy")
    degraded_count = sum(1 for s in services if s.status == "degraded")
    warning_count = sum(1 for s in services if s.status == "warning")
    critical_count = sum(1 for s in services if s.status == "critical")

    # Fetch active incidents
    inc_res = await db.execute(
        select(Incident).where(Incident.status.in_(["open", "investigating", "remediating", "verifying"])).order_by(Incident.detected_at.desc())
    )
    active_incidents = inc_res.scalars().all()

    # Calculate system averages
    avg_error_rate = round(sum(s.error_rate for s in services) / max(len(services), 1), 2)
    avg_p95_latency = round(sum(s.p95_latency_ms for s in services) / max(len(services), 1), 1)
    total_alerts = sum(s.active_alerts for s in services)

    return {
        "kpis": {
            "system_uptime": {"value": 99.92, "previous_value": 99.91, "trend": "+0.01%", "status": "healthy"},
            "active_incidents": {"value": len(active_incidents), "previous_value": 1, "trend": "+2 from last hour", "status": "critical" if active_incidents else "healthy"},
            "error_rate": {"value": avg_error_rate, "previous_value": 0.3, "trend": f"{'+' if avg_error_rate > 0.3 else ''}{round(avg_error_rate - 0.3, 2)}%", "status": "critical" if avg_error_rate > 2.0 else "healthy"},
            "p95_latency_ms": {"value": avg_p95_latency, "previous_value": 210.0, "trend": f"{'+' if avg_p95_latency > 210 else ''}{round(avg_p95_latency - 210, 1)}ms", "status": "warning" if avg_p95_latency > 500 else "healthy"},
            "total_alerts": {"value": total_alerts, "previous_value": 3, "trend": f"+{total_alerts}", "status": "warning" if total_alerts > 0 else "healthy"}
        },
        "service_health_counts": {
            "healthy": healthy_count,
            "degraded": degraded_count,
            "warning": warning_count,
            "critical": critical_count
        },
        "services": [
            {
                "id": s.id,
                "name": s.name,
                "display_name": s.display_name,
                "status": s.status,
                "error_rate": s.error_rate,
                "p95_latency_ms": s.p95_latency_ms,
                "active_alerts": s.active_alerts
            } for s in services
        ],
        "active_incidents": [
            {
                "id": inc.id,
                "title": inc.title,
                "service_name": inc.service_name,
                "severity": inc.severity,
                "status": inc.status,
                "error_rate": inc.error_rate,
                "p95_latency_ms": inc.p95_latency_ms,
                "affected_users": inc.affected_users,
                "detected_at": inc.detected_at.isoformat()
            } for inc in active_incidents
        ]
    }
