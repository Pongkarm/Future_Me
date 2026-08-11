import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import educationRegistry from "@/data/education-data-registry.json";
import packageManifest from "@/package.json";
import release from "@/data/release.json";
import routes from "@/data/routes.json";
import { ENGINE_VERSION } from "@/lib/decision-engine";

const REPO_ROOT = path.resolve(__dirname, "../../..");

describe("release metadata", () => {
  it("uses one repository release version", () => {
    const rootVersion = readFileSync(path.join(REPO_ROOT, "VERSION"), "utf8").trim();
    expect(packageManifest.version).toBe(rootVersion);
    expect(release.version).toBe(rootVersion);
    expect(release.components.webApp.version).toBe(rootVersion);
    expect(release.components.backend.version).toBe(rootVersion);
    expect(educationRegistry.releaseVersion).toBe(rootVersion);
    expect(ENGINE_VERSION).toBe(`${rootVersion}-prototype`);
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
