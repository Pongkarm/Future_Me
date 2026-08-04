# Existing system analysis

Read of the live code in `03_WebApp/With_Mascot`, 2 August 2026, before any file
was modified. Everything below was checked against source, not assumed.

Baseline at time of analysis: `npm run verify` passes (244 unit/integration
tests, typecheck, lint, build); `npx playwright test` passes (20 e2e).

---

## 1. What the assessment actually is

**Holland RIASEC vocational interests**, declared in `data/questions.json` →
`meta`:

| Field | Value |
|---|---|
| `id` | `futureme-interest-v2` |
| `construct` | Holland RIASEC vocational interests |
| Interest items | **30** — exactly 5 per dimension (R, I, A, S, E, C) |
| Scale | 5 points, `1 Strongly dislike` … `5 Strongly like`, both languages |
| Item order | `interleaved` — dimensions rotated, never blocked |
| Context questions | **5** (`tier`, `cost`, `mobility`, `horizon`, `proud`) |
| `sourceType` | `adapted-18rest` or `researcher-written`, per item |

The `meta.notice` is important and must survive the redesign verbatim:

> Research-informed prototype instrument … This specific item set and its Thai
> translation have **NOT** been psychometrically validated: no reliability or
> validity data exist for it. It must not be presented as a validated RIASEC
> test.

`meta.attribution` credits Ambiel et al. (2018), 18REST, CC BY 4.0.
`meta.itemOrderRationale` cites O*NET on interleaving reducing response bias.

**Consequence for this work:** the item order is a research decision, not a
layout decision. A conversational flow that groups questions by dimension
("now let's talk about Artistic…") would silently undo it. See risk R1.

## 2. Scoring — the part that must not move

`lib/decision-engine/scoring.ts`:

- `SCALE_MIN = 1`, `SCALE_MAX = 5`, asserted against `questions.json` by
  `tests/unit/question-bank.test.ts`.
- `applyDirection(raw, direction)` reflects reverse-keyed items about the
  midpoint: `direction === "reverse" ? SCALE_MIN + SCALE_MAX - raw : raw`.
- **Every item in the bank is currently `direction: "positive"` — there are zero
  reverse-scored items today.** The mechanism exists and is tested; nothing
  uses it yet. Reverse scoring must therefore be carried through by *data*, not
  reimplemented.
- `MIN_INTEREST_RATIO = 0.75` → `MIN_INTEREST_ANSWERS = ceil(30 × 0.75) = 23`.
  This is the single completeness floor; the code comments record a past bug
  where a second hidden floor contradicted the number shown to the learner.
- `WEIGHTS` are documented as design judgement, matched to `docs/04-ai-system.md`.
- `interestFit` uses cosine similarity; the evidence cut-offs are
  percentile-matched to an earlier calibration over 93,744 profile-route pairs.

`lib/decision-engine/index.ts` exposes `recommend(interview, mission)`,
`scoreRoute`, `evidenceStrength`, `markTies`, `ENGINE_VERSION`, `MAX_ROUTES`.

**Consequence:** the conversational layer must collect answers into the same
`InterviewInput` and call `recommend()`. It must not compute a score itself.

## 3. Data contract

```ts
// lib/decision-engine/types.ts
interface InterviewInput {
  interest: Record<string, number>;   // itemId -> 1..5 raw response
  context: {
    tier?: Tier; cost?: CostAnswer; mobility?: Mobility;
    horizon?: Horizon; proud?: string;
  };
}
```

Interest answers are stored **raw**. Direction is applied at scoring time. A
conversational UI that stored a "corrected" value would double-apply reversal
the day a reverse item is added.

## 4. Persistence

`lib/session/index.ts`:

- `SESSION_KEY = "futureme.guest.v1"`, `SESSION_VERSION = 3`,
  `READABLE_VERSIONS = [1, 2, 3]`.
- `GuestSession` = `{ version, id, createdAt, updatedAt, interview, mission,
  selectedRouteId, planProgress, safetyTriggered }`.
- `parseSession()` returns a `LoadStatus` of `ok | repaired | reset | empty` —
  hand-edited storage is repaired field by field, never trusted wholesale.
- `loadSessionResult()`, `saveSession()`, `clearSession()`, `loadOrCreate()`.

**This is a real, versioned, defensive persistence layer with tests
(`session-validation.test.ts`, `pipeline-recovery.test.ts`). The conversational
flow must use it, not invent a second store.** Conversation *transcript* state
is presentation and can live in a separate key, but answers must land in
`GuestSession.interview`.

## 5. Current questionnaire flow

`app/interview/page.tsx` — 580 lines, one component.

- `STEPS` = 30 interest steps + 5 context steps + 1 review step = 36 screens.
- `stepIndex` state, `direction` for the enter animation, `returnToReview` so
  editing from the review list returns there.
- Resumes at `firstUnansweredStep()` on mount — a refresh does not restart.
- Focus is moved into the new step's radiogroup after each transition; steps
  without one fall back to the question heading.
- `advanceDelay()` returns 0 under `prefers-reduced-motion`, otherwise 170 ms.
- Safety: `checkText()` on free text → `SafetyPause`.
- Telemetry: `markSeen(itemId, position)` and `recordAnswer(itemId, position)`,
  local-only, exported only by a deliberate action on `/research`.

Components in `components/assessment/`: `LikertScale` (188 lines),
`ChoiceList`, `QuestionCard`, `ReviewStep`, `ProgressBar`, `AssessmentHeader`,
`AssessmentNavigation`, `AnswerOption`, `types.ts`.

`LikertScale` is a proper `role="radiogroup"` with roving tabindex, Arrow/Home/
End handling, and a dot that grows across the scale so the row reads without
colour. **It is already good. The redesign should reuse its interaction model
rather than write a new one.**

## 6. Internationalisation

`lib/i18n/`: `en.ts` is the source dictionary, `Dictionary = typeof en`, so
`th.ts` fails to compile if a key is missing — no silent English fallback.
Helpers: `dictionaryFor(lang)`, `format(template, values)`,
`localised({en, th}, lang)`.

Question text is bilingual **in the data file**, not in the dictionary.
`t.assessment.*` holds the surrounding chrome.

Language lives in `lib/preferences` (`lang: "en" | "th"`, default **`en`**),
applied to `<html lang>` before first paint by the inline script in
`app/layout.tsx`. Switching language does not touch the session.

**Consequence:** Buddy dialogue is chrome → belongs in `lib/i18n`. Question text
is data → stays in `questions.json`. `tests/unit/i18n.test.ts` already guards
dictionary parity.

## 7. Theme

`app/globals.css` defines light and dark as *designed* palettes, not inversions,
with measured contrast notes. `data-theme` on `<html>`; `tailwind.config.ts` maps
every colour through `rgb(var(--token) / <alpha-value>)`, so no `dark:` variants
are needed anywhere. Default is `system`.

`globals.css` also carries a global `prefers-reduced-motion` rule using
`!important`, and components use Tailwind's `motion-safe:` variant.

**Consequence:** chat bubbles must be built from existing tokens
(`surface`, `surface2`, `line`, `ink`, `muted`, `mint`, `indigo`, `magenta`,
`warning`, `coral`). No new hex values.

## 8. The Buddy Model — already integrated

Added in the previous piece of work; see
`04_Design/FutureMe_Mascot_Lab/docs/integration-plan.md`.

- `lib/mascot/mascot.js` — the character, synced from the design lab and
  drift-checked by `scripts/sync-mascot.mjs` inside `npm run verify`.
- `app/mascot.css` — emotion map, 9 poses, motion switches.
- `lib/mascot/states.ts` — `MascotEmotion`, `MascotPose`, `MASCOT_SCALE`,
  `MASCOT_PRODUCT_STATES`, `mascotFaceSrc()`, `emotionForValue()`.
- `components/mascot/FutureMeMascot.tsx` — live component; `uid` from `useId()`
  so gradient ids survive hydration.
- `public/mascot/futureme_mascot_face_*.svg` — the five static faces.
- Already used on `/interview` (loading), `/routes`, `/plan`, and `Notice`.

**Five emotions map one-to-one onto the five scale points already**
(`MASCOT_SCALE`). The conversational quick replies get this for free.

Poses available and unused so far: `wave`, `listen`, `point-left`, `jump`, `sit`.

## 9. Tests and known limits

13 suites, 244 tests. Directly relevant:

| Suite | Guards |
|---|---|
| `question-bank.test.ts` | item count, per-dimension balance, scale bounds, bilingual completeness |
| `psychometrics.test.ts` | instrument-level properties |
| `scoring.test.ts`, `engine.test.ts` | direction handling, weights, ties, cut-offs |
| `session-validation.test.ts`, `pipeline-recovery.test.ts` | storage repair paths |
| `i18n.test.ts` | dictionary parity |
| `provenance.test.ts`, `docs-links.test.ts` | research references and doc links resolve |
| `mascot.test.ts` | state vocabulary, hydration-safe ids |

`e2e/journey.spec.ts` (20 tests) drives the real flow and queries almost
entirely by `data-testid` — notably `q-${itemId}-${value}` for scale buttons and
`interview-continue`. **Any redesign must keep those test ids or update the
suite deliberately.**

### Limitations found

1. `app/interview/page.tsx` is a 580-line component holding routing, safety,
   telemetry, focus management and rendering. It is the main thing that makes
   this redesign awkward.
2. No conversational or chat component exists anywhere in the project.
3. No generative AI is involved in the assessment. `/api/explain` is an
   *optional* rewording layer for route explanations only, and the UI hides its
   control when unconfigured. The assessment has never depended on it and must
   not start.
4. There is no `aria-live` announcement when the step changes — the flow relies
   on moving focus instead. A chat transcript needs a real live region.
5. `proud` is free text and is the only safety-checked field.

## 10. Reuse decision

| Reuse unchanged | Adapt | Build new |
|---|---|---|
| `data/questions.json` — the instrument | `LikertScale` interaction model → quick replies | Chat transcript + message list |
| `lib/decision-engine/*` — all scoring | `ReviewStep` → conversational review | Buddy dialogue script (rule-based) |
| `lib/session/*` — answers and versioning | Progress display → stage-aware | Conversation state (separate key) |
| `lib/i18n/*` — add a `buddy` section | `app/interview/page.tsx` → thin route wrapper | Typing indicator, message a11y |
| `lib/mascot/*` + `FutureMeMascot` | — | — |
| `lib/safety`, `lib/research/telemetry` | — | — |

Nothing in the assessment framework needs replacing. The redesign is a
presentation layer over an instrument and an engine that already work.
