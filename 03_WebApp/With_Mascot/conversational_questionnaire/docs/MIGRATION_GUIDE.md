# Migration guide

How the conversational assessment reaches learners, and how to take it back out.

---

## 1. Principle

Both flows write the **same** `GuestSession`. That single decision is what makes
this migration reversible, testable, and safe to ship half-finished:

- `/mission`, `/routes`, `/compare`, `/plan` need no changes at all
- a learner can start in one flow and finish in the other
- rolling back is an environment variable, not a restore

## 2. Feature flag

```bash
# .env.local
NEXT_PUBLIC_CHAT_ASSESSMENT=1     # unset or "0" → existing step flow
```

`app/interview/page.tsx` becomes a thin wrapper:

```tsx
export default function InterviewPage() {
  return process.env.NEXT_PUBLIC_CHAT_ASSESSMENT === "1"
    ? <ChatAssessment />
    : <StepAssessment />;   // today's component, moved out of the route file
}
```

Read at build time by Next, so the two flows never both ship to one learner's
bundle in a given deployment.

## 3. Order of work

| Step | Change | Reversible by |
|---|---|---|
| 1 | Widen `vitest.config.ts` include to pick up the new tests | reverting one line |
| 2 | Add `buddy` section to `lib/i18n/en.ts` + `th.ts` | deleting the section |
| 3 | Build the feature inside `conversational_questionnaire/` | deleting the folder |
| 4 | Extract today's flow from `app/interview/page.tsx` into `components/assessment/StepAssessment.tsx` — **move, do not rewrite** | the backup |
| 5 | Add the flag wrapper | clearing the flag |
| 6 | Flag on in development, both suites green | clearing the flag |
| 7 | Flag on by default | clearing the flag |
| 8 | Move files out of `conversational_questionnaire/` into `components/` and `lib/` | a later refactor |

Steps 1–3 touch nothing the current flow uses. Step 4 is the only one that
edits a live file, and it is a move.

## 4. What must not change

| Untouched | Why |
|---|---|
| `data/questions.json` | The instrument, with its research provenance and validation notice |
| `lib/decision-engine/**` | All scoring |
| `lib/session/**` | Versioned persistence with repair paths |
| `lib/safety/**` | Safety check on free text |
| `lib/research/telemetry.ts` | Response-process capture; the chat flow calls the same `markSeen` / `recordAnswer` |
| `docs/**` | Research references |

If a change here looks necessary, stop. It means the redesign has reached past
presentation into the assessment framework.

## 5. Test ids

The existing e2e suite queries `q-${itemId}-${value}` and `interview-continue`.
**The chat flow reuses both**, so the current 20 tests pass against either flow
and become a genuine equivalence check rather than a suite that had to be
rewritten to keep passing.

## 6. Data compatibility

`SESSION_VERSION` stays **3**. The chat flow adds no field to `GuestSession`.
The transcript lives in its own key:

```
futureme.guest.v1   answers, mission, plan     (unchanged, source of truth)
futureme.chat.v1    transcript, phase, index   (new, presentation only)
```

A learner who used the step flow yesterday can open the chat flow today and see
their answers. A learner whose transcript is corrupt keeps their answers.

`clearSession()` gains a companion `clearTranscript()`; the privacy page's
delete control must call both. **This is the one place where forgetting a change
would leave learner data behind after they asked for deletion** — it is on the
Phase F checklist for that reason.

## 7. Rollback

| Situation | Action | Cost |
|---|---|---|
| Chat flow misbehaving in a demo | `NEXT_PUBLIC_CHAT_ASSESSMENT=0`, rebuild | seconds |
| Feature abandoned | delete `conversational_questionnaire/`, revert steps 1–5 | minutes |
| Something in the framework suspected of having drifted | restore from `backup_questionnaire_before_chat_redesign/` per its README | minutes |
| Scoring suspected | restore `lib/decision-engine/` + `data/questions.json` alone | minutes |

The backup is a copy; the originals were never removed. Restoring is
overwriting, not recovering.

## 8. Phase F checklist

- [ ] `npm run verify` green
- [ ] `npm run build && npx playwright test` green — build first, always
- [ ] Both flows produce identical recommendations for identical answers
- [ ] Delete-my-data clears **both** storage keys
- [ ] `ACCESSIBILITY_CHECKLIST.md` fully ticked
- [ ] Light and dark verified; dark first, it is the default
- [ ] 390 px and 1280 px verified
- [ ] Thai and English verified, including a mid-run switch
- [ ] Screenshots captured for the record
- [ ] `04_Design/FutureMe_Mascot_Lab/docs/integration-plan.md` updated if Buddy
      usage changed
