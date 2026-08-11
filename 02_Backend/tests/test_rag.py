import json

import pytest

from app.rag import RAGPipeline
from app.rag.pipeline import PRODUCTION_KNOWLEDGE_BASE_READY, RAG_KNOWLEDGE_STATUS
from scripts.generate_qwen_dataset import (
    DATASET_GENERATION_ENABLED,
    generate_qwen_qlora_dataset,
    validate_dataset_schema,
)


def test_rag_scaffold_retrieves_repository_metadata():
    rag = RAGPipeline()
    evaluation = [
        {"query": "repository backend scaffold", "expected_doc_ids": ["doc_repository_scope"]},
        {"query": "TCAS tuition scholarships unavailable", "expected_doc_ids": ["doc_data_coverage"]},
        {"query": "unverified fields excluded from scoring", "expected_doc_ids": ["doc_decision_boundary"]},
        {"query": "AI explain but not select routes", "expected_doc_ids": ["doc_ai_boundary"]},
    ]
    assert rag.evaluate_recall_at_k(evaluation, k=20) == 1.0
    assert RAG_KNOWLEDGE_STATUS == "repository-metadata-only"
    assert PRODUCTION_KNOWLEDGE_BASE_READY is False


def test_rag_scaffold_grounding_is_limited_to_recorded_boundaries():
    rag = RAGPipeline()
    claims = [
        {"claim": "What is the backend status?", "expected_fact": ["architecture scaffold", "not connected"]},
        {"claim": "Which dynamic data is missing?", "expected_fact": ["tcas", "tuition", "scholarships"]},
        {"claim": "What can AI do?", "expected_fact": ["explain", "may not select"]},
    ]
    assert rag.evaluate_grounded_claim_accuracy(claims) == 1.0


def test_unvalidated_qwen_dataset_generation_is_retired():
    assert DATASET_GENERATION_ENABLED is False
    with pytest.raises(RuntimeError, match="unvalidated education and admission claims"):
        generate_qwen_qlora_dataset()


def test_schema_validator_checks_shape_not_truth(tmp_path):
    path = tmp_path / "sample.jsonl"
    records = [
        {"instruction": "Explain the source.", "input": "record", "output": "source metadata"},
        {"instruction": "", "input": "invalid", "output": "empty instruction"},
    ]
    path.write_text("\n".join(json.dumps(record) for record in records), encoding="utf-8")
    assert validate_dataset_schema(str(path)) == 0.5
