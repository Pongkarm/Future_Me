/**
 * The self-efficacy items ask "how well could you do this", not "how much
 * would you like this". They therefore need their own five labels, and the
 * bug this guards is shipping them under the like/dislike scale — which would
 * read as a wording slip to a learner and as a measurement error to anyone
 * checking the instrument.
 */
import { describe, expect, it } from "vitest";
import questions from "@/data/questions.json";

const efficacy = (questions as { efficacy?: { id: string; dimension: string; scaleId?: string }[] })
  .efficacy ?? [];
const confidence = (questions as { scaleConfidence?: { value: number; label: { th: string; en: string } }[] })
  .scaleConfidence ?? [];

describe("self-efficacy items", () => {
  it("covers all six RIASEC dimensions, once each", () => {
    expect(efficacy).toHaveLength(6);
    expect(new Set(efficacy.map((q) => q.dimension))).toEqual(
      new Set(["R", "I", "A", "S", "E", "C"]),
    );
  });

  it("declares the confidence scale rather than inheriting the interest one", () => {
    for (const q of efficacy) expect(q.scaleId, q.id).toBe("scale5-confidence");
  });

  it("ships five confidence labels in both languages, worded as ability", () => {
    expect(confidence.map((p) => p.value)).toEqual([1, 2, 3, 4, 5]);
    for (const point of confidence) {
      expect(point.label.th).toMatch(/[฀-๿]/);
      expect(point.label.en.length).toBeGreaterThan(0);
    }
    // not the like/dislike wording
    const en = confidence.map((p) => p.label.en).join(" ").toLowerCase();
    expect(en).not.toMatch(/like|dislike/);
  });

  it("keeps them out of the interest array so they can never move a RIASEC score", () => {
    const interestIds = new Set(questions.interest.map((q) => q.id));
    for (const q of efficacy) expect(interestIds.has(q.id), q.id).toBe(false);
  });

  it("adds six screens to the assessment", () => {
    // 30 interest + 6 efficacy + 5 context = 41 questions before the review.
    expect(questions.interest.length + efficacy.length + questions.context.length).toBe(41);
  });
});
