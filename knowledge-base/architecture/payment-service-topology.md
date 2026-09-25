# Architecture Specification: Payment Service Topology

## Service Name: `payment-api`
**Tier**: Tier 1 (Mission Critical)  
**Owner Team**: Payment Platform Team  
**Repository**: `github.com/sentinelops/payment-service`  

---

## 1. Dependencies & Call Graph
```
Client -> API Gateway (api-gateway)
           ├── Auth Service (auth-service) -> Redis Cache (redis-cache)
           └── Payment Service (payment-api)
                 ├── Postgres Database (postgres-db) [Max Conn Pool: 50]
                 ├── Redis Cache (redis-cache)
                 └── External Gateway (stripe-mock)
```

---

## 2. Infrastructure Parameters
- Replicas: 4 pods
- CPU Allocation: 1000m request / 2000m limit per pod
- Memory Allocation: 1Gi request / 2Gi limit per pod
- DB Pool Config: `min_size=10`, `max_size=50`, `timeout=5.0s`
- Deployment Strategy: RollingUpdate (`maxSurge=25%`, `maxUnavailable=0`)

---

## 3. Known Failure Modes
- **Connection Leak**: Unclosed DB transaction blocks in async endpoints starve connection pool under high concurrency.
- **External Gateway Timeout**: Stripe network slowdown degrades p95 latency unless circuit breaker trips.
