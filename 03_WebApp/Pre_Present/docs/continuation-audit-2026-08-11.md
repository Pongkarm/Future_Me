# Continuation audit — 11 August 2026

This is an implementation audit, not a claim that the prototype has been validated with
students. It records what is running, what the data can support, and which information is
intentionally held outside the recommendation engine.

## Current system

The runnable product is a local, guest-only Next.js application:

```text
30 interest responses → provisional RIASEC-shaped profile
one scenario mission → independent behavioural signal
enough evidence? → 0–3 route hypotheses → comparison → 30-day exploration plan
```

The route selector is deterministic TypeScript. Optional AI can only reword an existing
explanation or answer bounded, source-backed repository questions; it cannot add, choose, rank,
or remove routes or institutions.

## Data and evidence status

| Area | What exists | Status and limit |
|---|---|---|
| Interest instrument | 30 bilingual activity statements, five per RIASEC dimension | Research-informed only. The Thai item set, translation, reliability, validity, and score norms have not been tested. |
| Mission evidence | Three four-step scenario missions with transparent rules | Team-designed rubric; not validated against student outcomes. |
| Route catalogue | 12 study/work exploration routes with per-route provenance | Illustrative. Route weights are design judgement, not trained or outcome-validated. |
| Nearby institutions | 77 provinces and 1,961 displayed options, generated 10 August 2026 | Uses documented MHESI/OVEC institution registers and OSRM travel estimates from a province centre. It is a directory, not a programme or admission recommendation. |
| Programme matching | 140 of 1,375 unique institutions shown in the web directory have programme-derived `runs` mappings | It is not a full national programme register. The remaining institutions use type-based discovery fallbacks and every programme must be confirmed with the institution. |
| TCAS, tuition, scholarships | Current official portals can be linked | No programme-by-campus-by-year TCAS, fee, scholarship, or regulated-profession dataset is stored locally, so the prototype must not claim or rank them. |

The official [TCAS70 portal](https://www.mytcas.com/) was reachable during this audit. The official
OVEC pages for [public](https://ckan.vec.go.th/en/dataset/publicschool) and
[private](https://ckan.vec.go.th/en/dataset/privateschool) vocational institutions remain the
registry sources, but both pages state `License not specified`. The official
[employment dataset](https://ckan.vec.go.th/en/dataset/employment) states `Open Data Common` and
contains the 2566 graduate-outcome resource used here. The live MHESI resource could not be
refreshed during this check; the stored 2566 copy and source checksum remain traceable, but they
must not be described as newly verified. Source availability does not turn generic route fields
into current programme-level facts.

## Corrections and controls applied in this revision

`data/routes.json` explicitly marks `costBand`, `requiresRelocation`, `timeToEarning`, and
`flexibility` as unsourced. Before this revision, those estimates could still affect feasibility
scores or exclude a route. That contradicted the catalogue's own provenance statement.

The engine now accepts these fields only after they are listed in `meta.fieldStatus.verified`.
Until then, they remain visible as labelled prompts for a learner to verify, but they do not score,
rank, or remove a route. The education-tier rule remains the only active route-level eligibility
filter.

The geography registry now stores full SHA-256 values and exact byte counts. `npm run check:data`
checks those values plus province keys, institution and station identifiers, coordinate ranges,
outcome arithmetic and suppression, province-access summaries, and the web dataset's links back to
the source registry. The check also reports known incompleteness rather than filling it: 207
institution coordinates, 987 institution websites, and 30 Thai station names are currently
unknown.

## What must happen before practical constraints can decide anything

1. Ingest a licensed, official source at programme and academic-year level.
2. Store a source URL, retrieval date, validity window, institution/campus, programme, and the
   exact field being asserted.
3. Keep tuition, living cost, scholarship, admission criteria, and travel data separate rather
   than collapsing them into a single `costBand` or relocation flag.
4. Add data validation and a regression test before adding the field to
   `meta.fieldStatus.verified`.
5. Show the source, update date, caveats, and an official verification link next to every learner-
   visible fact.

Until that pipeline exists, FutureMe is a structured exploration aid. It is not a programme,
institution, admission, affordability, or scholarship recommender.

## Validation checklist for this revision

- `npm run typecheck`
- `npm run lint`
- `npm run check:data`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Run these from `03_WebApp/Pre_Present` after any change to the engine, dataset, or UI.
