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
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   Alert Analyzer        Log Investigator     Metrics Investigator
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                        Trace Investigator
                               │
                               ▼
                   Temporal Correlation Agent
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

1. **Overview Dashboard (`/`)**: Real-time system health KPIs (Uptime 99.92%, Error Rate 4.82%, p95 Latency 1.92s, Alerts 17), sparklines, service health grid, and active incident callouts.
2. **Incident Management (`/incidents`)**: Filterable incident table (Critical, High, Medium, Resolved) with search and severity status tags.
3. **Incident Details (`/incidents/INC-1042`)**: Incident timeline, live AI multi-agent workflow visualizer, empirical evidence breakdown, and **Human Approval Gate** callout (`[Approve Rollback]`, `[Reject]`, `[Modify]`).
4. **AI Agents Visualizer (`/agents`)**: Real-time visual monitoring of all 10 specialized investigation and remediation agents.
5. **Services Catalog & Dependency Topology (`/services`)**: Microservice health grid and interactive topology graph (`api-gateway` → `payment-api` → `postgres-db` → `redis-cache`).
6. **Log Explorer (`/logs`)**: High-throughput structured log viewer with severity filtering, text search, expandable JSON view, and clickable `trace_id` links.
7. **Metrics Explorer (`/metrics`)**: Interactive Recharts time-series charts (Error rate %, p95 latency, DB active connections, CPU %).
8. **Distributed Trace Waterfall (`/traces`)**: OpenTelemetry request waterfall timeline pinpointing bottleneck span durations.
9. **SRE Runbooks & Knowledge Base (`/runbooks`)**: Vector-search-indexed runbooks and postmortems (indexed using PostgreSQL + pgvector).
10. **Deterministic Incident Simulator (`/simulator`)**: One-click failure injection panel (`Database connection pool exhaustion`, `Deployment regression`, `CPU spike`, `Redis outage`).
11. **Incident Replay Studio (`/replay`)**: Step-by-step playback slider replaying historical telemetry anomalies and agent decisions.
12. **Postmortem Generator (`/postmortems`)**: Automatically generates structured Markdown postmortems with action item tracking.
13. **Contextual AI Copilot (`/copilot`)**: Slide-out assistant with clickable evidence citations.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 (AsyncIO), Alembic, Uvicorn, AsyncSQLite / PostgreSQL.
- **AI & Multi-Agent**: LangGraph, LangChain, Structured Output Pydantic Schemas, Agentic RAG.
- **Database & Vector Search**: PostgreSQL 16, pgvector (HNSW cosine similarity index), Redis.
- **Observability & Infrastructure**: OpenTelemetry, Prometheus, Docker, Docker Compose.

---

## 4. Local Setup & Quickstart

### Option A: Running Standalone (Zero-Dependency SQLite Mode)

```bash
# 1. Clone repository
git clone https://github.com/sentinelops/sentinelops-ai.git
cd sentinelops-ai

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
```

Open `http://localhost:3000` in your browser.

---

### Option B: Running via Docker Compose (PostgreSQL + pgvector + Redis)

```bash
docker-compose up --build
```

---

## 5. Portfolio Demo Walkthrough (3-Minute Demo Scenario)

1. **Inspect Healthy State**: Open Overview Dashboard (`http://localhost:3000`). All services are operational.
2. **Inject Anomaly**: Navigate to **Simulator** (`/simulator`). Select **Database connection pool exhaustion** and click `[Inject Incident]`.
3. **Observe Automated Detection**: SentinelOps detects error rate spiking (0.2% → 38.2%), latency spiking (210ms → 4.82s), and DB connections spiking (82 → 497). Incident `INC-1042` is generated automatically.
4. **Inspect AI Multi-Agent Evidence**: Navigate to **Incident Details** (`/incidents/INC-1042`). Observe 8 specialized agents running in parallel, correlating logs, metrics, traces, and deployment `v2.4.1`.
5. **Review Human Approval Gate**: Review the high-risk remediation plan (`Roll back payment-service to v2.4.0`). Click `[Approve Rollback]`.
6. **Verify Recovery**: Telemetry normalizes (Error rate 0.2%, p95 185ms). Verification agent confirms recovery.
7. **Generate Postmortem**: Navigate to **Postmortems** (`/postmortems`) and click `[Generate Postmortem]` to view the AI-generated retrospective.

---

## 6. Resume Project Entry

```text
SentinelOps AI — Agentic SRE Incident Response & Observability Platform
Python, FastAPI, LangGraph, LangChain, PostgreSQL, pgvector, React, Docker, OpenTelemetry

• Built an agentic SRE platform that detects simulated production incidents and coordinates specialized AI agents across logs, metrics, traces, deployments, and operational runbooks to investigate probable root causes.
• Designed a LangGraph-based workflow with parallel telemetry investigation, evidence correlation, RAG-powered runbook retrieval, remediation planning, human approval, and automated recovery verification.
• Developed a real-time React dashboard for incident timelines, service health, agent activity, distributed traces, telemetry exploration, remediation approvals, incident replay, and AI-generated postmortems.
• Implemented PostgreSQL/pgvector retrieval for runbooks, architecture documents, and historical incidents, with evidence-linked AI responses and structured agent outputs.
• Containerized the complete observability stack and application using Docker, Prometheus, and OpenTelemetry, and evaluated the system using reproducible incident simulations and automated tests.
```
