# SRE Runbook: Redis Cache Latency & Memory Saturation (REDIS-001)

## Severity: MEDIUM / HIGH
**Target Services**: `redis-cache`, `auth-service`, `payment-api`

---

## 1. Symptoms & Alerts
- `Redis Command Latency` (> 100ms per command)
- `Cache Miss Rate Spike` (> 60%)
- `Redis Maxmemory Reached` alert triggered
- Application logs contain:
  - `redis.exceptions.ConnectionError: Connection closed by server`
  - `OOM command not allowed when used memory > 'maxmemory'`

---

## 2. Root Cause Analysis
1. Unindexed keys or lack of TTL setting causing unbounded memory growth.
2. Heavy key scanning (`KEYS *`) executed on single-threaded Redis main loop.
3. Cache invalidation cascade after deployment causing thundering herd on primary database.

---

## 3. Remediation Procedure
1. Evict volatile keys with TTL policy:
   ```bash
   redis-cli -h redis-cache CONFIG SET maxmemory-policy volatile-lru
   ```
2. Flush temporary session cache if memory usage exceeds 95%.
3. Restart affected consumer pods (`auth-service`).
