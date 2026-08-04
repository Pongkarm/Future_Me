import { describe, expect, it } from "vitest";
import questionsData from "@/data/questions.json";
import {
  answeredInterestCount,
  firstUnansweredIndex,
  initialState,
  makeReducer,
} from "@/conversational_questionnaire/lib/conversation-machine";
import {
  buildSteps,
  interestSteps,
  questionCount,
  type QuestionBank,
} from "@/conversational_questionnaire/lib/question-adapter";
import { toInterviewInput } from "@/conversational_questionnaire/lib/answers-to-input";
import { MIN_INTEREST_ANSWERS } from "@/lib/decision-engine";
import { applyDirection } from "@/lib/decision-engine/scoring";

const bank = questionsData as unknown as QuestionBank;
const steps = buildSteps();
const reduce = makeReducer(steps);
const AT = "2026-08-02T00:00:00.000Z";

function answerAll(count: number) {
  let state = reduce(initialState("s1"), { type: "CONSENT_GIVEN" });
  for (const step of interestSteps(steps).slice(0, count)) {
    state = reduce(state, { type: "ANSWER", stepId: step.stepId, value: 4, at: AT });
  }
  return state;
}

/* ---------------------------------------------------------- the instrument */

describe("question adapter", () => {
  it("keeps the bank's interleaved item order", () => {
    // meta.itemOrderRationale cites O*NET: mixing RIASEC items reduces a
    // response bias found when items are grouped by construct. Grouping the
    // conversation by dimension would undo that while looking cosmetic.
    expect(interestSteps(steps).map((s) => s.stepId)).toEqual(bank.interest.map((i) => i.id));
  });

  it("covers every question in the bank exactly once", () => {
    expect(questionCount(steps)).toBe(bank.interest.length + bank.context.length);
    expect(new Set(steps.map((s) => s.stepId)).size).toBe(steps.length);
  });

  it("ends with the review marker", () => {
    expect(steps[steps.length - 1].kind).toBe("review");
  });

  it("carries direction through without applying it", () => {
    for (const step of interestSteps(steps)) {
      const source = bank.interest.find((i) => i.id === step.stepId);
      expect(step.direction).toBe(source?.direction);
    }
  });

  it("reads the scale from the bank rather than restating it", () => {
    expect(interestSteps(steps)[0].options).toEqual(bank.scale);
  });
});

/* -------------------------------------------------------------- the flow */

describe("conversation machine", () => {
  it("opens on the consent notice with nothing answered", () => {
    const state = initialState("s1");
    // No welcome step: the landing page already greets the learner, and meeting
    // the same mascot and greeting twice made the start feel longer than it is.
    expect(state.phase).toBe("consent");
    expect(state.transcript).toHaveLength(0);
    expect(Object.keys(state.answers)).toHaveLength(0);
  });

  it("moves consent → asking", () => {
    let state = initialState("s1");
    expect(state.phase).toBe("consent");
    state = reduce(state, { type: "CONSENT_GIVEN" });
    expect(state.phase).toBe("asking");
    expect(state.stepIndex).toBe(0);
  });

  it("records a Likert answer and advances one step", () => {
    const state = answerAll(1);
    const first = interestSteps(steps)[0];
    expect(state.answers[first.stepId].value).toBe(4);
    expect(state.stepIndex).toBe(1);
  });

  it("echoes the answer into the transcript", () => {
    const state = answerAll(1);
    const echo = state.transcript.filter((m) => m.role === "user");
    expect(echo).toHaveLength(1);
    expect(echo[0].stepId).toBe(interestSteps(steps)[0].stepId);
  });

  it("ignores a duplicate submission of the same value", () => {
    const first = interestSteps(steps)[0].stepId;
    const once = answerAll(1);
    const twice = reduce(once, { type: "ANSWER", stepId: first, value: 4, at: AT });
    expect(twice).toBe(once); // same reference: nothing happened at all
    expect(twice.transcript.filter((m) => m.role === "user")).toHaveLength(1);
  });

  it("treats a different value for an answered step as an edit, not a duplicate", () => {
    const first = interestSteps(steps)[0].stepId;
    const state = reduce(answerAll(1), { type: "ANSWER", stepId: first, value: 2, at: AT });
    expect(state.answers[first].value).toBe(2);
    expect(state.answers[first].edited).toBe(true);
  });

  it("supersedes the old echo rather than deleting it", () => {
    const first = interestSteps(steps)[0].stepId;
    const state = reduce(answerAll(1), { type: "ANSWER", stepId: first, value: 2, at: AT });
    const echoes = state.transcript.filter((m) => m.role === "user" && m.stepId === first);
    expect(echoes).toHaveLength(2);
    expect(echoes[0].superseded).toBe(true);
    expect(echoes[1].superseded).toBeUndefined();
  });

  it("goes back a step without losing the answer", () => {
    const state = reduce(answerAll(2), { type: "BACK" });
    expect(state.stepIndex).toBe(1);
    expect(Object.keys(state.answers)).toHaveLength(2);
  });

  it("clamps back at the first step", () => {
    let state = reduce(answerAll(0), { type: "BACK" });
    state = reduce(state, { type: "BACK" });
    expect(state.stepIndex).toBe(0);
  });

  it("returns to review after editing from the review list", () => {
    const target = interestSteps(steps)[3].stepId;
    let state = reduce(answerAll(10), { type: "GO_TO_REVIEW" });
    state = reduce(state, { type: "EDIT", stepId: target });
    expect(state.phase).toBe("asking");
    expect(state.editingStepId).toBe(target);

    state = reduce(state, { type: "ANSWER", stepId: target, value: 1, at: AT });
    expect(state.phase).toBe("review");
    expect(state.editingStepId).toBeNull();
    expect(state.answers[target].value).toBe(1);
  });

  it("restarts to a clean state", () => {
    const state = reduce(answerAll(5), { type: "RESTART", sessionId: "s2", at: AT });
    expect(state.answers).toEqual({});
    expect(state.transcript).toHaveLength(0);
    expect(state.phase).toBe("consent");
    expect(state.sessionId).toBe("s2");
  });

  it("resumes at the first unanswered question", () => {
    const state = answerAll(7);
    expect(firstUnansweredIndex(steps, state.answers)).toBe(7);
  });

  it("resumes at the review marker once everything required is answered", () => {
    let state = answerAll(bank.interest.length);
    for (const c of bank.context.filter((q) => q.required)) {
      state = reduce(state, {
        type: "ANSWER",
        stepId: c.id,
        value: c.options?.[0].value ?? "x",
        at: AT,
      });
    }
    expect(firstUnansweredIndex(steps, state.answers)).toBe(steps.length - 1);
  });
});

/* ------------------------------------------------------------- the scoring */

describe("scoring boundary", () => {
  it("stores every scale value raw and unreflected", () => {
    const id = interestSteps(steps)[0].stepId;
    for (const value of [1, 2, 3, 4, 5]) {
      let state = reduce(initialState("s1"), { type: "CONSENT_GIVEN" });
      state = reduce(state, { type: "ANSWER", stepId: id, value, at: AT });
      expect(toInterviewInput(state.answers).interest[id]).toBe(value);
    }
  });

  it("reflects a reverse-keyed item in the engine, not in the conversation", () => {
    // The live bank has no reverse item, so this uses a fixture rather than
    // editing data/questions.json, which provenance tests protect.
    const fixture: QuestionBank = {
      ...bank,
      interest: [
        {
          id: "FX-R-01",
          dimension: "R",
          direction: "reverse",
          sourceType: "researcher-written",
          text: { en: "fixture", th: "fixture" },
        },
      ],
    };
    const fixtureSteps = buildSteps(fixture);
    const fixtureReduce = makeReducer(fixtureSteps);

    let state = fixtureReduce(initialState("s1"), { type: "CONSENT_GIVEN" });
    state = fixtureReduce(state, { type: "ANSWER", stepId: "FX-R-01", value: 5, at: AT });

    // Stored raw …
    expect(toInterviewInput(state.answers).interest["FX-R-01"]).toBe(5);
    // … and reflected only when the engine scores it.
    expect(applyDirection(5, "reverse")).toBe(1);
    expect(applyDirection(5, "positive")).toBe(5);
  });

  it("omits unanswered items instead of defaulting them", () => {
    const state = answerAll(10);
    const input = toInterviewInput(state.answers);
    expect(Object.keys(input.interest)).toHaveLength(10);
    expect(input.interest[interestSteps(steps)[11].stepId]).toBeUndefined();
  });

  it("counts answered interest items the way the gate does", () => {
    const state = answerAll(MIN_INTEREST_ANSWERS);
    expect(answeredInterestCount(steps, state.answers)).toBe(MIN_INTEREST_ANSWERS);
    expect(Object.keys(toInterviewInput(state.answers).interest)).toHaveLength(
      MIN_INTEREST_ANSWERS,
    );
  });

  it("routes context answers to context and drops unknown option values", () => {
    let state = answerAll(0);
    state = reduce(state, { type: "ANSWER", stepId: "tier", value: "UPPER_SECONDARY", at: AT });
    state = reduce(state, { type: "ANSWER", stepId: "cost", value: "not-a-real-value", at: AT });
    const input = toInterviewInput(state.answers);
    expect(input.context.tier).toBe("UPPER_SECONDARY");
    expect(input.context.cost).toBeUndefined();
  });

  it("keeps free text out of the interest map", () => {
    let state = answerAll(0);
    state = reduce(state, { type: "ANSWER", stepId: "proud", value: "I fixed a bike", at: AT });
    const input = toInterviewInput(state.answers);
    expect(input.context.proud).toBe("I fixed a bike");
    expect(input.interest.proud).toBeUndefined();
  });
});
