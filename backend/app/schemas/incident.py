from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class IncidentEventResponse(BaseModel):
    id: str
    incident_id: str
    timestamp: datetime
    event_type: str
    title: str
    message: str
    source: str
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: str
    title: str
    service_id: str
    service_name: str
    severity: str
    status: str
    error_rate: float
    p95_latency_ms: float
    affected_users: int
    root_cause_summary: Optional[str] = None
    confidence_level: Optional[str] = None
    evidence_json: List[Any] = []
    assigned_to: Optional[str] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentCreateRequest(BaseModel):
    title: str
    service_name: str
    severity: str = "critical"
    error_rate: float = 38.2
    p95_latency_ms: float = 4820.0
    affected_users: int = 14200
