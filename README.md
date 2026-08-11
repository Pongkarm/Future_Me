<a id="top"></a>

**README:** **[EN](README.md)** · [TH](READMETH.md)

<p align="center">
  <img src="03_WebApp/Pre_Present/assets/banner/banner.png" alt="FutureMe AI — explore the next step, not one final answer" width="100%">
</p>

# FutureMe AI

<p align="center">
  <strong>Career and study exploration for Thai students</strong><br>
  Reflect → Try → Compare → Act
</p>

<p align="center">
  <a href="#how-the-project-works">How it works</a>
  &nbsp;·&nbsp;
  <a href="#current-status">Current status</a>
  &nbsp;·&nbsp;
  <a href="#repository-guide">Repository</a>
  &nbsp;·&nbsp;
  <a href="#run-locally">Run locally</a>
  &nbsp;·&nbsp;
  <a href="#quick-faq">FAQ</a>
</p>

---

## Overview

FutureMe is a decision-support prototype for Thai lower-secondary, upper-secondary, and vocational
students. It combines a 30-question interest reflection whose first answer selects two follow-up
items, a short scenario mission, explainable
comparison of up to three study or career-route hypotheses, a province-aware nearby-institution
lookup, and a reversible 30-day action plan. It does not choose one “perfect career,” guarantee
admission, or claim that a listed institution offers a particular programme.

| Question | Answer |
|---|---|
| **Who is it for?** | Thai students exploring their next study or career direction |
| **What does it produce?** | Zero to three route hypotheses with reasons, limitations, comparisons, nearby-institution information, and a 30-day plan |
| **What runs in this demo?** | 30 live interest questions with rule-based follow-up ordering, 3 missions, 12 illustrative routes, and 1,961 nearby-institution records across all 77 provinces |
| **Does AI decide the result?** | No. A deterministic rule engine selects routes; optional AI may only explain them or answer bounded repository questions |
| **Is it production-ready?** | No. It is a runnable, tested hackathon prototype that still needs validated data and a real-student pilot |

### Latest web app preview

Captured from this repository's production build on 9 August 2026. They cover the
integrated learner flow; source code and automated tests remain the authoritative implementation record.

<table>
  <tr>
    <th>Landing</th>
    <th>Interview</th>
  </tr>
  <tr>
    <td><a href="03_WebApp/Pre_Present/assets/screenshots/app/landing-2026-08-09.png"><img src="03_WebApp/Pre_Present/assets/screenshots/app/landing-2026-08-09.png" alt="Latest FutureMe landing page" width="100%"></a></td>
    <td><a href="03_WebApp/Pre_Present/assets/screenshots/app/interview-2026-08-09.png"><img src="03_WebApp/Pre_Present/assets/screenshots/app/interview-2026-08-09.png" alt="Latest FutureMe mascot-led interview" width="100%"></a></td>
  </tr>
  <tr>
    <th>Routes</th>
    <th>30-day plan</th>
  </tr>
  <tr>
    <td><a href="03_WebApp/Pre_Present/assets/screenshots/app/routes-2026-08-09.png"><img src="03_WebApp/Pre_Present/assets/screenshots/app/routes-2026-08-09.png" alt="Latest FutureMe route exploration results" width="100%"></a></td>
    <td><a href="03_WebApp/Pre_Present/assets/screenshots/app/plan-2026-08-09.png"><img src="03_WebApp/Pre_Present/assets/screenshots/app/plan-2026-08-09.png" alt="Latest FutureMe 30-day exploration plan" width="100%"></a></td>
  </tr>
</table>

---

## How the project works

### Complete workflow

```mermaid
flowchart LR
    A["Official sources"] --> B["Source audit + demo data"]
    B --> C["Answer-driven interview + mission"]
    C --> D["Deterministic rule engine"]
    D --> E["0–3 routes + comparison"]
    E --> F["Reversible 30-day plan"]
    F --> G["Student pilot + validation"]
    G -. "revise from evidence" .-> B
    G --> H["Production services"]

    I["Optional bounded AI"] -. "explain only" .-> E
    J["FastAPI prototype"] -. "future integration" .-> D

    classDef working fill:#d1fae5,stroke:#047857,color:#064e3b;
    classDef validating fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef planned fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,C,D,E,F,I,J working;
    class G validating;
    class H planned;
```

The end-to-end prototype is runnable (green). Real-student validation is next (yellow). Production
accounts, permanent storage, and deployment remain planned (red).

### Student journey

| Step | What happens |
|---|---|
| **1. Reflect** | Answer 30 RIASEC-shaped interest items. The first answer selects two immediate follow-ups; four required context questions and one optional prompt follow |
| **2. Try** | Complete one of three short scenario missions |
| **3. Explore** | The rule engine checks the evidence and returns zero to three routes |
| **4. Compare** | Compare every route using the same three scored criteria, with practical estimates labelled separately |
| **5. Act** | Choose one route to explore through a reversible 30-day plan |

### Recommendation logic

The current design weights are:

`Interests 50% · Mission evidence 30% · Learning-environment affinity 20%`

The last component is a team-defined projection of the same interview profile onto a route's
learning environment. It is not a learning-styles test and is not independent evidence.

The engine can refuse to recommend, show ties, and identify contradictions. These weights are
product rules, not validated psychometric findings.

Cost, relocation, time-to-earning, and flexibility are unverified planning prompts. They remain
visible for discussion but do not score, rank, or remove a route.

### AI, privacy, and data flow

- Assessment, mission, route, and plan data stay in browser storage by default.
- Route selection works without an account, database, backend, or API key.
- Optional AI can reword fixed explanations or answer bounded repository questions. It cannot change routes.
- A funded provider key must not be exposed publicly without authentication, rate limits, spend controls, and reviewed retention terms.

---

## Architecture

| Component | Role | Current state |
|---|---|---|
| **Next.js web app** | Student journey, local session, decision engine, comparison, plan, and chat UI | ✅ Runnable |
| **Demo inputs** | 30 live interest questions, 3 missions, 12 illustrative routes, and a 77-province nearby-institution lookup | 🟡 Research-informed prototype data |
| **Research layer** | Source audit, curricula, labour data, claim status, and technical research | 🟡 First audit complete |
| **FastAPI backend** | Mission and future-path API reference with in-memory storage | 🟡 Separate prototype |
| **Optional AI** | Bounded chat and explanation rewording | 🟡 Optional |
| **Production services** | Accounts, permanent database, RAG, school tools, and cloud deployment | 🔴 Planned |

The current web app is the product source of truth. The FastAPI backend is not required by or wired
into the main demo journey. Some backend files still use the older name **FuturePath AI**; the
current product name is **FutureMe AI**.

---

<a id="current-status"></a>

## Current status

### ✅ Working now

- Complete guest journey from assessment to a 30-day plan
- Deterministic first-answer follow-ups that reorder two reviewed items without changing the 30-item bank or scoring
- English and Thai interfaces, responsive layouts, and light/dark/system themes
- Deterministic scoring, refusal gates, ties, provenance, and freshness warnings
- Local persistence, deletion controls, optional research export, and analysis scripts
- Mascot animation enabled by default across the journey, with a persisted system-motion opt-out
- Twelve illustrative routes and province-aware nearby-institution views that do not claim a specific programme is offered
- Mascot sync, typecheck, lint, unit/integration tests, production build, and browser journeys are included in the repository checks

### 🟡 Needs validation

- The question set and Thai adaptation have not been validated with real students.
- The restored 1,000-item future bank passes structural checks but is not used live; its wording, fairness, scoring, and branching still require expert and student validation.
- The three first-answer branches are transparent product heuristics, not CAT, IRT, or evidence that the assessment is more accurate.
- Route costs, relocation, time-to-earning, flexibility, strengths, and limitations include team estimates; the first four are held out of route decisions.
- The institution register keeps 207 missing or quarantined coordinates and 987 missing websites as unknown instead of inventing values.
- Route and programme metadata need recurring source review; source dates, full checksums, and automated integrity checks are recorded with the geography data.
- Research has passed a first source audit, not a guarantee of permanent accuracy.
- Automated integration checks pass, but source-data review and a real-student pilot are still required.

### 🔴 Not implemented

- Real accounts, permanent server storage, and production authentication
- Parent and counsellor dashboards
- Live school, TCAS, NDLP/DEEP, or AIS API integration
- Production RAG, cloud deployment, ethics approval, and a real-student pilot

---

<a id="repository-guide"></a>

## Repository guide

Only the active product, evidence, and reproducible deliverables remain:

| Path | Purpose |
|---|---|
| [`01_Research/`](01_Research/) | Audited evidence, questionnaire research, and geography/data pipelines |
| [`02_Backend/`](02_Backend/) | Separate FastAPI prototype and tests |
| [`03_WebApp/Pre_Present/`](03_WebApp/Pre_Present/) | Current runnable FutureMe product and its automated tests |
| [`04_Design/FutureMe_Mascot_Lab/`](04_Design/FutureMe_Mascot_Lab/) | Canonical mascot assets synchronized into the web app |
| [`Presentation/`](Presentation/) | Editable deck, PDF, generator, and QA notes |

Historical snapshots, superseded design concepts, generated renders, private source media, and
agent working logs are intentionally excluded from this branch. Deleted tracked files remain
recoverable from Git history.

---

<a id="run-locally"></a>

## Run locally

Requirements: Node.js 20 or newer.

```bash
cd 03_WebApp/Pre_Present
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Start as guest**.

---

<a id="quick-faq"></a>

## Quick FAQ

<details>
<summary><strong>Can I use the demo without AI or the backend?</strong></summary>

Yes. The complete student journey runs locally in the browser without either one.
</details>

<details>
<summary><strong>Does FutureMe guarantee admission or employment?</strong></summary>

No. Routes are hypotheses to explore, not predictions or guarantees.
</details>

<details>
<summary><strong>Is this a validated RIASEC test?</strong></summary>

No. It uses the RIASEC structure for reflection, but this item set and its Thai adaptation still require validation.
</details>

<details>
<summary><strong>Does the live interview use the restored 1,000-item bank?</strong></summary>

No. That bilingual bank is preserved and structurally checked for later research. The live interview
still uses all 30 reviewed items in `questions.json`; the first answer only chooses which two of
those items appear next. This is deterministic rule-based ordering, not CAT or IRT.
</details>

<details>
<summary><strong>Where is learner data stored?</strong></summary>

Assessment, mission, and plan state stays in the current browser's `localStorage`; the prototype
has no application database or server-side transcript store. Explanation requests send only a
route id and fixed reason codes. Chat sends a bounded transcript only when the learner presses
Send and may reach the configured provider. Deployment infrastructure may still keep request logs.
</details>

<details>
<summary><strong>Which architecture is implemented, and which parts are only proposed?</strong></summary>

The implemented product is a Next.js/TypeScript guest app with a client-side decision engine and
browser storage. FastAPI, PostgreSQL, Qdrant, BGE-M3, Kubernetes, AIS Cloud, identity, and school
integrations are documented production designs, not running components. See the
[architecture boundary](03_WebApp/Pre_Present/docs/05-system-architecture.md).
</details>

<details>
<summary><strong>Can a recommendation be reproduced and audited?</strong></summary>

Yes. The same validated inputs and catalogue produce the same routes because scoring, filters,
ties, and refusal gates are deterministic TypeScript. The UI exposes the engine version,
catalogue date, reasons, unknowns, and provenance. The fixed weights are design judgement, not
parameters fitted to outcome data; automated tests verify implementation behaviour, not real-world validity.
</details>

<details>
<summary><strong>How are route-data lineage and freshness handled?</strong></summary>

The seeded catalogue records a source status, source URL, and last-verified date per route, plus a
catalogue-wide `dataAsOf` date and 180-day freshness threshold. The UI warns when data is stale and
identifies unsourced fields. Cost, relocation, time-to-earning, and flexibility are held out of
decisions; strengths and limitations remain illustrative copy. The geography registry records full
checksums and `npm run check:data` verifies its cross-file integrity. See the
[source review](03_WebApp/Pre_Present/docs/09-source-review.md).
</details>

<details>
<summary><strong>What evidence is still required before a real-student pilot?</strong></summary>

The project needs ethics approval, parental consent and student assent, formal Thai adaptation,
cognitive interviews, a representative pilot, reliability and structural analysis, subgroup
invariance checks, and licensed current route data. Recommendation weights then need calibration
against observed exploration outcomes. See the
[validation plan](03_WebApp/Pre_Present/docs/validation-plan.md).
</details>

<details>
<summary><strong>How should product success be measured?</strong></summary>

Use evidence of better decisions, not model confidence or click volume: completion of the 30-day
experiments, follow-through on route research, changes in decision confidence, counsellor review,
and whether learners can explain their next step and its trade-offs. Longer-term evaluation should
track enrolment or persistence without treating one route as the universal correct answer.
</details>

<details>
<summary><strong>Where are the main documents?</strong></summary>

[Web README](03_WebApp/Pre_Present/READMEEN.md) ·
[Architecture](03_WebApp/Pre_Present/docs/05-system-architecture.md) ·
[Source review](03_WebApp/Pre_Present/docs/09-source-review.md) ·
[Research guide](01_Research/Data/README.md) ·
[Presentation PDF](Presentation/FutureMe_Project_Presentation.pdf)
</details>

---

FutureMe is a student-built exploration prototype for JUMP THAILAND Hackathon 2026. It cannot
predict admission, employment, income, or mental-health risk and should not replace official,
current information or human guidance.

<p align="center"><a href="#top">Back to top</a></p>
