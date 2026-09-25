from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ServiceMetricResponse(BaseModel):
    id: str
    service_id: str
    service_name: str
    timestamp: datetime
    cpu_utilization: float
    memory_utilization: float
    request_rate: float
    error_rate: float
    p95_latency_ms: float
    db_connections: int
    active_alerts: int

    class Config:
        from_attributes = True

class LogRecordResponse(BaseModel):
    id: str
    service_id: str
    service_name: str
    timestamp: datetime
    level: str
    message: str
    trace_id: Optional[str] = None
    span_id: Optional[str] = None
    attributes_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class TraceSpanResponse(BaseModel):
    id: str
    trace_id: str
    span_id: str
    parent_span_id: Optional[str] = None
    service_id: str
    service_name: str
    operation_name: str
    start_time: datetime
    duration_ms: float
    status_code: str
    http_method: Optional[str] = None
    http_path: Optional[str] = None
    error_message: Optional[str] = None
    attributes_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class TraceWaterfallResponse(BaseModel):
    trace_id: str
    total_duration_ms: float
    service_count: int
    root_span: TraceSpanResponse
    spans: List[TraceSpanResponse]
