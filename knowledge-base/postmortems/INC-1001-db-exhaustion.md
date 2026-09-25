# Historical Postmortem: INC-1001 — Database Connection Saturation

**Date**: 2026-08-14  
**Severity**: CRITICAL  
**Service Affected**: `payment-api`  
**Duration**: 18 minutes  
**Impact**: 11,400 user checkout transactions failed with HTTP 500 error code.  

---

## 1. Summary
At 10:14 UTC, `payment-api` experienced an abrupt error rate spike from 0.1% to 32.4%. Latency degraded to 5.2s. Investigation revealed deployment `v2.3.8` omitted context manager cleanup on DB sessions during high-concurrency payment retries, exhausting the Postgres connection pool (450/450 connections saturated).

---

## 2. Root Cause
Code change in `payment-service` commit `7f8a92c` removed the `async with db_session:` context block in the checkout endpoint, causing open connections to hang until TCP socket timeout.

---

## 3. Resolution
Rolled back `payment-api` to `v2.3.7` and recycled Kubernetes deployment pods. Error rate normalized to 0.2% within 3 minutes of rollback completion.

---

## 4. Action Items
- Enforce database connection pool linter in CI/CD pipeline.
- Implement SentinelOps AI automated anomaly correlation for deployments.
