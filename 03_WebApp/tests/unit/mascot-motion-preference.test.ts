import { describe, expect, it } from "vitest";
import { shouldForceMascotMotion } from "@/lib/mascot/motion-preference";

describe("mascot motion preference", () => {
  it("animates by default and for the saved on choice", () => {
    expect(shouldForceMascotMotion(null)).toBe(true);
    expect(shouldForceMascotMotion("on")).toBe(true);
  });

  it("honours an explicit system-motion opt-out", () => {
    expect(shouldForceMascotMotion("system")).toBe(false);
  });
});

