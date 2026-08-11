import { describe, expect, it } from "vitest";
import educationRegistry from "@/data/education-data-registry.json";
import routes from "@/data/routes.json";

describe("education-data governance metadata", () => {
  it("records every education-data domain used by the prototype", () => {
    expect(educationRegistry.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(educationRegistry.domains).sort()).toEqual([
      "admission",
      "financial",
      "institution",
      "location",
      "program",
    ]);
  });

  it("does not let unavailable dynamic data affect a decision", () => {
    for (const id of ["admission", "financial"] as const) {
      const domain = educationRegistry.domains[id];
      expect(domain.status).toBe("unavailable");
      expect(domain.decisionUse).toBe("none");
      expect(domain.coverage.localRecords).toBe(0);
      expect(domain.availableFields).toEqual([]);
    }
  });

  it("requires a checked HTTPS source for every source-backed domain", () => {
    for (const [id, domain] of Object.entries(educationRegistry.domains)) {
      if (domain.status === "unavailable") continue;
      expect(domain.sources.length, `${id} has no source`).toBeGreaterThan(0);
      for (const source of domain.sources) {
        expect(source.url, `${id} has an unsafe source URL`).toMatch(/^https:\/\//);
        expect(source.checkedAt, `${id} has no check date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("holds every unsourced route field outside scoring and filtering", () => {
    const heldOut = new Set(educationRegistry.recommendationBoundary.heldOutUntilVerified);
    for (const field of routes.meta.fieldStatus.unverified) expect(heldOut.has(field)).toBe(true);
  });
});
