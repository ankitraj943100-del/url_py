import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, Integer
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False) # e.g. 'payment-api'
    display_name = Column(String(255), nullable=False)
    environment = Column(String(50), nullable=False, default="production")
    status = Column(String(50), nullable=False, default="healthy") # 'healthy', 'degraded', 'warning', 'critical'
    owner_team = Column(String(100), nullable=False, default="Platform Core")
    repository_url = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    tier = Column(String(50), nullable=False, default="tier-1")
    
    # Real-time aggregated snapshot fields
    request_rate = Column(Float, default=120.0) # req/sec
    error_rate = Column(Float, default=0.2) # %
    p95_latency_ms = Column(Float, default=185.0) # ms
    cpu_utilization = Column(Float, default=32.0) # %
    memory_utilization = Column(Float, default=48.0) # %
    active_alerts = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
