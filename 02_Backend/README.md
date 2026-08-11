# FutureMe backend architecture scaffold

> **Repository release 0.2.0 · status: disconnected scaffold.** The runnable product is
> [`03_WebApp/`](../03_WebApp/). This folder is not used by its interview, route selection,
> comparison, plan, nearby directory, or optional AI endpoints.

## What is here

- FastAPI and Pydantic examples for missions and future-path records
- an in-memory store that disappears when the process stops
- experimental RIASEC, STAR, multi-tier, matrix, route and RAG modules
- backend-only tests

The code retains some historical `FuturePath` class names so existing schema imports do not break.
That name is an implementation detail; the product is FutureMe AI.

## Safety boundary

`POST /v1/future-paths` is disabled by default because its legacy five-factor matrix includes
unsourced feasibility and flexibility defaults. Set `FUTUREME_ENABLE_LEGACY_BACKEND=1` only for
isolated engineering tests. Do not present its output as the current product result or as validated
guidance.

The live 0.2.0 engine is the deterministic TypeScript implementation in
[`03_WebApp/lib/decision-engine/`](../03_WebApp/lib/decision-engine/). It holds cost, relocation,
timing, flexibility, admission and financial data outside decisions until verified sources exist.

## Data and persistence limits

- No production database, authentication, consent system, Qdrant service or cloud deployment is connected.
- No validated programme-level TCAS, tuition, scholarship, accommodation or living-cost records are loaded.
- CORS uses a wildcard only because this is a local scaffold; credentialed cross-origin requests are disabled.

## Inspect the scaffold locally

Use a separate virtual environment. The dependency files are pinned to the versions used for the
0.2.0 verification run.

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-dev.txt
.\.venv\Scripts\python -m pytest -q
.\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

The test run checks the scaffold contract and quarantine boundaries. It does not validate the
questionnaire or make this backend part of the live web application.

See the [release audit](../03_WebApp/docs/continuation-audit-2026-08-11.md),
[system architecture](../03_WebApp/docs/05-system-architecture.md), and
[data coverage contract](../03_WebApp/docs/data-coverage-and-governance.md).
