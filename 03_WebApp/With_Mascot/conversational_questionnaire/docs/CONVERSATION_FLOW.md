# Conversation flow

How the Buddy talks, and the rules that stop it from saying more than the
instrument supports.

---

## 1. Shape

```
welcome ──► consent ──► asking ──► review ──► result
                          │  ▲        │
                          ▼  │        ▼
                        back/edit   retake
```

`phase` in `ConversationState` is exactly these five values.

## 2. Message types

| Type | From | Announced | Example |
|---|---|---|---|
| `buddy.say` | Buddy | yes | a question or an acknowledgement |
| `user.answer` | learner | yes | the chosen label, echoed back |
| `system.stage` | system | yes | "Interests · 12 of 30" |
| `system.notice` | system | yes | privacy note, safety pause |

Every message stores a **key plus parameters**, never rendered text:

```ts
{ id, role: "buddy", key: "buddy.ackNeutral", params: {}, at: "…" }
```

This is what lets a language switch re-render the whole transcript without
losing anything.

## 3. Opening

**Welcome** — one Buddy message, `wave` pose:

> Hi! I'm your FutureMe Buddy. I'll ask you a few simple questions to understand
> what activities, environments and goals feel right for you.
>
> There are no right or wrong answers — pick the option that feels most like you.
> You can pause, go back or change an answer at any time.

Primary button: **Start exploring**.

**Consent** — a second message, before the first question, carrying the
project's existing privacy position:

> Your answers stay in this browser. Nothing is sent to a server and nobody else
> can see them. You can delete everything at any time.
>
> This is a research-informed prototype, not a validated test, and not a
> diagnosis. It is one way to think about your options, not a limit on them.

Buttons: **I understand — start** · **How my data is used** (links to
`/privacy`).

The second paragraph is a plain-language restatement of `meta.notice` in
`data/questions.json`. It is not optional copy.

## 4. Asking

Per question:

1. `system.stage` if the stage changed.
2. Typing indicator — ≤400 ms, skipped entirely under reduced motion.
3. `buddy.say` with the question text from `questions.json` via `localised()`.
4. Quick replies appear, focus moves to the group.
5. Learner answers → `user.answer` appended, replies disabled for that message.
6. `buddy.say` acknowledgement, ~60 % of the time (deterministic by step index,
   not random — a random Buddy is untestable and feels erratic).
7. Next question.

### Stages

Two only, both labels over the **existing** order:

| Stage | Steps | Label key |
|---|---|---|
| `interests` | the 30 interest items, in bank order | `buddy.stageInterests` |
| `about-you` | the 5 context questions | `buddy.stageAboutYou` |

The RIASEC dimensions are **never** used as stages. The bank is interleaved on
purpose (`meta.itemOrderRationale`, citing O*NET on response bias); grouping by
dimension in the UI would undo that while appearing cosmetic.

## 5. Acknowledgements — the hard rule

Acknowledgements before the review step must be **content-free**. They confirm
that the answer landed. They do not characterise the learner.

Allowed:

- "Got it."
- "Thanks — noted."
- "That's helpful."
- "Okay, next one."

Not allowed anywhere before the result:

- "You seem practical." — a claim from too little evidence
- "You're clearly an Artistic type." — names a dimension
- "You'd enjoy engineering." — steers toward a career
- "Great answer!" — implies a right answer, and the welcome message just said
  there are none

The example in the original brief — *"You seem more comfortable with practical
activities than you expected"* — is exactly the shape this rule forbids. Three
answers cannot support it, and the engine will not recommend anything until 23
of 30 items are answered.

`tests/buddy-script.test.ts` asserts that no pre-result line contains a RIASEC
dimension name, a route name, or a career noun, in either language.

Variety comes from a rotation over four neutral lines, keyed to step index.

## 6. Back and edit

- **Back** re-opens the previous question, pre-selecting the stored answer.
- Editing from the review list marks `editingStepId` and returns there on save,
  matching the existing `returnToReview` behaviour.
- A changed answer rewrites `session.interview` and invalidates any cached
  result, so the recalculation is real rather than displayed from memory.
- Superseded transcript messages are marked `edited` and shown struck through
  rather than deleted, so the transcript stays an honest record.

## 7. Review

Buddy: "Before I put this together — here's what you told me. Change anything
that doesn't look right."

Then the existing `ReviewStep` content in a chat card: every question, the
chosen label, an **Edit** control. Answered count against
`MIN_INTEREST_ANSWERS`, read from the engine.

If fewer than 23 interest items are answered, the Buddy says which ones are
missing and offers to jump to them. It does not offer to submit — the engine
would return `insufficientEvidence`, and the existing flow already treats that
as a real outcome rather than an error.

## 8. Result

Conversational framing, then the existing evidence machinery unchanged.

> Thanks for sharing your answers. I found a few patterns that might help you
> see which environments and activities feel most natural to you.

Then: dimension summary → evidence strength badge → supporting answers →
limitations → next steps (`/mission`, `/routes`) → retake / review.

Language rules, enforced by test:

| Use | Never use |
|---|---|
| "Your answers suggest…" | "This is your perfect career." |
| "You may feel comfortable with…" | "You must become…" |
| "One direction worth exploring…" | "Your personality is…" |
| "This can change as you gain experience." | "You are a [dimension] type." |

The `meta.notice` limitation is restated here, not buried.

## 9. Interruptions

| Situation | Behaviour |
|---|---|
| Refresh mid-assessment | Transcript restored; if it disagrees with the answers, rebuilt from them |
| Return after days | "Welcome back — you were on question 14 of 35." Continue · Start again |
| Safety trigger in free text | Existing `SafetyPause` takes over the screen; transcript preserved |
| Storage unavailable | Buddy says progress cannot be saved this session; assessment still works in memory |
| Transcript corrupt | Silently rebuilt from answers; no learner-facing error |

## 10. No generative AI

Every line is a key in `lib/i18n`. There is no network call in this feature and
no model in the loop. `/api/explain` remains what it is today: an optional
rewording layer for **route explanations**, never for the assessment.
