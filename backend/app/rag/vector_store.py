import math
import os
import glob
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.knowledge import KnowledgeDocument

# SimpleTF-IDF / Vector similarity helper so RAG works offline out-of-the-box without requiring an API key,
# while supporting optional pgvector / OpenAI embedding models if API key is provided.

def tokenize(text: str) -> List[str]:
    return [w.lower().strip(".,#:-_()[]`'") for w in text.split() if len(w) > 2]

def compute_similarity(query: str, doc_text: str) -> float:
    q_tokens = set(tokenize(query))
    d_tokens = tokenize(doc_text)
    if not q_tokens or not d_tokens:
        return 0.0
    
    matches = sum(1 for token in d_tokens if token in q_tokens)
    score = matches / (math.sqrt(len(q_tokens)) * math.sqrt(len(set(d_tokens))) + 1e-5)
    
    # Boost exact phrase matches
    if query.lower() in doc_text.lower():
        score += 0.4
    return min(1.0, score)

class RAGVectorStore:
    def __init__(self):
        pass

    async def initialize_knowledge_base(self, db: AsyncSession, knowledge_dir: str):
        """Scans knowledge-base markdown files and ingests them into the database."""
        # Check if already seeded
        res = await db.execute(select(KnowledgeDocument))
        existing = res.scalars().all()
        if existing:
            return len(existing)

        ingested_count = 0
        patterns = [
            (os.path.join(knowledge_dir, "runbooks", "*.md"), "runbook"),
            (os.path.join(knowledge_dir, "architecture", "*.md"), "architecture"),
            (os.path.join(knowledge_dir, "postmortems", "*.md"), "postmortem")
        ]

        for pattern, doc_type in patterns:
            for filepath in glob.glob(pattern):
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    filename = os.path.basename(filepath)
                    title = filename.replace(".md", "").replace("-", " ").title()
                    
                    # Extract title from markdown header if present
                    first_line = content.splitlines()[0] if content.splitlines() else ""
                    if first_line.startswith("#"):
                        title = first_line.lstrip("#").strip()

                    service_name = "payment-api" if "payment" in filename or "database" in filename else None

                    doc = KnowledgeDocument(
                        title=title,
                        document_type=doc_type,
                        service_name=service_name,
                        content=content,
                        metadata_json={
                            "filename": filename,
                            "filepath": filepath,
                            "file_size": len(content)
                        }
                    )
                    db.add(doc)
                    ingested_count += 1
                except Exception as e:
                    print(f"Error reading knowledge doc {filepath}: {e}")

        await db.commit()
        return ingested_count

    async def search_relevant_documents(
        self,
        db: AsyncSession,
        query: str,
        service_name: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Searches documents based on query similarity and service tag."""
        stmt = select(KnowledgeDocument)
        res = await db.execute(stmt)
        docs = res.scalars().all()

        scored_docs = []
        for d in docs:
            sim = compute_similarity(query, f"{d.title} {d.content}")
            if service_name and d.service_name and d.service_name == service_name:
                sim += 0.2
            
            if sim > 0.05:
                scored_docs.append({
                    "id": d.id,
                    "title": d.title,
                    "document_type": d.document_type,
                    "service_name": d.service_name,
                    "content_snippet": d.content[:600] + ("..." if len(d.content) > 600 else ""),
                    "full_content": d.content,
                    "relevance_score": round(min(1.0, sim), 2)
                })

        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]

rag_vector_store = RAGVectorStore()
