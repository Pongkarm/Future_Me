# Source Materials

[← Back to README](../READMEEN.md)

---

This repository publishes **rewritten English summaries** and a curated subset of the project's
research base. It does not contain every raw team source. This document records what is retained,
what was summarized, and what was excluded.

Integration boundary reviewed 16 August 2026. The live app, current screenshots,
restored future question bank, and research-only RAG materials remain labelled separately. Current
education-data coverage and decision-use limits are recorded in
[`education-data-registry.json`](../data/education-data-registry.json).

## What the research base contains

Seven categories of Thai-language research documents, assembled before design work began:

| Category | Contents | Published as |
|---|---|---|
| **01** Graduate unemployment and mismatch | Thai statistics (NSO, NESDC, TDRI, MHESI) and global statistics (OECD, ILO, WEF) | [02 · Research §1](../docs/02-research-and-evidence.md) |
| **02** Thai national curricula | Basic education (สพฐ.), vocational ปวช. 2567, higher education and TCAS | [02 · Research §2](../docs/02-research-and-evidence.md) |
| **03** Career, degree and skills mapping | Five career clusters mapped to tracks, faculties and skills | [02 · Research §3](../docs/02-research-and-evidence.md) |
| **04** Qualitative interviewing research | Socratic, Motivational Interviewing, RIASEC, Ikigai, Laddering, STAR | [02 · Research §4](../docs/02-research-and-evidence.md), [04 · AI System](../docs/04-ai-system.md) |
| **05** NDLP / Ministry of Education | Ministry digital-learning policy. The technical claims previously drawn from this category did not survive the July 2026 audit | [02 · Research §5](../docs/02-research-and-evidence.md), [09 · Source Review](../docs/09-source-review.md) |
| **06** AIS Cloud and infrastructure | Cloud architecture, CAMARA Open APIs, roadmap DAG algorithm | [02 · Research §6](../docs/02-research-and-evidence.md), [05 · Architecture](../docs/05-system-architecture.md) |
| **07** System blueprints and flowcharts | Master operations flowchart, six sub-system flowcharts, implementation plan | [05 · Architecture](../docs/05-system-architecture.md) |

The design process compared eleven web concepts before selecting Aurora; the superseded galleries
are available in Git history rather than the active tree. A separate
[FastAPI prototype](../../02_Backend/) is retained but is not connected to the runnable web
journey. Qdrant and PostgreSQL remain planned production components, not implemented services.

## What was published

- **Rewritten English summaries** of all seven categories, in [`docs/`](../docs/)
- **Four curated Aurora mockups** in [`assets/screenshots/`](../assets/screenshots/) plus current
  production-build captures in [`assets/screenshots/app/`](../assets/screenshots/app/)
- **An experimental 1,000-row bilingual question asset**, generated from 148 base prompts with
  some bases repeated up to 19 times; structurally checked, not imported by the live interview,
  and not content-validated
- **Purpose-built SVG assets** — a bilingual banner pair and the current decision-matrix diagram

## What stayed private, and why

| Excluded | Reason |
|---|---|
| Raw Thai research documents and their PDF exports | Unpublished team research; summarised rather than reproduced |
| Advisor audio recording | A private recording of an identifiable person, shared for team use only |
| Internal agent and workflow notes | Working process artefacts with no value to a reader |
| QLoRA training and test datasets | Known to be defective — identical files, ten examples each. Publishing them would invite misuse. The defect is documented in [04 · AI System](../docs/04-ai-system.md). |
| Remaining ten design concepts | Superseded by the Aurora direction; the comparison is summarised in [03 · User Experience](../docs/03-user-experience.md) |

The published repository intentionally contains no real student responses or credentials.

## Citation

Statistical claims in the published documents cite their primary sources inline. Where a figure
could not be traced to a primary source, it was removed rather than softened; the withdrawn claims
are listed in [02 · Research §7](../docs/02-research-and-evidence.md), and the source audit through
26 July 2026 that
produced most of them is documented in [09 · Source Review](../docs/09-source-review.md).

If you need access to the underlying research for review, evaluation, or academic purposes,
please [open an issue](https://github.com/Pongkarm/Future_Me/issues).

---

[← Back to README](../READMEEN.md)
