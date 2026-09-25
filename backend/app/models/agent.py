import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, ForeignKey, JSON
from app.core.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(100), primary_key=True) # e.g. 'alert-analyzer', 'log-investigator'
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="idle") # 'idle', 'running', 'completed', 'failed'


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(String(100), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(255), nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="running") # 'running', 'completed', 'failed', 'waiting_approval'
    duration_ms = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    output_json = Column(JSON, default=dict)
