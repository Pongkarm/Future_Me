"""Research-only RAG scaffold for the current FutureMe repository snapshot.

The runnable web app does not import this module.  The local knowledge base below
contains repository-status records only; it deliberately excludes changing TCAS,
programme, fee, scholarship, and accommodation claims until an official-source
ingestion and freshness policy is implemented.
"""

import hashlib
import math
from typing import Any, Dict, List, Optional

from schemas.source_record import SourceRecord
from app.rag.qdrant_client import QdrantHybridClient


RAG_KNOWLEDGE_STATUS = "repository-metadata-only"
PRODUCTION_KNOWLEDGE_BASE_READY = False


class BGEM3Embedder:
    """Deterministic 1024-dimensional embedding adapter for scaffold tests.

    The class keeps the previous BGE-M3-compatible vector size without downloading
    model weights or implying that semantic retrieval quality has been validated.
    """

    def __init__(self, model_name: str = "deterministic-hash-scaffold"):
        self.model_name = model_name
        self.dimension = 1024

    def embed_text(self, text: str) -> List[float]:
        """Return a deterministic, L2-normalized vector for local structural tests."""
        vector = [0.0] * self.dimension
        words = text.lower().split()
        if not words:
            vector[0] = 1.0
            return vector

        for index, word in enumerate(words):
            digest = hashlib.sha256(word.encode("utf-8")).digest()
            first = int.from_bytes(digest[:4], "big") % self.dimension
            second = int.from_bytes(digest[4:8], "big") % self.dimension
            weight = 1.0 / math.sqrt(index + 1)
            vector[first] += weight
            vector[second] += weight * 0.5

        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else [1.0] + [0.0] * 1023


class RAGPipeline:
    """Inspectable retrieval scaffold over non-advisory repository metadata."""

    def __init__(self, qdrant_client: Optional[QdrantHybridClient] = None):
        self.embedder = BGEM3Embedder()
        self.qdrant = qdrant_client or QdrantHybridClient()
        self._kb_initialized = False
        self.initialize_knowledge_base()

    def initialize_knowledge_base(self) -> None:
        """Index repository, data-coverage, decision-boundary, and AI-boundary records."""
        if self._kb_initialized:
            return

        records = [
            SourceRecord(
                source_id="doc_repository_scope",
                title="FutureMe repository scope",
                source_type="repository_metadata",
                chunk_content=(
                    "The repository contains a runnable Next.js web prototype. "
                    "The Python backend is an architecture scaffold and is not connected "
                    "to the web application."
                ),
                metadata={
                    "validation_status": "verified_repository_state",
                    "last_validated": "2026-08-11",
                },
                file_path="../README.md",
            ),
            SourceRecord(
                source_id="doc_data_coverage",
                title="Education data coverage",
                source_type="repository_metadata",
                chunk_content=(
                    "The local dataset covers institutions and partial programme mappings. "
                    "Current TCAS rounds, admission requirements, tuition, scholarships, "
                    "accommodation, and cost of living are unavailable and must remain unknown."
                ),
                metadata={
                    "validation_status": "verified_repository_state",
                    "last_validated": "2026-08-11",
                },
                file_path="../03_WebApp/data/education-data-registry.json",
            ),
            SourceRecord(
                source_id="doc_decision_boundary",
                title="Decision-input boundary",
                source_type="repository_metadata",
                chunk_content=(
                    "The current web prototype uses questionnaire evidence and mission evidence. "
                    "Unverified cost, relocation, earning-time, flexibility, admission, and "
                    "financial fields are excluded from filtering, scoring, and ranking."
                ),
                metadata={
                    "validation_status": "verified_repository_state",
                    "last_validated": "2026-08-11",
                },
                file_path="../03_WebApp/data/education-data-registry.json",
            ),
            SourceRecord(
                source_id="doc_ai_boundary",
                title="AI responsibility boundary",
                source_type="repository_metadata",
                chunk_content=(
                    "Deterministic code selects routes in the runnable prototype. "
                    "Optional AI may explain an already selected route, but may not select, "
                    "rank, or invent routes or education facts."
                ),
                metadata={
                    "validation_status": "verified_repository_state",
                    "last_validated": "2026-08-11",
                },
                file_path="../03_WebApp/docs/05-system-architecture.md",
            ),
        ]

        for record in records:
            record.vector = self.embedder.embed_text(record.chunk_content)

        self.qdrant.index_documents(records)
        self._kb_initialized = True

    def retrieve(
        self,
        query_text: str,
        filter_criteria: Optional[Dict[str, Any]] = None,
        top_k: int = 5,
    ) -> List[SourceRecord]:
        query_vector = self.embedder.embed_text(query_text)
        return self.qdrant.hybrid_search(
            query_vector=query_vector,
            query_text=query_text,
            top_k=top_k,
            filter_criteria=filter_criteria,
        )

    def query(
        self,
        query_text: str,
        filter_criteria: Optional[Dict[str, Any]] = None,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        sources = self.retrieve(query_text, filter_criteria=filter_criteria, top_k=top_k)
        snippets = [
            f"[{index + 1}] {source.title}: {source.chunk_content}"
            for index, source in enumerate(sources)
        ]
        context = "\n".join(snippets) if snippets else "No matching repository metadata."
        return {
            "query": query_text,
            "sources": sources,
            "synthesized_context": context,
            "response": f"Repository context for '{query_text}':\n{context}",
            "knowledge_status": RAG_KNOWLEDGE_STATUS,
            "production_ready": PRODUCTION_KNOWLEDGE_BASE_READY,
        }

    def evaluate_recall_at_k(self, eval_set: List[Dict[str, Any]], k: int = 20) -> float:
        """Measure scaffold-record retrieval; this is not a production RAG evaluation."""
        if not eval_set:
            return 1.0
        hits = 0
        for item in eval_set:
            expected = set(item.get("expected_doc_ids", []))
            retrieved = {record.source_id for record in self.retrieve(item.get("query", ""), top_k=k)}
            if expected.intersection(retrieved):
                hits += 1
        return round(hits / len(eval_set), 4)

    def evaluate_grounded_claim_accuracy(self, claims_set: List[Dict[str, Any]]) -> float:
        """Check whether expected repository terms occur in retrieved scaffold context."""
        if not claims_set:
            return 1.0
        correct = 0
        for item in claims_set:
            expected = [str(value).lower() for value in item.get("expected_fact", [])]
            result = self.query(item.get("claim", ""), top_k=4)
            context = result["synthesized_context"].lower()
            if expected and all(value in context for value in expected):
                correct += 1
        return round(correct / len(claims_set), 4)
