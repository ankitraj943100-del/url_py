import json
import hashlib
import time
from typing import Dict, Any, Optional

class SemanticCache:
    """High-speed Redis / In-Memory Semantic Cache for recurring SRE incident patterns."""

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _generate_key(self, service_name: str, metric_name: str, anomaly_pattern: str) -> str:
        raw_key = f"{service_name}:{metric_name}:{anomaly_pattern.lower().strip()}"
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    def get_cached_analysis(self, service_name: str, metric_name: str, anomaly_pattern: str) -> Optional[Dict[str, Any]]:
        key = self._generate_key(service_name, metric_name, anomaly_pattern)
        cached = self._cache.get(key)
        if cached:
            cached_item = cached["data"]
            cached_item["from_cache"] = True
            cached_item["cache_lookup_time_ms"] = round((time.time() - cached["cached_at_ts"]) * 1000, 2)
            return cached_item
        return None

    def store_analysis(self, service_name: str, metric_name: str, anomaly_pattern: str, data: Dict[str, Any]):
        key = self._generate_key(service_name, metric_name, anomaly_pattern)
        self._cache[key] = {
            "cached_at_ts": time.time(),
            "data": data
        }

semantic_cache = SemanticCache()
