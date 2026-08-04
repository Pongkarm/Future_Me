# Implementation plan — conversational questionnaire

Companion documents: `EXISTING_SYSTEM_ANALYSIS.md` (what is there today),
`CONVERSATION_FLOW.md`, `QUESTION_DATA_MODEL.md`, `SCORING_INTEGRATION.md`,
`ACCESSIBILITY_CHECKLIST.md`, `TESTING_PLAN.md`, `MIGRATION_GUIDE.md`.

Status: **implemented.** Phases A–F are done and green; the flow ships behind
`NEXT_PUBLIC_CHAT_ASSESSMENT`. What actually got built, including the places
this plan turned out to be wrong, is recorded in [`../../HANDOVER.md`](../../HANDOVER.md).

---

## 1. Existing system analysis

Summarised from `EXISTING_SYSTEM_ANALYSIS.md`. The five facts that shape every
decision below:

1. The instrument is 30 RIASEC items + 5 context questions in
   `data/questions.json`, deliberately **interleaved** by dimension for research
   reasons, with a `meta.notice` saying it is *not* validated.
2. Scoring lives in `lib/decision-engine`. Answers are stored **raw**; direction
   is applied at scoring time. There are currently **zero** reverse-keyed items,
   but the mechanism exists and is tested.
3. `lib/session` is a versioned, self-repairing localStorage layer. Answers must
   go there.
4. The Buddy Model is already integrated, with five emotions that map one-to-one
   onto the five scale points.
5. `e2e/journey.spec.ts` drives the flow through `data-testid` values —
   `q-${itemId}-${value}` and `interview-continue` in particular.

## 2. Proposed conversation flow

Full detail in `CONVERSATION_FLOW.md`. Shape:

```
welcome → consent → [ stage intro → question → answer → ack ] × 35 → review → result
                              ↑                                ↓
                              └──── back / edit ───────────────┘
```

- One question per Buddy message. Never a list.
- Acknowledgements are short, rule-based, and **never interpret the result**.
- Stages (`Interests` / `About you`) are labels over the *existing* order. The
  interleaving is preserved: no regrouping by RIASEC dimension.

## 3. Component architecture

Small components, none over ~120 lines. The 580-line page is the problem being
solved, not a pattern to copy.

```
conversational_questionnaire/
├── components/
│   ├── ChatWindow.tsx          scroll container + live region
│   ├── MessageList.tsx         renders the transcript
│   ├── BuddyMessage.tsx        Buddy bubble + optional mascot
│   ├── UserMessage.tsx         the learner's answer, echoed back
│   ├── TypingIndicator.tsx     three dots, skipped under reduced motion
│   ├── QuickReplyScale.tsx     5-point quick replies (radiogroup)
│   ├── QuickReplyChoice.tsx    single-choice context questions
│   ├── TextReply.tsx           optional free text (`proud`)
│   ├── ChatProgress.tsx        subtle stage + count
│   ├── ChatControls.tsx        back · restart · delete · review
│   └── ConversationReview.tsx  answer list before submitting
├── hooks/
│   ├── useConversation.ts      reducer wrapper, the only public entry point
│   └── useAutoScroll.ts        keeps the newest message visible
├── lib/
│   ├── conversation-machine.ts pure reducer — no React, no storage
│   ├── buddy-script.ts         which message key fires when
│   ├── transcript-storage.ts   separate localStorage key, versioned
│   └── question-adapter.ts     questions.json → ConversationStep[]
├── types/index.ts
├── data/buddy-lines.ts         message *keys* only; text lives in lib/i18n
├── tests/
└── docs/
```

`app/interview/page.tsx` becomes a thin wrapper that renders either the existing
step flow or the chat flow. Chat components stay in this folder until Phase F.

**Deviation from the suggested structure:** no `data/` questions file of our own
— the instrument stays in `data/questions.json`. `data/buddy-lines.ts` holds
only dialogue *keys*, because putting user-facing text there would break the
project's rule that translatable strings live in `lib/i18n`.

## 4. Question and response data structure

Full detail in `QUESTION_DATA_MODEL.md`. The adapter maps the existing bank into
a uniform step type; it does not edit `questions.json`.

```ts
type ConversationStep =
  | { kind: "interest"; item: InterestItem; responseType: "likert" }
  | { kind: "context"; item: ContextQuestion; responseType: "single" | "text" }
  | { kind: "review" };

interface AnswerRecord {
  stepId: string;
  value: number | string;
  affectsResult: boolean;   // true for scored items, false for follow-ups
  answeredAt: string;
}
```

`affectsResult` is carried explicitly so an unscored follow-up can never leak
into `InterviewInput`.

## 5. Scoring integration

Full detail in `SCORING_INTEGRATION.md`. One rule: **the conversational layer
collects, the engine scores.**

- Interest answers → `session.interview.interest[itemId] = rawValue` (1–5, raw).
- Context answers → `session.interview.context[id]`.
- Results come from `recommend(session.interview, session.mission)` — unchanged.
- Nothing in this folder applies `applyDirection`, weights, or cut-offs.
- The completeness gate stays `MIN_INTEREST_ANSWERS` (23 of 30), read from the
  engine, never re-stated as a literal.

## 6. State management

A pure reducer in `lib/conversation-machine.ts`; React only holds it.

```ts
interface ConversationState {
  sessionId: string;
  stepIndex: number;
  answers: Record<string, AnswerRecord>;
  transcript: Message[];
  phase: "welcome" | "consent" | "asking" | "review" | "result";
  editingStepId: string | null;
  status: "idle" | "typing" | "saving";
}
```

Two stores, deliberately:

| Store | Key | Holds | Why |
|---|---|---|---|
| Existing session | `futureme.guest.v1` | answers, mission, plan | already versioned, repaired and tested |
| Transcript | `futureme.chat.v1` | messages, phase, stepIndex | presentation; losing it must not lose answers |

If the transcript is missing or corrupt, it is **rebuilt from the answers** and
the learner continues. The transcript is never the source of truth.

## 7. Progress saving and restoration

- Answers persist through `saveSession()` on every answer — same as today.
- Transcript persists debounced (~300 ms) to `futureme.chat.v1`.
- On load: read session → read transcript → if the transcript disagrees with the
  answers, discard the transcript and replay from answers.
- Controls: **Continue**, **Restart**, **Delete my answers**, **Review**.
  Delete calls the existing `clearSession()` plus the transcript key.

## 8. Thai and English

- Buddy dialogue → new `buddy` section in `lib/i18n/en.ts` + `th.ts`. The
  `Dictionary = typeof en` type makes a missing Thai key a compile error.
- Question and option text → stays bilingual in `questions.json` via
  `localised()`.
- Scale labels come from `questions.json.scale`, already bilingual.
- Switching language re-renders the transcript from message **keys**, so nothing
  is lost and no answer changes. This is the reason the transcript stores keys
  and parameters rather than rendered strings.

## 9. Light and dark

Only existing tokens. Bubbles: Buddy on `surface2`, learner on `mint/10` with a
`mint` border; both `text-ink`. No new hex. Verified in both themes at the end
of every phase, dark first because it is the product default.

## 10. Accessibility

Full checklist in `ACCESSIBILITY_CHECKLIST.md`. Load-bearing decisions:

- The transcript is a `role="log"` `aria-live="polite"` region. Only new
  messages are announced; the mascot sits outside it so its animation never
  re-triggers an announcement.
- Quick replies reuse the existing `LikertScale` interaction contract:
  `role="radiogroup"`, roving tabindex, Arrow/Home/End.
- Selection is shown by **shape and text**, never colour alone.
- Focus moves to the new quick-reply group after each question, matching what
  the step flow already does.
- `prefers-reduced-motion`: typing indicator skipped, no auto-scroll animation,
  messages appear immediately. Answering never becomes slower than the current
  flow.

## 11. Mobile and desktop

- Column capped at `max-w-2xl`, centred.
- Quick replies: vertical stack on mobile with ≥48px targets; horizontal row of
  five from `sm:` up, which is where the mascot faces also appear (below that
  they would fall under the 96px legibility floor — the same rule the current
  scale follows).
- Composer pinned to the bottom on mobile with `env(safe-area-inset-bottom)`;
  scroll container sized with `dvh`, not `vh`, so the URL bar cannot hide it.
- The Buddy sits beside the newest message, not as a fixed decoration.

## 12. Testing strategy

Full plan in `TESTING_PLAN.md`. Summary: unit tests for the reducer (pure, fast,
no DOM), component tests for the interactive pieces, e2e for the journey.

The existing 244 tests must keep passing untouched. New tests cover every item
in the task's testing list, including reverse scoring (asserted through the
engine, on a fixture item, since the live bank has none).

**Blocker to resolve in Phase A:** the project has no DOM testing library —
`vitest.config.ts` sets `environment: "node"` and there is no
`@testing-library/react`. Component tests therefore need either a new devDependency
or to be pushed to Playwright. Decision recorded in `TESTING_PLAN.md` §2.

## 13. Migration and integration

Full detail in `MIGRATION_GUIDE.md`.

1. Chat flow ships behind `NEXT_PUBLIC_CHAT_ASSESSMENT`, default **off**.
2. `/interview` renders the existing flow unless the flag is on.
3. Both flows write the same `GuestSession`, so `/mission`, `/routes`, `/compare`
   and `/plan` need no changes and a learner can switch mid-assessment.
4. e2e `data-testid` values are **preserved**: `q-${itemId}-${value}` on quick
   replies, `interview-continue` on the advance control. The existing suite then
   passes against either flow.
5. Files move from `conversational_questionnaire/` into `components/` and `lib/`
   only after the flag has been on by default for a full review cycle.

## 14. Risks and fallbacks

| # | Risk | Why it matters | Mitigation |
|---|---|---|---|
| R1 | Grouping questions by RIASEC dimension to make the chat feel themed | Silently undoes the interleaving that `meta.itemOrderRationale` justifies from O*NET | Order comes from `questions.json` only. Test asserts step order equals bank order. |
| R2 | Buddy acknowledgements sounding like results | "You seem practical!" after 3 items is an unsupported claim, and the product's honesty gates exist precisely to prevent this | Acknowledgements are content-free before the review step. Test asserts no dimension name appears in any pre-result line. |
| R3 | Double-applying reverse scoring | Storing a "corrected" value breaks the day a reverse item is added | Store raw. Test asserts stored value equals the button's value. |
| R4 | Transcript treated as source of truth | A corrupt transcript would lose real answers | Answers in `futureme.guest.v1`; transcript rebuilt from answers on mismatch. |
| R5 | e2e suite breaking | 20 tests gate the release | Keep the test ids; run `npx playwright test` every phase. |
| R6 | Chat becoming slower than the form | 35 questions × a typing delay is a worse experience, not a better one | Typing indicator ≤400 ms, 0 under reduced motion; quick replies enabled immediately, not after the animation. |
| R7 | Needing a generative API | The task forbids it and the assessment has never used one | All dialogue is rule-based keys in `lib/i18n`. No network call in this folder. |
| R8 | `aria-live` spam | Every re-render re-announcing makes it unusable with a screen reader | Only appended messages are live; the mascot lives outside the region. |
| R9 | Missing DOM test library | Component tests cannot run today | Resolve in Phase A before writing component tests. |
| R10 | Two flows drifting | Bug fixed in one, not the other | Both read the same adapter and write the same session; shared logic stays in `lib/`. |

**Global fallback:** clearing `NEXT_PUBLIC_CHAT_ASSESSMENT` returns every
learner to the current flow without a code change or a restore.

---

## Phasing

Small, each ending green on `npm run verify` + `npx playwright test`.

| Phase | Scope | Ends when |
|---|---|---|
| **A** Foundations | types, `question-adapter`, `conversation-machine`, `transcript-storage`, unit tests; decide the DOM-test question | Reducer fully tested, zero UI |
| **B** Dialogue | `buddy` i18n section (en + th), `buddy-script`, tests for key coverage and the no-interpretation rule | Dictionary parity test passes |
| **C** Chat shell | `ChatWindow`, `MessageList`, `BuddyMessage`, `UserMessage`, `TypingIndicator`, live region | Transcript renders in both themes |
| **D** Answering | `QuickReplyScale`, `QuickReplyChoice`, `TextReply`, back/edit, duplicate-submit guard | A full 35-question run writes a correct `InterviewInput` |
| **E** Review & result | `ConversationReview`, conversational result, limitations copy, next steps | Results match the step flow for identical answers |
| **F** Integration | flag, `/interview` wrapper, e2e against both flows, a11y and mobile pass, screenshots | Flag on by default, all checks green |

Phase A does not start until this plan is reviewed.
