import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from app.core.database import Base

class Remediation(Base):
    __tablename__ = "remediations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    action_type = Column(String(100), nullable=False) # 'rollback_deployment', 'restart_service', 'scale_replicas'
    description = Column(Text, nullable=False)
    risk_level = Column(String(50), default="high") # 'critical', 'high', 'medium', 'low'
    status = Column(String(50), default="pending") # 'pending', 'approved', 'rejected', 'executed', 'failed'
    details_json = Column(JSON, default=dict)
    
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
