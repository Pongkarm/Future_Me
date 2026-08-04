import { describe, expect, it } from "vitest";
import Mascot from "@/lib/mascot/mascot";
import {
  MASCOT_EMOTIONS,
  MASCOT_POSES,
  MASCOT_PRODUCT_STATES,
  MASCOT_SCALE,
  emotionForValue,
  mascotFaceSrc,
} from "@/lib/mascot/states";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * These guard the seams where the mascot can break silently: a product state
 * naming a pose that no longer exists, a scale face pointing at a missing file,
 * or the gradient ids colliding between two mascots on one page. None of those
 * throw — they just render wrong, which is exactly the kind of bug a demo finds
 * before a test does.
 */
describe("mascot state vocabulary", () => {
  it("matches the states the character actually implements", () => {
    expect(Mascot.EMOTIONS.map((e) => e.id).sort()).toEqual([...MASCOT_EMOTIONS].sort());
    expect(Mascot.POSES.map((p) => p.id).sort()).toEqual([...MASCOT_POSES].sort());
  });

  it("resolves every product state to a real emotion and pose", () => {
    for (const [name, state] of Object.entries(MASCOT_PRODUCT_STATES)) {
      expect(MASCOT_EMOTIONS, `${name} emotion`).toContain(state.emotion);
      expect(MASCOT_POSES, `${name} pose`).toContain(state.pose);
    }
  });

  it("covers the five-point scale exactly once each", () => {
    expect(MASCOT_SCALE.map((s) => s.value)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(MASCOT_SCALE.map((s) => s.emotion)).size).toBe(5);
    expect(emotionForValue(4)).toBe("smile");
    expect(emotionForValue(9)).toBeUndefined();
  });

  it("keeps level 4 open-eyed and level 5 closed", () => {
    // The whole scale collapses from five readable steps to four if these two
    // ever use the same eye shape.
    expect(emotionForValue(4)).not.toBe(emotionForValue(5));
    expect(emotionForValue(5)).toBe("very-happy");
  });

  it("ships a face asset for every scale point", () => {
    for (const { emotion } of MASCOT_SCALE) {
      const file = join(process.cwd(), "public", mascotFaceSrc(emotion).replace("/mascot/", "mascot/"));
      expect(existsSync(file), mascotFaceSrc(emotion)).toBe(true);
    }
  });
});

describe("mascotSVG", () => {
  it("carries the requested state as attributes", () => {
    const svg = Mascot.mascotSVG({ emotion: "very-happy", pose: "celebrate", uid: "t1" });
    expect(svg).toContain('data-emotion="very-happy"');
    expect(svg).toContain('data-pose="celebrate"');
  });

  it("scopes gradient ids to the uid so two mascots cannot steal each other's fills", () => {
    const a = Mascot.mascotSVG({ uid: "aaa" });
    const b = Mascot.mascotSVG({ uid: "bbb" });
    expect(a).toContain('id="fmHelmetaaa"');
    expect(b).toContain('id="fmHelmetbbb"');
    expect(a).not.toContain("bbb");
  });

  it("is deterministic for a given uid, which is what makes hydration safe", () => {
    expect(Mascot.mascotSVG({ uid: "same" })).toBe(Mascot.mascotSVG({ uid: "same" }));
  });

  it("hides itself from assistive tech unless given a label", () => {
    expect(Mascot.mascotSVG({ uid: "x" })).toContain('aria-hidden="true"');
    const labelled = Mascot.mascotSVG({ uid: "y", ariaLabel: "FutureMe is listening" });
    expect(labelled).toContain('role="img"');
    expect(labelled).toContain('aria-label="FutureMe is listening"');
  });

  it("falls back to a valid state rather than emitting an unknown one", () => {
    const svg = Mascot.mascotSVG({ emotion: "nonsense", pose: "nonsense", uid: "z" });
    expect(svg).toContain('data-emotion="smile"');
    expect(svg).toContain('data-pose="idle"');
  });
});
