"""Release 0.2.0 repository-contract verifier for the backend scaffold.

This script checks version alignment and safety boundaries. It does not claim to
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


def repository_version() -> str:
    return (REPOSITORY_ROOT / "VERSION").read_text(encoding="utf-8").strip()


def check_version_alignment() -> None:
    version = repository_version()
    package = read_json(WEB_ROOT / "package.json")
    package_lock = read_json(WEB_ROOT / "package-lock.json")
    release = read_json(WEB_ROOT / "data" / "release.json")
    registry = read_json(WEB_ROOT / "data" / "education-data-registry.json")
    backend_version = (BACKEND_ROOT / "app" / "version.py").read_text(encoding="utf-8")

    values = {
        "web package": package["version"],
        "web package lock": package_lock["version"],
        "release record": release["version"],
        "data registry": registry["releaseVersion"],
    }
    mismatches = {name: value for name, value in values.items() if value != version}
    if mismatches:
        raise AssertionError(f"Version mismatch: expected {version}, found {mismatches}")
    if f'APP_VERSION = "{version}"' not in backend_version:
        raise AssertionError("Backend APP_VERSION does not match repository VERSION")


def check_component_statuses() -> None:
    release = read_json(WEB_ROOT / "data" / "release.json")
    components = release["components"]
    if components["webApp"]["status"] != "implemented":
        raise AssertionError("Web app must be labelled implemented")
    if components["backend"]["status"] != "scaffold-not-connected":
        raise AssertionError("Backend must be labelled scaffold-not-connected")
    if components["decisionEngine"]["status"] != "implemented-unvalidated":
        raise AssertionError("Decision engine must retain its unvalidated label")


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
        ("version alignment", check_version_alignment),
        ("component status labels", check_component_statuses),
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
