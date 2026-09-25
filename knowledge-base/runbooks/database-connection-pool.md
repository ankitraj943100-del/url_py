# SRE Runbook: Database Connection Pool Exhaustion (DB-POOL-003)

## Severity: HIGH / CRITICAL
**Target Services**: `payment-api`, `user-service`, `auth-service`, `postgres-db`

---

## 1. Symptoms & Alerts
- `High 5xx Error Rate` (> 5% of total request volume)
- `p95 Latency Spike` (> 3,000ms)
- `Database Connections Alert` (Active connection count > 90% of max pool limit, e.g. > 450 connections)
- Application logs contain:
  - `sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached`
  - `psycopg2.OperationalError: FATAL: remaining connection slots are reserved for non-replication superuser connections`
  - `connection acquisition timeout after 5000ms`

---

## 2. Root Cause Analysis
Database connection pool exhaustion typically occurs when:
1. **Deployment Regression**: A new code release omits explicit database connection release (e.g. missing `async with db.begin()` or context manager).
2. **Slow Queries**: Unindexed database queries hold connection slots open for extended periods, depleting the available pool for incoming web requests.
3. **Connection Leak**: Replicas or async worker loops spawn unbounded connection threads under high HTTP concurrency.

---

## 3. Step-by-Step Remediation Procedure

### Step 1: Confirm Connection Saturation
Run diagnostic metrics or check Prometheus dashboard for `pg_stat_activity` count:
```sql
SELECT count(*), state, query FROM pg_stat_activity GROUP BY state, query;
```

### Step 2: Immediate Mitigation (Rollback or Restart)
If a recent deployment correlates temporally with the connection spike (within 10 minutes):
1. **Initiate Rollback**: Roll back the service deployment to the previous stable release.
   ```bash
   kubectl rollout undo deployment/payment-service -n production
   ```
2. **Recycle Idle Connections**: If rollback is delayed, restart the application pods to terminate leaked connections immediately:
   ```bash
   kubectl rollout restart deployment/payment-service -n production
   ```

### Step 3: Temporary Pool Expansion (If Traffic Surge)
Increase maximum pool size temporarily via environment variable:
`DB_POOL_SIZE=50` -> `DB_POOL_SIZE=100`

---

## 4. Verification Protocol
1. Observe `Database Connections` metric for 3 minutes until count drops below 100.
2. Confirm `Payment API 5xx Error Rate` returns to baseline (< 0.5%).
3. Confirm `p95 Latency` returns to normal (< 250ms).
