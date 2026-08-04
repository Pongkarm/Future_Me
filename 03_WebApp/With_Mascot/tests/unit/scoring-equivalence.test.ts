import { describe, expect, it } from "vitest";
import questionsData from "@/data/questions.json";
import { recommend, MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import type { InterviewInput } from "@/lib/decision-engine/types";
import { initialState, makeReducer } from "@/conversational_questionnaire/lib/conversation-machine";
import { buildSteps, interestSteps } from "@/conversational_questionnaire/lib/question-adapter";
import { toInterviewInput } from "@/conversational_questionnaire/lib/answers-to-input";

/**
 * The claim "scoring is unchanged" has to be verified, not asserted.
 *
 * The step flow writes `InterviewInput` directly from its own state. The chat
 * flow builds the same shape through the reducer and `toInterviewInput`. If the
 * two ever diverge, a learner would get a different recommendation depending on
 * which presentation they happened to see — which is the one outcome this
 * redesign must not produce.
 */

const steps = buildSteps();
const reduce = makeReducer(steps);
const items = interestSteps(steps);
const AT = "2026-08-02T00:00:00.000Z";

const CONTEXT: InterviewInput["context"] = {
  tier: "UPPER_SECONDARY",
  cost: "moderate",
  mobility: "can_move",
  horizon: "soon",
};

/** How the step flow builds its input: a plain map written as answers arrive. */
function viaStepFlow(values: Record<string, number>): InterviewInput {
  return { interest: { ...values }, context: { ...CONTEXT } };
}

/** How the chat flow builds it: through the reducer, then across the boundary. */
function viaChatFlow(values: Record<string, number>): InterviewInput {
  let state = reduce(initialState("s1"), { type: "CONSENT_GIVEN" });
  for (const [stepId, value] of Object.entries(values)) {
    state = reduce(state, { type: "ANSWER", stepId, value, at: AT });
  }
  for (const [stepId, value] of Object.entries(CONTEXT)) {
    state = reduce(state, { type: "ANSWER", stepId, value: value as string, at: AT });
  }
  return toInterviewInput(state.answers);
}

function profile(fill: (index: number) => number, count = items.length): Record<string, number> {
  const values: Record<string, number> = {};
  items.slice(0, count).forEach((item, i) => {
    values[item.stepId] = fill(i);
  });
  return values;
}

const PROFILES: { name: string; values: Record<string, number> }[] = [
  { name: "all 1", values: profile(() => 1) },
  { name: "all 3", values: profile(() => 3) },
  { name: "all 5", values: profile(() => 5) },
  { name: "alternating", values: profile((i) => (i % 2 === 0 ? 5 : 1)) },
  { name: "rising", values: profile((i) => ((i % 5) + 1)) },
  { name: "mixed realistic", values: profile((i) => [4, 2, 5, 3, 1, 4, 5, 2][i % 8]) },
  // The completeness gate, from both sides.
  { name: "exactly at the gate", values: profile(() => 4, MIN_INTEREST_ANSWERS) },
  { name: "one below the gate", values: profile(() => 4, MIN_INTEREST_ANSWERS - 1) },
];

/**
 * `generatedAt` is a wall-clock stamp taken inside `recommend`, so two calls a
 * millisecond apart differ there and nowhere else. Comparing it would test the
 * clock rather than the scoring.
 */
function scoreOf(input: InterviewInput) {
  const result: Record<string, unknown> = { ...recommend(input, null) };
  delete result.generatedAt;
  return result;
}

describe("chat and step flows score identically", () => {
  it.each(PROFILES)("$name", ({ values }) => {
    const fromSteps = viaStepFlow(values);
    const fromChat = viaChatFlow(values);

    // Same input …
    expect(fromChat.interest).toEqual(fromSteps.interest);
    expect(fromChat.context).toEqual(fromSteps.context);

    // … and therefore the same recommendation, including the insufficient case.
    expect(scoreOf(fromChat)).toEqual(scoreOf(fromSteps));
  });

  it("agrees about why evidence is insufficient", () => {
    // The count gate and the evidence gate are different things. Below 23
    // answers the engine says INSUFFICIENT_ANSWERS; at or above it, the count
    // objection is gone even though a flat profile can still be too weak to
    // differentiate. Asserting the boolean alone would conflate the two.
    const below = recommend(viaChatFlow(profile(() => 4, MIN_INTEREST_ANSWERS - 1)), null);
    const atGate = recommend(viaChatFlow(profile(() => 4, MIN_INTEREST_ANSWERS)), null);

    expect(below.insufficientReasons).toContain("INSUFFICIENT_ANSWERS");
    expect(atGate.insufficientReasons).not.toContain("INSUFFICIENT_ANSWERS");

    // Whether a given profile is *differentiated* enough is the engine's
    // calibration, tested in engine.test.ts. This suite only owns the claim
    // that the chat flow reaches the same verdict as the step flow, which the
    // profile cases above cover — including ones that do produce routes.
  });

  it("never invents an answer the learner did not give", () => {
    const partial = viaChatFlow(profile(() => 4, 10));
    expect(Object.keys(partial.interest)).toHaveLength(10);
    // Every stored key is one the learner actually answered.
    for (const id of Object.keys(partial.interest)) {
      expect(items.slice(0, 10).map((s) => s.stepId)).toContain(id);
    }
  });

  it("carries an edited answer through to the score", () => {
    const first = items[0].stepId;
    let state = reduce(initialState("s1"), { type: "CONSENT_GIVEN" });
    state = reduce(state, { type: "ANSWER", stepId: first, value: 1, at: AT });
    state = reduce(state, { type: "ANSWER", stepId: first, value: 5, at: AT });
    expect(toInterviewInput(state.answers).interest[first]).toBe(5);
  });
});

describe("the instrument is untouched", () => {
  it("still declares itself as an unvalidated prototype", () => {
    // If a redesign ever quietly drops this, the product starts presenting
    // itself as something it is not.
    const { meta } = questionsData;
    expect(meta.notice).toContain("NOT been psychometrically validated");
    expect(meta.attribution).toContain("Ambiel");
    expect(meta.itemOrder).toBe("interleaved");
  });
});
