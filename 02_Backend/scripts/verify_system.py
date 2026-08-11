"""Repository-contract verifier for the disconnected backend scaffold.

This script checks the scaffold identity and safety boundaries. It does not claim to
validate educational theory, admission rules, programme facts, or RAG quality.
"""

import json
import os
from pathlib import Path
from typing import Callable, List, Tuple


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPOSITORY_ROOT / "02_Backend"
WEB_ROOT = REPOSITORY_ROOT / "03_WebApp"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def check_scaffold_boundary() -> None:
    main_source = (BACKEND_ROOT / "app" / "main.py").read_text(encoding="utf-8")
    readme = (BACKEND_ROOT / "README.md").read_text(encoding="utf-8").lower()
    if 'SERVICE_STATUS = "architecture-scaffold"' not in main_source:
        raise AssertionError("Backend must retain its architecture-scaffold status")
    if '"connected_to_web_app": False' not in main_source:
        raise AssertionError("Backend root response must state that it is disconnected")
    if "not connected to the runnable web app" not in main_source.lower():
        raise AssertionError("Backend application description must state the runtime boundary")
    if "disconnected scaffold" not in readme:
        raise AssertionError("Backend README must retain the disconnected-scaffold warning")


def check_missing_data_boundary() -> None:
    registry = read_json(WEB_ROOT / "data" / "education-data-registry.json")
    domains = registry["domains"]
    for name in ("admission", "financial"):
        domain = domains[name]
        if domain["status"] != "unavailable" or domain["coverage"]["localRecords"] != 0:
            raise AssertionError(f"{name} must remain unavailable with zero local records")
        if domain["decisionUse"] != "none":
            raise AssertionError(f"{name} must not be used in decisions")

    held_out = set(registry["recommendationBoundary"]["heldOutUntilVerified"])
    required = {
        "admission requirements",
        "TCAS deadlines",
        "tuition",
        "scholarships",
        "accommodation",
        "cost of living",
    }
    if not required.issubset(held_out):
        raise AssertionError(f"Missing held-out decision fields: {sorted(required - held_out)}")


def check_legacy_backend_quarantine() -> None:
    if os.getenv("FUTUREME_ENABLE_LEGACY_BACKEND", "").strip() == "1":
        raise AssertionError("Legacy backend is enabled in the current environment")

    router = (BACKEND_ROOT / "app" / "api" / "router.py").read_text(encoding="utf-8")
    rag = (BACKEND_ROOT / "app" / "rag" / "pipeline.py").read_text(encoding="utf-8")
    generator = (BACKEND_ROOT / "scripts" / "generate_qwen_dataset.py").read_text(encoding="utf-8")
    if "HTTP_501_NOT_IMPLEMENTED" not in router:
        raise AssertionError("Legacy recommendation endpoint lacks a default refusal")
    if 'PRODUCTION_KNOWLEDGE_BASE_READY = False' not in rag:
        raise AssertionError("RAG scaffold is not explicitly marked non-production")
    if 'DATASET_GENERATION_ENABLED = False' not in generator:
        raise AssertionError("Unsafe synthetic training-data generation is not retired")


def main() -> int:
    checks: List[Tuple[str, Callable[[], None]]] = [
        ("scaffold identity and runtime boundary", check_scaffold_boundary),
        ("missing-data decision boundary", check_missing_data_boundary),
        ("legacy backend quarantine", check_legacy_backend_quarantine),
    ]

    failures = []
    for name, check in checks:
        try:
            check()
            print(f"PASS: {name}")
        except Exception as error:  # verifier should report every failed contract
            failures.append((name, str(error)))
            print(f"FAIL: {name}: {error}")

    if failures:
        print(f"Backend scaffold verification failed with {len(failures)} error(s).")
        return 1
    print("Backend scaffold verification passed. This is not educational validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
