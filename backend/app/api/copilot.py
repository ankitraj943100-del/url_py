from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.rag.vector_store import rag_vector_store

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    message: str
    incident_id: Optional[str] = "INC-1042"
    service_name: Optional[str] = "payment-api"

@router.post("/chat")
async def copilot_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    msg_lower = req.message.lower()

    # RAG document retrieval
    rag_docs = await rag_vector_store.search_relevant_documents(
        db, req.message, service_name=req.service_name, top_k=2
    )

    if "why" in msg_lower or "failing" in msg_lower or "cause" in msg_lower:
        answer = (
            "The failure on `payment-api` is correlated with **deployment v2.4.1** at 14:19 UTC and "
            "subsequent **database connection pool exhaustion** (82 → 497 connections). "
            "Code commit `9f8a3c1` opened unclosed DB session connections under concurrency."
        )
        evidence = [
            {"type": "Logs", "label": "327 error matches (QueuePool limit overflow)", "link": "/logs?service=payment-api&level=ERROR"},
            {"type": "Metrics", "label": "DB Connections (82 → 497) & p95 Latency (4.8s)", "link": "/metrics?service=payment-api"},
            {"type": "Deployment", "label": "payment-service v2.4.1 (Deployed 14:19 UTC)", "link": "/incidents/INC-1042"},
            {"type": "Runbook", "label": "DB-POOL-003: Database Connection Pool Exhaustion", "link": "/runbooks"}
        ]
    elif "change" in msg_lower or "deploy" in msg_lower:
        answer = (
            "Deployment `v2.4.1` of `payment-service` was deployed at **14:19 UTC** by the GitHub Actions pipeline. "
            "The changelog included: *'Updated payment retry logic and async DB session handler.'*"
        )
        evidence = [
            {"type": "Deployment", "label": "payment-service v2.4.1 (SHA: 9f8a3c1)", "link": "/incidents/INC-1042"}
        ]
    elif "runbook" in msg_lower or "action" in msg_lower:
        answer = (
            "Recommended runbook: **DB-POOL-003 (Database Connection Pool Exhaustion)**. "
            "Key resolution steps: 1) Roll back payment-service to v2.4.0; 2) Restart payment-api pods to drop connection pool."
        )
        evidence = [
            {"type": "Runbook", "label": "DB-POOL-003 Runbook", "link": "/runbooks"}
        ]
    else:
        answer = (
            f"SentinelOps AI is investigating `{req.service_name}` for incident `{req.incident_id}`. "
            "Telemetry shows 38.2% error rate and 4.82s p95 latency. Root cause confidence is High (0.91)."
        )
        evidence = [
            {"type": "Incident", "label": "INC-1042 Details", "link": f"/incidents/{req.incident_id}"}
        ]

    return {
        "reply": answer,
        "evidence_citations": evidence,
        "retrieved_documents": [
            {
                "title": doc["title"],
                "type": doc["document_type"],
                "relevance_score": doc["relevance_score"],
                "snippet": doc["content_snippet"]
            } for doc in rag_docs
        ]
    }
