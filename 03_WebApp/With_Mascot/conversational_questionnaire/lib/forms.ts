/**
 * The two lengths of the interest questionnaire.
 *
 * ## Why the short form is 18 items and not 15
 *
 * The bank holds 30 items, five for each of the six RIASEC dimensions. A
 * dimension's score is the *mean* of its answered items, so a form works at any
 * length — but only if every dimension gets the same number of items.
 *
 * 15 does not divide by 6. A 15-item form would give three dimensions three
 * items and three dimensions two, and the two-item dimensions would have
 * visibly noisier means. That matters here because the engine picks the top
 * dimensions and gates on the *spread* between them: a dimension can rise to
 * the top on the strength of two lucky answers. The bias would be invisible in
 * the interface and would look like a result.
 *
 * 18 is the nearest length that keeps the dimensions balanced (three each), so
 * that is what `short` is. If a literal 15 is wanted despite the imbalance, it
 * is one number below — but the balance test in tests/unit/forms.test.ts will
 * fail, which is the point.
 *
 * ## What a short form costs
 *
 * Three items per dimension is a noisier estimate than five. Nothing here
 * pretends otherwise, and nothing here invents a numeric penalty to compensate:
 * there is no data to calibrate one against. The trade-off is stated to the
 * learner in the interface instead, and the completeness floor stays the same
 * *proportion* of whichever form was taken.
 */
import questionsData from "@/data/questions.json";
import type { ConversationStep } from "../types";
import { buildSteps, type QuestionBank } from "./question-adapter";

export type FormId = "short" | "full";

export interface FormDefinition {
  id: FormId;
  /** Items drawn per RIASEC dimension. The bank has five of each. */
  itemsPerDimension: number;
  /** Total interest items — derived, never written by hand. */
  interestCount: number;
}

const PER_DIMENSION: Record<FormId, number> = { short: 3, full: 5 };

function countFor(bank: QuestionBank, perDimension: number): number {
  const dimensions = new Set(bank.interest.map((i) => i.dimension));
  return dimensions.size * perDimension;
}

export function formDefinition(
  id: FormId,
  bank: QuestionBank = questionsData as QuestionBank,
): FormDefinition {
  const itemsPerDimension = PER_DIMENSION[id];
  return { id, itemsPerDimension, interestCount: countFor(bank, itemsPerDimension) };
}

export const FORM_IDS: readonly FormId[] = ["short", "full"];

export function isFormId(value: unknown): value is FormId {
  return value === "short" || value === "full";
}

/**
 * Take the first N items of each dimension **in bank order**.
 *
 * Bank order is preserved, not regenerated. `meta.itemOrder` is "interleaved":
 * the dimensions are rotated rather than blocked, because O*NET reports that
 * mixing items reduces a response bias found when they are grouped. Filtering
 * while walking the bank keeps that rotation intact — the short form is the
 * full form with items removed, not a resequenced questionnaire.
 */
export function interestItemsFor(
  id: FormId,
  bank: QuestionBank = questionsData as QuestionBank,
): QuestionBank["interest"] {
  const limit = PER_DIMENSION[id];
  const taken: Record<string, number> = {};
  return bank.interest.filter((item) => {
    const used = taken[item.dimension] ?? 0;
    if (used >= limit) return false;
    taken[item.dimension] = used + 1;
    return true;
  });
}

/** The conversation steps for a form: its interest items, then every context question. */
export function buildFormSteps(
  id: FormId,
  bank: QuestionBank = questionsData as QuestionBank,
): ConversationStep[] {
  return buildSteps({ ...bank, interest: interestItemsFor(id, bank) });
}
