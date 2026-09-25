import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.knowledge import KnowledgeDocument
from app.rag.vector_store import rag_vector_store

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])

@router.get("")
async def list_knowledge_documents(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()))
    return res.scalars().all()

@router.post("/ingest")
async def ingest_knowledge_documents(db: AsyncSession = Depends(get_db)):
    kb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "knowledge-base"))
    count = await rag_vector_store.initialize_knowledge_base(db, kb_path)
    return {"status": "ingested", "documents_processed": count}
