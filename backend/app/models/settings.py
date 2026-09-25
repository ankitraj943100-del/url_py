import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, JSON, Boolean
from app.core.database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(String(36), primary_key=True, default="default-settings")
    llm_provider = Column(String(50), default="gpt-4o-mini") # 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-1-5-pro', 'llama-3-local'
    temperature = Column(Float, default=0.1)
    
    slack_webhook_url = Column(String(512), nullable=True)
    pagerduty_token = Column(String(255), nullable=True)
    
    slo_p95_latency_ms = Column(Float, default=500.0)
    slo_error_rate_pct = Column(Float, default=2.0)
    
    auto_investigate = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
