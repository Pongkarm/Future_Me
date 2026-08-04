import { describe, expect, it } from "vitest";
import { dictionaryFor } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/preferences";
import {
  ACK_KEYS,
  PRE_RESULT_KEYS,
  ackKeyFor,
  poseForPhase,
  shouldAcknowledge,
} from "@/conversational_questionnaire/lib/buddy-script";
import { MASCOT_EMOTIONS, MASCOT_POSES } from "@/lib/mascot/states";

/**
 * These are the honesty tests. A failure here is not a UI bug — it means the
 * Buddy is saying more than the instrument supports.
 */

/** Words that would characterise the learner or steer them toward a career. */
const FORBIDDEN_EN = [
  "realistic",
  "investigative",
  "artistic",
  "social",
  "enterprising",
  "conventional",
  "personality",
  "your type",
  "you are a",
  "perfect career",
  "you should become",
  "you must",
  "engineer",
  "doctor",
  "nurse",
  "great answer",
  "wrong answer",
];

const FORBIDDEN_TH = [
  "บุคลิกภาพ",
  "คุณเป็นคนประเภท",
  "อาชีพที่ใช่ที่สุด",
  "คุณต้องเป็น",
  "วิศวกร",
  "หมอ",
  "พยาบาล",
  "ตอบถูก",
  "ตอบผิด",
];

/**
 * Phrases that contain a forbidden word while meaning its opposite.
 *
 * "There are no right or wrong answers" is the copy we *want* — it is the line
 * that tells the learner not to perform. Stripped before scanning so the check
 * stays a substring match, which is blunt but impossible to argue with.
 */
const SAFE_IDIOMS = [
  /there are no right or wrong answers?/gi,
  /no right or wrong answers?/gi,
  /ไม่มีคำตอบถูกหรือผิด/g,
];

function scannable(text: string): string {
  return SAFE_IDIOMS.reduce((acc, idiom) => acc.replace(idiom, ""), text);
}

describe("buddy dialogue", () => {
  it("exists in every language with the same keys", () => {
    const en = dictionaryFor("en").buddy;
    for (const lang of LANGUAGES) {
      const dict = dictionaryFor(lang).buddy;
      expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
    }
  });

  it("has no empty strings", () => {
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(dictionaryFor(lang).buddy)) {
        expect(typeof value, `${lang}.${key}`).toBe("string");
        expect(String(value).trim().length, `${lang}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("is genuinely translated rather than copied from English", () => {
    const en = dictionaryFor("en").buddy as Record<string, string>;
    const th = dictionaryFor("th").buddy as Record<string, string>;
    // Product names and placeholders may match; prose must not.
    const allowedIdentical = new Set(["progress"]);
    for (const key of Object.keys(en)) {
      if (allowedIdentical.has(key)) continue;
      expect(th[key], `th.${key} is still English`).not.toBe(en[key]);
    }
  });

  it("never characterises the learner before the result", () => {
    for (const key of PRE_RESULT_KEYS) {
      const en = scannable(
        String((dictionaryFor("en").buddy as Record<string, string>)[key]).toLowerCase(),
      );
      for (const word of FORBIDDEN_EN) {
        expect(en, `en.buddy.${key} contains "${word}"`).not.toContain(word);
      }
      const th = scannable(String((dictionaryFor("th").buddy as Record<string, string>)[key]));
      for (const word of FORBIDDEN_TH) {
        expect(th, `th.buddy.${key} contains "${word}"`).not.toContain(word);
      }
    }
  });

  it("hedges the result rather than asserting it", () => {
    for (const lang of LANGUAGES) {
      const buddy = dictionaryFor(lang).buddy as Record<string, string>;
      for (const word of lang === "en" ? FORBIDDEN_EN : FORBIDDEN_TH) {
        expect(scannable(buddy.resultIntro.toLowerCase()), `${lang}.resultIntro`).not.toContain(
          word,
        );
        expect(scannable(buddy.resultLimits.toLowerCase()), `${lang}.resultLimits`).not.toContain(
          word,
        );
      }
    }
  });

  it("states the storage and validation limits at consent", () => {
    // The instrument's meta.notice says it is not validated. The learner must
    // be told before answering, not only in the result.
    const en = dictionaryFor("en").buddy;
    expect(en.consentStorage.toLowerCase()).toContain("browser");
    expect(en.consentLimits.toLowerCase()).toContain("not a validated test");
    expect(en.consentLimits.toLowerCase()).toContain("not a diagnosis");
    const th = dictionaryFor("th").buddy;
    expect(th.consentStorage).toContain("เบราว์เซอร์");
    expect(th.consentLimits).toContain("ไม่ใช่การวินิจฉัย");
  });
});

describe("acknowledgement scheduling", () => {
  it("is deterministic, so the same run always reads the same", () => {
    for (let i = 0; i < 40; i += 1) {
      expect(ackKeyFor(i)).toBe(ackKeyFor(i));
      expect(shouldAcknowledge(i)).toBe(shouldAcknowledge(i));
    }
  });

  it("stays quiet most of the time so the questions are not buried", () => {
    // One in four. Every answer is already echoed back visually, so a reply to
    // each one doubles the page a learner has to scroll through.
    const acked = Array.from({ length: 32 }, (_, i) => shouldAcknowledge(i)).filter(Boolean);
    expect(acked.length).toBe(8);
  });

  it("rotates through every acknowledgement so the Buddy does not repeat itself", () => {
    // Only the indexes that actually speak matter here.
    const spoken = Array.from({ length: 40 }, (_, i) => i).filter(shouldAcknowledge);
    expect(new Set(spoken.map(ackKeyFor)).size).toBe(ACK_KEYS.length);
  });

  it("resolves every acknowledgement key to real copy", () => {
    for (const lang of LANGUAGES) {
      const buddy = dictionaryFor(lang).buddy as Record<string, string>;
      for (const key of ACK_KEYS) {
        expect(buddy[key.replace("buddy.", "")], `${lang}.${key}`).toBeTruthy();
      }
    }
  });
});

describe("buddy poses", () => {
  it("uses states the mascot actually implements", () => {
    for (const phase of ["consent", "asking", "review", "result"]) {
      const { emotion, pose } = poseForPhase(phase);
      expect(MASCOT_EMOTIONS).toContain(emotion);
      expect(MASCOT_POSES).toContain(pose);
    }
  });

  it("stays emotionally neutral while questions are being asked", () => {
    // A Buddy that smiles at a 5 and frowns at a 1 tells the learner which
    // answers it prefers, which is exactly what a preference measure must not do.
    expect(poseForPhase("asking").emotion).toBe("neutral");
    expect(poseForPhase("review").emotion).toBe("neutral");
  });
});
