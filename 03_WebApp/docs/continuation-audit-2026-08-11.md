# Release 0.2.0 continuation audit — 11 August 2026

This audit answers the continuation brief before and after implementation. FutureMe already had a
strong explainable exploration flow, but it did not have one machine-readable contract connecting
release versions, education-data coverage, provenance, and decision-use limits. Release 0.2.0 adds
that contract without pretending the prototype is a validated university recommender.

## 1 · Current architecture

The runnable product is a local, guest-only Next.js application:

```text
30 interest responses + 5 context prompts
→ provisional RIASEC-shaped profile
→ one scenario mission
→ deterministic evidence gates and scoring
→ 0–3 unranked route hypotheses
→ comparison
→ reversible 30-day exploration plan
```

The live decision engine is TypeScript in `lib/decision-engine/` and runs in the browser. The
FastAPI code in `02_Backend/` is an architecture scaffold and is not connected to this path.
Optional AI can reword an existing explanation or answer bounded repository questions; it cannot
add, choose, rank, or remove a route or institution.

## 2 · Recommendation methodology

| Stage | Implemented rule | Validation boundary |
|---|---|---|
| Theory | Holland RIASEC-shaped vocational-interest reflection | Framework is established; this item set and Thai adaptation are not validated |
| Questions | 30 bilingual interest items; the first answer reorders two reviewed follow-ups | Stable rule, not CAT or IRT; all learners still answer all 30 items |
| Answers | Five-point responses plus five context prompts | Stored locally; four context fields are required and one is optional |
| Profile | Reverse-keying, per-dimension normalisation, completeness and spread checks | Deterministic implementation, not a norm-referenced assessment |
| Mission | One of three scenarios produces an independent rule-based evidence vector | Team-designed rubric; no outcome validation |
| Route score | Interests 50% + mission evidence 30% + learning-environment affinity 20% | Product weights; not fitted to student outcomes |
| Result | Refuse, or show up to three hypotheses; expose ties, contradictions, reasons and unknowns | No winner and no claim of admission or career prediction |

Education tier is the only active route-level eligibility field. Cost, relocation, time to earning,
flexibility, strengths, limitations, tuition, scholarships, admission criteria, deadlines and
distance cannot score, rank, filter or remove a route in 0.2.0.

## 3 · Existing datasets and current coverage

| Domain | What exists | Status and allowed use |
|---|---|---|
| Live questionnaire | 30 interest items + 5 context prompts | Research-informed, unvalidated; live reflection input |
| Research banks | 90-item design and 1,000 bilingual items | Research-only; not imported by the live interview |
| Missions | 3 four-step scenarios | Prototype evidence; rubric unvalidated |
| Route catalogue | 12 route hypotheses, dated 15 January 2026 | Illustrative / partially verified; source status shown per route |
| Institution register | 1,417 source records; 1,375 unique institutions shown | Partially verified directory only |
| Programme mapping | 178 institutions matched in the source; 140 displayed institutions mapped | Narrows degree-directory results only; not programme detail or admission advice |
| Geography | 77 provinces, 5,916 source access rows and 1,961 displayed rows | Directory ordering from province centres; never route selection |
| Admission | 0 validated local records | Unavailable; official TCAS portal is a verification link only |
| Financial | 0 validated local records | Tuition, scholarships, accommodation and living costs remain unknown |

The authoritative machine-readable statement is
[`data/education-data-registry.json`](../data/education-data-registry.json). Its human-readable
explanation is [Data coverage and governance](data-coverage-and-governance.md).

## 4 · Source review

The 11 August check confirmed that:

- the official MHESI programme-admission-plan dataset exists, is updated annually, was last marked
  updated on 23 July 2025, and states `License not specified`;
- the official OVEC public and private institution registers remain reachable and also state
  `License not specified`;
- the official myTCAS portal is on TCAS70, but no programme-by-campus admission records are copied
  into this repository;
- the stored MHESI 2566 institution copy remains traceable by checksum, but the live resource was
  not refreshed during the prior audit and must not be described as newly downloaded.

Source availability does not make the route catalogue's practical estimates current facts.

## 5 · What is validated and what is not

**Programmatically checked:** release-version consistency, JSON structure, unique identifiers,
province coverage, source-to-web referential integrity, coordinate ranges, outcome arithmetic,
small-sample suppression, full SHA-256 values, programme-route identifiers, source URLs/check
dates, explicit missing-data states, deterministic scoring behavior, and documentation links.

**Not validated with people or outcomes:** Thai item wording, reliability, construct validity,
fairness, route weights, mission rubrics, explanation usefulness, student outcomes, admission
suitability, affordability, or institution quality.

Known incompleteness is preserved as missing: 207 institution coordinates, 987 institution
websites, and 30 Thai station names.

## 6 · Changes made in release 0.2.0

1. Added a root `VERSION` and release manifest, and aligned web, engine and backend-scaffold labels.
2. Added a machine-readable Institution / Program / Admission / Financial / Location registry.
3. Extended `npm run check:data` to fail on version drift, unsupported status claims, unsafe source
   URLs, wrong counts, unavailable data used in decisions, or unsourced route fields omitted from
   the hold-out list.
4. Added automated release-metadata tests.
5. Added a learner-visible data-coverage panel to the nearby-institution screen.
6. Corrected documentation that still described old test counts, route counts, or a fixed-only
   questionnaire.
7. Relabelled the disconnected FastAPI service as an architecture scaffold instead of a finished
   `1.0.0` backend.
8. Added pinned backend runtime/development dependencies, 18 contract tests, a CI job, and a release
   verifier for version alignment, missing-data boundaries, and legacy-code quarantine.

## 7 · Remaining work and risks

The next defensible step is not to emit “Top 5 universities.” It is to ingest licensed,
programme-by-campus, academic-year data with a source URL, retrieval date, validity window and
field-level status. TCAS, tuition, scholarship, accommodation and public-transport data need
separate tables because they change on different schedules.

Before a student pilot, the project still needs ethics approval, parent consent and student assent,
independent Thai adaptation, cognitive interviews, instrument and mission validation, an evaluation
set, group fairness checks, a human safeguarding route, and a defined appeal process.

The largest regression risk is false confidence: a new source or UI field could accidentally become
a score. The registry and tests now block the known fields, but human review is still required when
new decision inputs are introduced.

## 8 · Release verification

Run from `03_WebApp/`:

```bash
npm run verify
npm run test:e2e
```

Run from `02_Backend/` in an isolated environment:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
python scripts/verify_system.py
```

Verified release results: 27 Vitest files / 533 tests, 95 Playwright journeys, 18 backend contract
tests, and all data, build, release-boundary, slide-overflow, and presentation-fidelity checks pass.
