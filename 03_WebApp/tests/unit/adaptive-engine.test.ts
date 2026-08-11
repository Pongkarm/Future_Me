import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";
import { planInterestQuestions } from "@/lib/interview/adaptive-engine";

const allIds = questions.interest.map((item) => item.id);

describe("rule-based interview follow-ups", () => {
  it("keeps the original order until the first question has an answer", () => {
    const plan = planInterestQuestions({});

    expect(plan.branch).toBe("unanswered");
    expect(plan.followUpIds).toEqual([]);
    expect(plan.questions.map((item) => item.id)).toEqual(allIds);
  });

  it("deepens the first dimension after a high answer", () => {
    const plan = planInterestQuestions({ "INT-R-01": 5 });

    expect(plan.branch).toBe("deepen");
    expect(plan.followUpIds).toEqual(["INT-R-02", "INT-R-03"]);
    expect(plan.questions.slice(0, 3).map((item) => item.id)).toEqual([
      "INT-R-01",
      "INT-R-02",
      "INT-R-03",
    ]);
  });

  it("clarifies a neutral answer before broadening", () => {
    const plan = planInterestQuestions({ "INT-R-01": 3 });

    expect(plan.branch).toBe("clarify");
    expect(plan.followUpIds).toEqual(["INT-R-02", "INT-I-01"]);
  });

  it("broadens after a low answer instead of closing a path", () => {
    const plan = planInterestQuestions({ "INT-R-01": 1 });

    expect(plan.branch).toBe("broaden");
    expect(plan.followUpIds).toEqual(["INT-I-01", "INT-A-01"]);
  });

  it("never changes the bank, duplicates questions, or reshuffles from later answers", () => {
    const first = planInterestQuestions({ "INT-R-01": 4 });
    const later = planInterestQuestions({
      "INT-R-01": 4,
      "INT-R-02": 1,
      "INT-R-03": 5,
      "INT-I-01": 2,
    });
    const plannedIds = later.questions.map((item) => item.id);

    expect(plannedIds).toEqual(first.questions.map((item) => item.id));
    expect(plannedIds).toHaveLength(allIds.length);
    expect(new Set(plannedIds).size).toBe(allIds.length);
    expect(new Set(plannedIds)).toEqual(new Set(allIds));
  });
});

