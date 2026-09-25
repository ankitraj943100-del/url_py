from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AgentResponse(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class AgentRunResponse(BaseModel):
    id: str
    incident_id: str
    agent_id: str
    agent_name: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    duration_ms: float
    summary: Optional[str] = None
    output_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True
