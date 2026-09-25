import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from app.core.database import Base

class Postmortem(Base):
    __tablename__ = "postmortems"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False)
    impact_analysis = Column(Text, nullable=False)
    timeline_markdown = Column(Text, nullable=False)
    root_cause_analysis = Column(Text, nullable=False)
    contributing_factors = Column(Text, nullable=False)
    resolution_steps = Column(Text, nullable=False)
    preventive_actions = Column(JSON, default=list)
    lessons_learned = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
