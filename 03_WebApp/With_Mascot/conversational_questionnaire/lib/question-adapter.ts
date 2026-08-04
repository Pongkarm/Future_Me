/**
 * Reads `data/questions.json` into conversation steps.
 *
 * The bank is the instrument: it carries the research provenance, the "not
 * validated" notice, and — critically — the item order. This module reads it and
 * never rewrites it, and it never reorders what it reads.
 *
 * `meta.itemOrder` is "interleaved": the six RIASEC dimensions are rotated
 * rather than presented in blocks, because O*NET reports that mixing items
 * reduced a response bias found when items are grouped by construct. Grouping
 * the conversation by dimension would look like a presentation choice and would
 * quietly undo that. `tests/question-adapter.test.ts` asserts the order.
 */
import questionsData from "@/data/questions.json";
import type {
  ChoiceOption,
  ContextStep,
  ConversationStep,
  InterestStep,
  Localised,
  ScaleOption,
} from "../types";

interface RawInterest {
  id: string;
  dimension: string;
  direction: string;
  sourceType: string;
  text: Localised;
}

interface RawContext {
  id: string;
  type: string;
  required?: boolean;
  text: Localised;
  help?: Localised;
  placeholder?: Localised;
  options?: ChoiceOption[];
}

export interface QuestionBank {
  interest: RawInterest[];
  context: RawContext[];
  scale: ScaleOption[];
}

/** The five-point scale, shared by every interest item. */
export function scaleOptions(bank: QuestionBank = questionsData as QuestionBank): ScaleOption[] {
  return bank.scale;
}

/**
 * Build the full step list: interest items, then context questions, then review.
 *
 * @param bank injectable so tests can exercise a fixture — for instance a
 *   reverse-keyed item, which the live bank does not currently contain.
 */
export function buildSteps(
  bank: QuestionBank = questionsData as QuestionBank,
): ConversationStep[] {
  const steps: ConversationStep[] = [];

  bank.interest.forEach((item) => {
    const step: InterestStep = {
      kind: "interest",
      stepId: item.id,
      index: steps.length,
      stage: "interests",
      responseType: "likert",
      required: true,
      text: item.text,
      dimension: item.dimension,
      direction: item.direction,
      options: bank.scale,
      affectsResult: true,
    };
    steps.push(step);
  });

  bank.context.forEach((item) => {
    const step: ContextStep = {
      kind: "context",
      stepId: item.id,
      index: steps.length,
      stage: "about-you",
      // The bank uses "single" and "text"; anything else would be a data error
      // rather than something to guess at.
      responseType: item.type === "text" ? "text" : "single",
      required: item.required === true,
      text: item.text,
      help: item.help,
      options: item.options,
      affectsResult: true,
    };
    steps.push(step);
  });

  steps.push({
    kind: "review",
    stepId: "review",
    index: steps.length,
    stage: "about-you",
    affectsResult: false,
  });

  return steps;
}

/** Total questions, excluding the review marker. */
export function questionCount(steps: ConversationStep[]): number {
  return steps.filter((s) => s.kind !== "review").length;
}

/** Interest questions only — what the completeness gate counts. */
export function interestSteps(steps: ConversationStep[]): InterestStep[] {
  return steps.filter((s): s is InterestStep => s.kind === "interest");
}
