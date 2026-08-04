# Testing plan

Baseline that must never go red: **244 unit/integration tests + 20 e2e**, all
passing at the time of writing.

---

## 1. Layers

| Layer | Runner | Location | What it covers |
|---|---|---|---|
| Reducer / adapter / storage | vitest, `node` env | `conversational_questionnaire/tests/` | All state logic. Pure, no DOM, fast |
| Dialogue rules | vitest | same | Key coverage, the no-interpretation rule, i18n parity |
| Components | **see §2** | TBD | Rendering, keyboard, duplicate submit |
| Journey | Playwright | `e2e/` | Full run, refresh, edit, language switch |

The reducer is deliberately pure so that most of the risk in this feature is
covered by fast tests that need no browser.

## 2. Blocker: there is no DOM testing library

`vitest.config.ts` sets `environment: "node"` and `include: ["tests/**/*.test.ts"]`.
There is no `@testing-library/react`, no `jsdom`, no `happy-dom`. **No component
in this project is currently unit-tested through the DOM** — component behaviour
is covered by Playwright instead.

Three options, to be decided in Phase A before any component test is written:

| Option | Cost | Risk |
|---|---|---|
| **A** Follow the existing pattern: no DOM unit tests, cover components in Playwright | none | Slower feedback; harder to test edge cases like duplicate submit |
| **B** Add `@testing-library/react` + `jsdom` as devDependencies, add a second vitest project | two devDependencies, a config change | Small; both are standard. Must not disturb the existing node-env suite |
| **C** Test the reducer exhaustively and treat components as thin | none | Some component bugs only caught in e2e |

**Recommendation: B, scoped to a second vitest project** so the existing suite
keeps running in `node` and stays fast. If a new dependency is unwelcome, fall
back to C plus extra Playwright coverage — but then the duplicate-submit and
keyboard tests below move to e2e, and that must be an explicit decision rather
than an omission.

Also note `vitest.config.ts` `include` is `tests/**/*.test.ts`, anchored at the
root. Tests inside `conversational_questionnaire/tests/` **will not run** until
that glob is widened. Phase A must do this.

## 3. Required coverage

Mapped to the task's list. ✅ = pure test, 🅱️ = needs the §2 decision,
🎭 = Playwright.

| # | Requirement | Where | Type |
|---|---|---|---|
| 1 | Opening conversation renders | `conversation-machine.test.ts` + 🎭 | ✅🎭 |
| 2 | Advancing to the next question | `conversation-machine.test.ts` | ✅ |
| 3 | Selecting a Likert response | `conversation-machine.test.ts` | ✅ |
| 4 | Duplicate submission prevented | reducer ignores a second answer for an answered step | ✅🅱️ |
| 5 | Back and edit | `conversation-machine.test.ts` | ✅ |
| 6 | Reverse scoring correct | `scoring-integration.test.ts`, fixture bank | ✅ |
| 7 | Final score correct | `scoring-equivalence.test.ts` | ✅ |
| 8 | Save and restore | `transcript-storage.test.ts` + 🎭 refresh | ✅🎭 |
| 9 | Language switch keeps progress | `conversation-machine.test.ts` + 🎭 | ✅🎭 |
| 10 | Restart | `conversation-machine.test.ts` | ✅ |
| 11 | Delete saved data | `transcript-storage.test.ts` + 🎭 | ✅🎭 |
| 12 | Missing translation fallback | `buddy-script.test.ts` | ✅ |
| 13 | Invalid session recovery | `transcript-storage.test.ts` | ✅ |
| 14 | Keyboard navigation | 🅱️ or 🎭 | 🅱️🎭 |
| 15 | Reduced motion | 🎭 (`prefers-reduced-motion` is a Playwright option) | 🎭 |
| 16 | Mobile layout | 🎭 at 390 px | 🎭 |

## 4. Tests that protect the research position

These are the ones that matter most, because a failure here is a correctness or
honesty problem rather than a UI bug.

```ts
// question-adapter.test.ts
it("keeps the bank's interleaved order", () => {
  expect(buildSteps().filter(isInterest).map(s => s.stepId))
    .toEqual(questions.interest.map(i => i.id));
});

// buddy-script.test.ts
it("never names a dimension before the result", () => {
  const dims = ["Realistic","Investigative","Artistic","Social","Enterprising","Conventional"];
  for (const lang of ["en","th"] as const)
    for (const key of preResultKeys)
      for (const d of dims)
        expect(dictionaryFor(lang).buddy[key]).not.toContain(d);
});

// scoring-integration.test.ts
it("stores the raw value, unreflected", () => {
  for (const v of [1,2,3,4,5]) {
    const s = answer(state, "INT-R-01", v);
    expect(toInterviewInput(s.answers).interest["INT-R-01"]).toBe(v);
  }
});

it("omits unanswered items rather than defaulting them", () => {
  const input = toInterviewInput(partial.answers);
  expect(Object.keys(input.interest)).toHaveLength(answeredCount);
});

// scoring-equivalence.test.ts
it("produces the same recommendation as the step flow", () => { … });
```

## 5. Existing suites that must stay untouched and green

`question-bank`, `psychometrics`, `provenance`, `docs-links`, `scoring`,
`engine`, `session-validation`, `pipeline-recovery`, `i18n`, `mission-selection`,
`safety-and-plan`, `mascot`, plus `tests/integration/journey.test.ts`.

If any of these needs changing, that is a signal the redesign has reached into
the assessment framework and should stop.

`i18n.test.ts` will exercise the new `buddy` section automatically, since the
`Dictionary = typeof en` type makes a missing Thai key a compile error.

## 6. e2e

The suite currently queries by `data-testid`, chiefly `q-${itemId}-${value}` and
`interview-continue`. **The chat flow keeps both**, so the existing 20 tests run
against either flow.

New spec `e2e/chat-journey.spec.ts`:

1. Full 35-question run → reaches `/mission`
2. Refresh at question 14 → resumes at 14 with the transcript intact
3. Back, change an answer → review shows the new value
4. Language switch mid-run → answers survive, text changes
5. Delete data → session gone, restart offered
6. Reduced motion → no typing delay
7. 390 px viewport → no horizontal scroll, targets ≥ 48 px
8. Corrupt `futureme.chat.v1` → transcript rebuilt, answers intact

Reminder from the previous piece of work: `playwright.config.ts` runs
`npm run start`, not `npm run dev`. **`npm run build` must run before
`npx playwright test`** or the suite tests a stale build.

## 7. Commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright test        # after a build
```

`npm run verify` chains the first four plus the mascot drift check.

Not to be run: `npm audit fix --force`, or any dependency change beyond the two
devDependencies in §2 option B.

## 8. Definition of done per phase

Every phase ends with `npm run verify` **and** `npx playwright test` green. A
phase that leaves either red is not finished, and the next phase does not start.
