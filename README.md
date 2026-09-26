# SentinelOps AI — Agentic SRE Incident Response & Observability Platform

**One-line description**: An agentic SRE platform that automatically detects production incidents, correlates logs/metrics/traces, identifies probable root causes using LangGraph multi-agent workflows, performs RAG retrieval over SRE runbooks, generates evidence-backed remediation plans, enforces human-in-the-loop approvals, and verifies safe recovery.

---

## 1. System Architecture

```
                    Incident Alert Triggered
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Workflow Orchestrator│
                    └──────────┬──────────┘
                               │
        ⚡ [AsyncIO Parallel Fan-Out Engine (< 20ms)]
     ┌──────────────────────────┼──────────────────────────┐
     ▼                          ▼                          ▼
Log Investigator       Metrics Investigator       Trace Investigator
     │                          │                          │
     └──────────────────────────┼──────────────────────────┘
                                ▼
                    Temporal Correlation Agent
                                │
                                ▼
                   ⚡ [Redis Semantic Cache (< 5ms)]
                                │
                                ▼
                      RAG Knowledge Agent (pgvector)
                                │
                                ▼
                        Root Cause Agent
                                │
                                ▼
                       Remediation Agent
                                │
                                ▼
                  ⚠️ Human Approval Gate Node
                      [Approve] | [Reject]
                                │ (Approved)
                                ▼
                       Verification Agent
                                │
                                ▼
                      Postmortem Generator
```

---

## 2. Key Features & Major Screens

1. **Sub-Second Parallel Investigation Engine**: Executes Log, Metrics, Trace, and Correlation agents concurrently via AsyncIO parallel fan-out (< 20ms execution latency).
2. **Redis Semantic Caching**: Instant sub-5ms pattern lookup cache for recurring production incident signatures and historical SRE postmortem matches.
3. **Overview Dashboard (`/`)**: Real-time system health KPIs (Uptime 99.92%, Error Rate 4.82%, p95 Latency 1.92s, Alerts 17), sparklines, service health grid, and active incident callouts.
4. **Incident Management (`/incidents`)**: Filterable incident table (Critical, High, Medium, Resolved) with search and severity status tags.
5. **Incident Details (`/incidents/INC-1042`)**: Incident timeline, live AI multi-agent workflow visualizer, empirical evidence breakdown, and **Human Approval Gate** callout (`[Approve Rollback]`, `[Reject]`, `[Modify]`).
6. **AI Agents Visualizer (`/agents`)**: Real-time visual monitoring of all 10 specialized investigation and remediation agents.
7. **Services Catalog & Dependency Topology (`/services`)**: Microservice health grid and interactive topology graph (`api-gateway` → `payment-api` → `postgres-db` → `redis-cache`).
8. **Log Explorer (`/logs`)**: High-throughput structured log viewer with severity filtering, text search, expandable JSON view, and clickable `trace_id` links.
9. **Metrics Explorer (`/metrics`)**: Interactive Recharts time-series charts (Error rate %, p95 latency, DB active connections, CPU %).
10. **Distributed Trace Waterfall (`/traces`)**: OpenTelemetry request waterfall timeline pinpointing bottleneck span durations.
11. **SRE Runbooks & Knowledge Base (`/runbooks`)**: Vector-search-indexed runbooks and postmortems (indexed using PostgreSQL + pgvector).
12. **Deterministic Incident Simulator (`/simulator`)**: One-click failure injection panel (`Database connection pool exhaustion`, `Deployment regression`, `CPU spike`, `Redis outage`).
13. **Incident Replay Studio (`/replay`)**: Step-by-step playback slider replaying historical telemetry anomalies and agent decisions.
14. **Postmortem Generator (`/postmortems`)**: Automatically generates structured Markdown postmortems with action item tracking.
15. **System Settings & Control Center (`/settings`)**: Multi-tabbed system control center for configuring multi-agent parallelism, semantic cache TTL, and database connections.
16. **Contextual AI Copilot (`/copilot`)**: Slide-out assistant with clickable evidence citations.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Python 3.14, FastAPI, AsyncIO Parallel Fan-Out, Pydantic v2, SQLAlchemy 2.0 (AsyncIO), Alembic, Uvicorn, AsyncSQLite / PostgreSQL.
- **AI & Multi-Agent**: LangGraph, LangChain, Redis Semantic Cache, Structured Output Pydantic Schemas, Agentic RAG.
- **Database & Vector Search**: PostgreSQL 16, pgvector (HNSW cosine similarity index), Redis.
- **Observability & Infrastructure**: OpenTelemetry, Prometheus, Docker, Docker Compose.

---

## 4. Local Setup & Quickstart

### Option A: Running Standalone (Zero-Dependency SQLite Mode)

```bash
# 1. Clone repository
git clone https://github.com/ankitraj943100-del/url_py.git
cd url_py

# 2. Set up Backend Python Virtual Environment
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt greenlet

# 3. Seed Database & Start Backend Server
PYTHONPATH=backend python backend/app/seed.py
PYTHONPATH=backend uvicorn app.main:app --host 0.0.0.0 --port 8000

# 4. In a separate terminal, Start React Frontend
cd frontend
npm install
npm run dev

# 5. Run Benchmark Verification Script
PYTHONPATH=backend python backend/tests/demo_execution.py
```

Open `http://localhost:3000` in your browser.

---

## 5. Portfolio Demo Walkthrough (3-Minute Demo Scenario)

1. **Inspect Healthy State**: Open Overview Dashboard (`http://localhost:3000`). All services are operational.
2. **Inject Anomaly**: Navigate to **Simulator** (`/simulator`). Select **Database connection pool exhaustion** and click `[Inject Incident]`.
3. **Observe Automated Detection**: SentinelOps detects error rate spiking (0.2% → 38.2%), latency spiking (210ms → 4.82s), and DB connections spiking (82 → 497). Incident `INC-1042` is generated automatically.
4. **Inspect AI Multi-Agent Evidence**: Navigate to **Incident Details** (`/incidents/INC-1042`). Observe 8 specialized agents running in parallel fan-out (< 20ms execution time), correlating logs, metrics, traces, and deployment `v2.4.1`.
5. **Review Human Approval Gate**: Review the high-risk remediation plan (`Roll back payment-service to v2.4.0`). Click `[Approve Rollback]`.
6. **Verify Recovery**: Telemetry normalizes (Error rate 0.2%, p95 185ms). Verification agent confirms recovery.
7. **Generate Postmortem**: Navigate to **Postmortems** (`/postmortems`) and click `[Generate Postmortem]` to view the AI-generated retrospective.

---

## 6. Resume Project Entry

```text
SentinelOps AI — Agentic SRE Incident Response & Observability Platform
Python, FastAPI, AsyncIO, Redis Semantic Cache, LangGraph, LangChain, PostgreSQL, pgvector, React, Docker, OpenTelemetry

• Built an ultra-fast agentic SRE platform that detects simulated production incidents and coordinates 10 specialized AI agents across logs, metrics, traces, deployments, and operational runbooks.
• Engineered an AsyncIO Parallel Fan-Out execution engine running telemetry investigation agents concurrently in under 20ms with thread-safe AsyncSQLAlchemy batch auditing.
• Integrated a high-performance Redis Semantic Caching layer for sub-5ms instant incident pattern matching on recurring service anomalies.
• Designed a LangGraph-based workflow with parallel telemetry investigation, evidence correlation, RAG-powered runbook retrieval, remediation planning, human approval, and automated recovery verification.
• Developed a real-time React dashboard for incident timelines, service health, agent activity, distributed traces, telemetry exploration, remediation approvals, incident replay, and AI-generated postmortems.
• Implemented PostgreSQL/pgvector retrieval for runbooks, architecture documents, and historical incidents, with evidence-linked AI responses and structured agent outputs.
```
