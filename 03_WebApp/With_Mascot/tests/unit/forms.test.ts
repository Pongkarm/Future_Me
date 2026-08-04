import { describe, expect, it } from "vitest";
import questionsData from "@/data/questions.json";
import {
  FORM_IDS,
  buildFormSteps,
  formDefinition,
  interestItemsFor,
  isFormId,
  type FormId,
} from "@/conversational_questionnaire/lib/forms";
import { interestSteps } from "@/conversational_questionnaire/lib/question-adapter";
import { minAnswersFor, recommend, MIN_INTEREST_RATIO } from "@/lib/decision-engine";
import type { InterviewInput } from "@/lib/decision-engine/types";

const bank = questionsData.interest;
const DIMENSIONS = [...new Set(bank.map((i) => i.dimension))];

describe("form definitions", () => {
  it("offers a short and a full form", () => {
    expect(FORM_IDS).toEqual(["short", "full"]);
    expect(isFormId("short")).toBe(true);
    expect(isFormId("15")).toBe(false);
  });

  it("derives its length from the bank rather than a written-in number", () => {
    expect(formDefinition("full").interestCount).toBe(bank.length);
    expect(formDefinition("short").interestCount).toBe(DIMENSIONS.length * 3);
  });

  /**
   * The reason the short form is 18 and not 15.
   *
   * A dimension's score is the mean of its answered items. If some dimensions
   * get three items and others two, the two-item dimensions have noisier means
   * — and since the engine picks top dimensions and gates on the spread between
   * them, a dimension could reach the top on two lucky answers. Balance is not
   * cosmetic here; it is what makes the dimensions comparable.
   */
  it.each(FORM_IDS)("gives every dimension the same number of items (%s)", (id: FormId) => {
    const counts: Record<string, number> = {};
    for (const item of interestItemsFor(id)) {
      counts[item.dimension] = (counts[item.dimension] ?? 0) + 1;
    }
    expect(Object.keys(counts).sort()).toEqual([...DIMENSIONS].sort());
    expect(new Set(Object.values(counts)).size).toBe(1);
  });

  it("keeps the bank's interleaved order — the short form is the full form with items removed", () => {
    const shortIds = interestItemsFor("short").map((i) => i.id);
    const inBankOrder = bank.filter((i) => shortIds.includes(i.id)).map((i) => i.id);
    expect(shortIds).toEqual(inBankOrder);
  });

  it("draws the short form entirely from the real bank", () => {
    const bankIds = new Set(bank.map((i) => i.id));
    for (const item of interestItemsFor("short")) expect(bankIds.has(item.id)).toBe(true);
  });

  it("keeps every context question in both forms", () => {
    for (const id of FORM_IDS) {
      const steps = buildFormSteps(id);
      const context = steps.filter((s) => s.kind === "context");
      expect(context).toHaveLength(questionsData.context.length);
    }
  });

  it("builds a step list matching the form's length", () => {
    expect(interestSteps(buildFormSteps("short"))).toHaveLength(formDefinition("short").interestCount);
    expect(interestSteps(buildFormSteps("full"))).toHaveLength(bank.length);
  });
});

describe("the completeness gate scales with the form", () => {
  it("keeps the ratio, not the count, as the invariant", () => {
    expect(minAnswersFor(30)).toBe(Math.ceil(30 * MIN_INTEREST_RATIO));
    expect(minAnswersFor(18)).toBe(Math.ceil(18 * MIN_INTEREST_RATIO));
  });

  /**
   * Without this, a short form is not merely stricter — it is impossible. The
   * learner answers all 18 questions and is still told there is not enough
   * evidence, because the floor was derived from a bank they never saw.
   */
  it("lets a fully answered short form clear the gate", () => {
    const short = formDefinition("short");
    const items = interestItemsFor("short");
    const interest: Record<string, number> = {};
    items.forEach((item, i) => {
      // Differentiated, so the flat-profile gate is not what is being measured.
      interest[item.id] = (i % 5) + 1;
    });
    const input: InterviewInput = {
      interest,
      context: { tier: "UPPER_SECONDARY", cost: "moderate", mobility: "can_move", horizon: "soon" },
    };

    const withForm = recommend(input, null, undefined, { itemsPresented: short.interestCount });
    expect(withForm.insufficientReasons).not.toContain("INSUFFICIENT_ANSWERS");

    // And the same answers judged against the full bank would be rejected on count.
    const withoutForm = recommend(input, null);
    expect(withoutForm.insufficientReasons).toContain("INSUFFICIENT_ANSWERS");
  });

  it("reports the form's length back, so the interface counts against the right total", () => {
    const short = formDefinition("short");
    const result = recommend({ interest: {}, context: {} }, null, undefined, {
      itemsPresented: short.interestCount,
    });
    expect(result.profile.totalInterest).toBe(short.interestCount);
  });

  it("is unchanged when no form is given", () => {
    // Every pre-existing call site omits the option, so behaviour must be
    // identical to before this feature existed.
    const input: InterviewInput = { interest: {}, context: {} };
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(recommend(input, null, now)).toEqual(recommend(input, null, now, {}));
    expect(recommend(input, null, now).profile.totalInterest).toBe(bank.length);
  });
});
