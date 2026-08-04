# Scoring integration

The single rule: **the conversation collects, the engine scores.**

Nothing in `conversational_questionnaire/` computes a dimension score, applies
reverse keying, weights a criterion, or decides an evidence level.

---

## 1. What already exists

`lib/decision-engine/scoring.ts`:

| Export | Meaning |
|---|---|
| `SCALE_MIN = 1`, `SCALE_MAX = 5` | Scale endpoints, asserted against `questions.json` by `tests/unit/question-bank.test.ts` |
| `applyDirection(raw, direction)` | `direction === "reverse" ? SCALE_MIN + SCALE_MAX - raw : raw` |
| `MIN_INTEREST_RATIO = 0.75` | The **only** completeness floor |
| `MIN_INTEREST_ANSWERS` | `ceil(30 × 0.75)` = **23** — derived, never hardcoded |
| `WEIGHTS` | Five-criterion decision matrix; design judgement, matched to `docs/04-ai-system.md` |

`lib/decision-engine/index.ts`: `recommend(interview, mission)`, `scoreRoute`,
`evidenceStrength`, `markTies`, `ENGINE_VERSION`.

The code comments record a real past bug: `evidenceStrength` once applied its
own hardcoded 0.75 on top of a two-thirds constant, so a learner told "answer at
least 20" could answer exactly 20 and land on an empty routes page. Both now read
one constant. **Restating 23 as a literal anywhere in this feature would
recreate that class of bug.**

## 2. The boundary

```
QuickReplyScale ──► AnswerRecord (raw 1..5)
                         │
                         ▼
                 toInterviewInput()
                         │
                         ▼
              session.interview  ──► recommend()  ──► Recommendation
                                        ▲
                          applyDirection, WEIGHTS,
                          cosine similarity, cut-offs
                          all live here, unchanged
```

## 3. Why answers are stored raw

`applyDirection` runs **inside** the engine. If this layer stored a reflected
value for a reverse item, the reflection would happen twice and land back where
it started — a wrong score with no error.

Today all 30 items are `direction: "positive"`, so a double reflection would be
invisible: `1 + 5 - (1 + 5 - x) = x` only for reverse items, and there are none.
The bug would ship silently and surface months later when the first reverse item
is added.

Guard: `tests/scoring-integration.test.ts` asserts that answering value `v`
stores exactly `v` in `session.interview.interest[id]`, for all five values.

## 4. Reverse scoring test

The live bank has no reverse item, so the test uses a **fixture bank** rather
than editing the instrument:

```ts
const fixture = { ...bank, interest: [
  { id: "FX-R-01", dimension: "R", direction: "reverse", … },
] };
// answering 5 stores 5 …
expect(answers["FX-R-01"].value).toBe(5);
// … and the engine reflects it to 1
expect(applyDirection(5, "reverse")).toBe(1);
```

This proves the contract without touching `data/questions.json`, which
`provenance.test.ts` and `question-bank.test.ts` protect.

## 5. Missing answers

Unanswered items are **omitted** from `interest`, never defaulted.

Writing a neutral 3 for a skipped question would fabricate data and inflate the
answered count past the honesty gate — the engine would recommend routes from
evidence that does not exist. The existing flow omits; so does this one.

Guard: `tests/scoring-integration.test.ts` asserts
`Object.keys(interview.interest).length === answeredCount`.

## 6. Equivalence with the current flow

The strongest available check, and the one that makes "scoring is unchanged" a
verified statement rather than a claim:

```ts
// tests/scoring-equivalence.test.ts
for (const profile of sampleProfiles) {
  const viaSteps = recommend(buildInputTheOldWay(profile), mission);
  const viaChat  = recommend(toInterviewInput(chatAnswers(profile)), mission);
  expect(viaChat).toEqual(viaSteps);
}
```

Run across a spread of profiles including: all-1, all-5, exactly 23 answered
(the gate), 22 answered (below the gate), and a mixed realistic profile.

## 7. Completeness gate in the UI

The review step reads `MIN_INTEREST_ANSWERS` from the engine and shows
`answered / 30, at least 23 needed`. Below the gate, the Buddy lists what is
missing and offers to jump to it — it does not offer to submit. The engine
returning `insufficientEvidence` is a designed outcome, already handled by
`/routes`, not an error state to route around.

## 8. What this feature must never do

- Compute a RIASEC score, even for display.
- Apply `applyDirection` outside the engine.
- Hardcode `23`, `0.75`, `1`, or `5`.
- Name a likely dimension before the result phase.
- Default, interpolate, or impute a missing answer.
- Send answers anywhere. There is no network call in this feature.
