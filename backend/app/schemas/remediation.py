from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class RemediationResponse(BaseModel):
    id: str
    incident_id: str
    title: str
    action_type: str
    description: str
    risk_level: str
    status: str
    details_json: Dict[str, Any] = {}
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RemediationApproveRequest(BaseModel):
    notes: Optional[str] = "Approved safe remediation action via SentinelOps UI"
