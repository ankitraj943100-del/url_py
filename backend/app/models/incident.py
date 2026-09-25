import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey, JSON
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True) # e.g. 'INC-1042'
    title = Column(String(512), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False) # 'critical', 'high', 'medium', 'low'
    status = Column(String(50), nullable=False, default="open") # 'open', 'investigating', 'remediating', 'verifying', 'resolved'
    
    error_rate = Column(Float, default=0.0)
    p95_latency_ms = Column(Float, default=0.0)
    affected_users = Column(Integer, default=0)
    
    root_cause_summary = Column(Text, nullable=True)
    confidence_level = Column(String(50), nullable=True) # 'High confidence', 'Medium confidence'
    evidence_json = Column(JSON, default=list)
    
    assigned_to = Column(String(255), nullable=True, default="SentinelOps AI")
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(100), nullable=False) # e.g. 'alert_detected', 'ai_investigation_started'
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    source = Column(String(100), default="system")
    metadata_json = Column(JSON, default=dict)
