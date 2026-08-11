"""Retired synthetic training-data generator.

The previous demo emitted unsourced education and admission claims.  It remains a
named compatibility module so old imports fail with an explicit safety message
instead of silently generating unsafe training data.
"""

import json
import os


DATASET_GENERATION_ENABLED = False
RETIREMENT_REASON = (
    "Synthetic QLoRA generation is disabled in release 0.2.0 because the previous "
    "samples contained unvalidated education and admission claims. Build a new "
    "dataset only from reviewed source records with provenance and freshness fields."
)


def generate_qwen_qlora_dataset(output_path: str = "data/qwen_qlora_dataset.jsonl") -> str:
    """Refuse to generate the retired, unvalidated training dataset."""
    del output_path
    raise RuntimeError(RETIREMENT_REASON)


def validate_dataset_schema(file_path: str) -> float:
    """Validate JSONL structure only; this does not validate factual correctness."""
    if not os.path.exists(file_path):
        return 0.0

    valid_lines = 0
    total_lines = 0
    required_keys = {"instruction", "input", "output"}

    with open(file_path, "r", encoding="utf-8") as source:
        for line in source:
            value = line.strip()
            if not value:
                continue
            total_lines += 1
            try:
                record = json.loads(value)
            except (TypeError, ValueError):
                continue
            if not isinstance(record, dict) or not required_keys.issubset(record):
                continue
            if all(isinstance(record[key], str) and record[key].strip() for key in required_keys):
                valid_lines += 1

    return round(valid_lines / total_lines, 4) if total_lines else 0.0


if __name__ == "__main__":
    raise SystemExit(RETIREMENT_REASON)
