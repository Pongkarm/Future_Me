# Conversational questionnaire

A chat-style presentation of the existing FutureMe RIASEC assessment, with the
Buddy Model as the companion.

**Status: built and passing, behind a flag.** Phases A–F are done; see
[`../HANDOVER.md`](../HANDOVER.md) for the current state and how to run it.

## Read in this order

1. [`docs/EXISTING_SYSTEM_ANALYSIS.md`](docs/EXISTING_SYSTEM_ANALYSIS.md) — what
   is there today, checked against source
2. [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — the 14-point
   plan and the six phases
3. [`docs/CONVERSATION_FLOW.md`](docs/CONVERSATION_FLOW.md) — how the Buddy talks
4. [`docs/QUESTION_DATA_MODEL.md`](docs/QUESTION_DATA_MODEL.md) — types and the adapter
5. [`docs/SCORING_INTEGRATION.md`](docs/SCORING_INTEGRATION.md) — the boundary with the engine
6. [`docs/ACCESSIBILITY_CHECKLIST.md`](docs/ACCESSIBILITY_CHECKLIST.md)
7. [`docs/TESTING_PLAN.md`](docs/TESTING_PLAN.md)
8. [`docs/MIGRATION_GUIDE.md`](docs/MIGRATION_GUIDE.md) — flag, rollout, rollback

## The three rules

1. **The conversation collects, the engine scores.** Nothing here computes a
   score, applies reverse keying, or names a dimension before the result.
2. **The instrument is not edited.** `data/questions.json` carries the research
   provenance and the "not validated" notice. It is read, never rewritten.
3. **No generative AI.** Every Buddy line is a translation key. There is no
   network call in this feature.

## Planned layout

```
conversational_questionnaire/
├── components/   chat UI, none over ~120 lines
├── hooks/        useConversation, useAutoScroll
├── lib/          conversation-machine (pure reducer), question-adapter,
│                 buddy-script, transcript-storage
├── types/        ConversationStep, AnswerRecord, Message
├── data/         buddy-lines.ts — message KEYS only; text lives in lib/i18n
├── tests/
└── docs/
```

Deviation from the brief's suggested structure: no questions file of our own.
The instrument stays in `data/questions.json`, and `data/buddy-lines.ts` holds
keys rather than text so no user-facing string escapes `lib/i18n`.

## Backup

The original questionnaire is copied to
[`../backup_questionnaire_before_chat_redesign/`](../backup_questionnaire_before_chat_redesign/README.md)
with restore instructions. The originals were never removed — the app still runs
from them.

## Running

Nothing to run yet. When Phase F lands:

```bash
cd 03_WebApp/With_Mascot
echo 'NEXT_PUBLIC_CHAT_ASSESSMENT=1' >> .env.local
npm run dev            # http://localhost:3000/interview
```

Without the flag, `/interview` renders today's step flow unchanged.
