from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    display_name: str
    environment: str = "production"
    status: str = "healthy"
    owner_team: str = "Platform Core"
    repository_url: Optional[str] = None
    description: Optional[str] = None
    tier: str = "tier-1"

class ServiceResponse(ServiceBase):
    id: str
    request_rate: float
    error_rate: float
    p95_latency_ms: float
    cpu_utilization: float
    memory_utilization: float
    active_alerts: int
    created_at: datetime

    class Config:
        from_attributes = True
