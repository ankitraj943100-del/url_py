import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey, JSON
from app.core.database import Base

class ServiceMetric(Base):
    __tablename__ = "service_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    cpu_utilization = Column(Float, nullable=False)
    memory_utilization = Column(Float, nullable=False)
    request_rate = Column(Float, nullable=False)
    error_rate = Column(Float, nullable=False)
    p95_latency_ms = Column(Float, nullable=False)
    db_connections = Column(Integer, nullable=False)
    active_alerts = Column(Integer, default=0)


class LogRecord(Base):
    __tablename__ = "logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    level = Column(String(20), nullable=False) # 'INFO', 'WARN', 'ERROR', 'FATAL'
    message = Column(Text, nullable=False)
    trace_id = Column(String(100), nullable=True)
    span_id = Column(String(100), nullable=True)
    attributes_json = Column(JSON, default=dict)


class TraceSpan(Base):
    __tablename__ = "traces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String(100), nullable=False)
    span_id = Column(String(100), nullable=False)
    parent_span_id = Column(String(100), nullable=True)
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    operation_name = Column(String(255), nullable=False)
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    duration_ms = Column(Float, nullable=False)
    status_code = Column(String(20), default="OK") # 'OK', 'ERROR'
    http_method = Column(String(10), nullable=True)
    http_path = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    attributes_json = Column(JSON, default=dict)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    service_name = Column(String(100), nullable=False)
    version = Column(String(100), nullable=False) # e.g. 'v2.4.1'
    git_sha = Column(String(40), nullable=True)
    deployed_by = Column(String(255), default="CI/CD Pipeline")
    deployed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    changelog = Column(Text, nullable=True)
    config_changes_json = Column(JSON, default=dict)
