# FutureMe backend plan

> **Architecture reference, not the running product.** Historical versions of this
> file marked a FastAPI/Qdrant/PostgreSQL system and several unsupported content checks as complete.
> Those claims are withdrawn. The current implementation boundary is recorded below.

## Current state

| Area | What exists | Status |
|---|---|---|
| FastAPI entrypoint | App metadata, permissive non-credentialed local CORS, router registration | Scaffold |
| Mission endpoints | Fixed mission examples and heuristic response evaluation | Experimental, unvalidated |
| Future-path endpoint | Historical three-route generator | Disabled by default |
| Storage | Process-local Python dictionary | Temporary only |
| Decision engine | Separate Python prototypes with historical five-factor rules | Not aligned with the live engine |
| RAG | Client and pipeline examples | No connected Qdrant service or evaluated retrieval set |
| Schemas | Pydantic models for the proposed API | Reference only |
| Dependencies and tests | Pinned runtime/dev requirements; 18 contract tests | Verified in the current repository snapshot |

## Current interface

| Method | Path | Current behavior |
|---|---|---|
| `GET` | `/` | Returns scaffold status and its disconnected runtime boundary |
| `POST` | `/v1/missions/recommend` | Returns fixed experimental mission examples |
| `POST` | `/v1/missions/{id}/submissions` | Runs an unvalidated heuristic evaluator |
| `POST` | `/v1/future-paths` | Returns HTTP 501 unless `FUTUREME_ENABLE_LEGACY_BACKEND=1` |
| `GET` | `/v1/future-paths/{id}` | Reads only records created in the current process |

## Why the recommendation endpoint is off

The historical Python matrix gives default scores to academic readiness, affordability,
geographical access and future flexibility. The repository does not contain validated data that
supports those defaults. Enabling the endpoint would therefore produce precision without evidence.

The current product instead uses the TypeScript engine in `03_WebApp`, which exposes reasons,
refusal gates, ties and provenance and keeps unsourced practical fields outside decisions.

## Production integration gate

Before this service can replace the browser engine, it needs:

1. one shared and tested recommendation contract with the TypeScript implementation;
2. licensed programme-by-campus and academic-year data with source URLs and validity windows;
3. explicit missing-data behavior for TCAS, fees, scholarships, accommodation and travel;
4. authentication, consent, retention, deletion and audit controls suitable for minors;
5. a persistent database and deployment configuration;
6. independent instrument, explanation, fairness, safety and outcome evaluation.

See [`README.md`](README.md) for the folder boundary and the
[continuation audit](../03_WebApp/docs/continuation-audit-2026-08-11.md) for the repository-wide decision.
