# Question data model

How `data/questions.json` becomes conversation steps — **without editing it**.

---

## 1. Rule

`data/questions.json` is the instrument. It carries the research provenance
(`meta.attribution`, `sourceType` per item), the validation notice, and the item
order. It is read, never rewritten, by this feature.

The conversational layer adds an **adapter**, not a second copy of the
questions. A second copy would drift, and `tests/unit/question-bank.test.ts`
and `provenance.test.ts` guard the original — not a duplicate.

## 2. What the bank actually contains

```jsonc
{
  "meta": { "id": "futureme-interest-v2", "construct": "Holland RIASEC …",
            "itemsPerDimension": 5, "scalePoints": 5,
            "notice": "…NOT been psychometrically validated…",
            "attribution": "Ambiel et al. (2018) 18REST, CC BY 4.0",
            "itemOrder": "interleaved", "itemOrderRationale": "…O*NET…" },

  "interest": [                       // 30 items, 5 per dimension
    { "id": "INT-R-01", "dimension": "R", "direction": "positive",
      "sourceType": "adapted-18rest",
      "text": { "en": "Repair a bicycle …", "th": "ซ่อมจักรยาน …" } }
  ],

  "context": [                        // 5 questions
    { "id": "tier", "type": "single", "required": true,
      "text": {...}, "help": {...},
      "options": [ { "value": "LOWER_SECONDARY", "label": {...} } ] }
  ],

  "scale": [                          // shared by every interest item
    { "value": 1, "label": { "en": "Strongly dislike", "th": "ไม่ชอบอย่างยิ่ง" } }
  ]
}
```

Note: `direction` is `"positive"` on all 30 items today. `"reverse"` is
supported by `applyDirection()` and tested, but unused. Nothing in this feature
may assume the absence of reverse items.

## 3. Step type

```ts
// conversational_questionnaire/types/index.ts
export type Localised = { en: string; th: string };

export type ResponseType = "likert" | "single" | "text";

export interface ConversationStepBase {
  stepId: string;              // interest item id, or context id
  index: number;               // position in the run, 0-based
  stage: "interests" | "about-you";
  responseType: ResponseType;
  /** false for optional follow-ups; they never reach InterviewInput. */
  affectsResult: boolean;
  required: boolean;
  text: Localised;
  help?: Localised;
}

export interface InterestStep extends ConversationStepBase {
  kind: "interest";
  responseType: "likert";
  dimension: string;           // carried for the review screen, not for scoring
  direction: string;           // carried through verbatim; never applied here
  options: ScaleOption[];      // from questions.json.scale
  affectsResult: true;
}

export interface ContextStep extends ConversationStepBase {
  kind: "context";
  responseType: "single" | "text";
  options?: ChoiceOption[];
  affectsResult: true;
}

export interface FollowUpStep extends ConversationStepBase {
  kind: "follow-up";
  affectsResult: false;        // enforced by the type
}

export type ConversationStep = InterestStep | ContextStep | FollowUpStep;
```

`affectsResult` is a literal type on each variant, so an unscored follow-up
cannot be assembled into a scored step by accident — it is a compile error, not
a runtime check.

The brief's suggested shape used `questionType: "scored" | "follow_up"` plus a
separate boolean. Two fields that must agree is a bug waiting to happen; the
discriminated union expresses the same thing and cannot disagree with itself.

## 4. Adapter

```ts
// conversational_questionnaire/lib/question-adapter.ts
export function buildSteps(bank = questionsData): ConversationStep[];
```

- Interest items in **bank order**, unchanged. No sorting, no grouping, no
  shuffling. `tests/question-adapter.test.ts` asserts
  `buildSteps().filter(isInterest).map(s => s.stepId)` deep-equals
  `questions.interest.map(i => i.id)`.
- Scale options come from `questions.scale`, so a scale change propagates
  without touching this feature.
- Context questions follow, in bank order, `type` mapped to `responseType`.
- A `review` step terminates the list.

## 5. Answers

```ts
export interface AnswerRecord {
  stepId: string;
  /** RAW. 1..5 for likert, option value for single, string for text. */
  value: number | string;
  affectsResult: boolean;
  answeredAt: string;          // ISO
  /** true if the learner changed it after first answering. */
  edited?: boolean;
}
```

**Raw storage is the load-bearing decision.** `applyDirection()` runs inside the
engine at scoring time. If this layer stored a reflected value, the first
reverse-keyed item added to the bank would be reversed twice and the score would
be wrong in a way no existing test would catch. See `SCORING_INTEGRATION.md` §3.

## 6. Mapping to the engine's input

```ts
function toInterviewInput(answers: Record<string, AnswerRecord>): InterviewInput
```

- Only `affectsResult: true` answers are read.
- Interest steps → `interest[stepId] = Number(value)`.
- Context steps → `context[stepId] = value`.
- Unanswered items are **omitted**, not defaulted. The engine's completeness
  gate counts keys; writing a 3 for "no answer" would fabricate data and inflate
  the count past the honesty threshold.

## 7. Adding a question

1. Add the item to `data/questions.json` with `id`, `dimension`, `direction`,
   `sourceType`, and both languages.
2. Nothing in `conversational_questionnaire/` changes — the adapter picks it up.
3. `tests/unit/question-bank.test.ts` will fail if the per-dimension balance or
   the bilingual requirement breaks. That is the intended gate.
4. If it is a **reverse** item, set `direction: "reverse"` and add a scoring
   case. Do not touch this folder.
5. If it is an **unscored follow-up**, add it to the follow-up list in
   `lib/question-adapter.ts`, not to `questions.json` — the bank is the
   instrument, and an unscored item in it would corrupt the item count that
   `MIN_INTEREST_ANSWERS` is derived from.

## 8. Adding a language

Question text is bilingual in the data file; a third language means extending
`Localised` and every `text`/`label` object, plus a new dictionary in
`lib/i18n`. Out of scope here, but nothing in this design blocks it — no
component holds a language-specific string.
