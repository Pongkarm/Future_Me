/**
 * What the Buddy says, and when.
 *
 * Only keys — every string lives in `lib/i18n` so a language switch re-renders
 * the transcript without losing it, and so no user-facing text hides inside a
 * component.
 *
 * The acknowledgements are chosen by step index rather than at random. A random
 * Buddy cannot be tested, and it reads as erratic rather than warm when the
 * same learner sees a different reaction to the same answer on a retake.
 */
import type { ConversationStep, MascotPoseForStep } from "./buddy-script.types";

export const ACK_KEYS = ["buddy.ack1", "buddy.ack2", "buddy.ack3", "buddy.ack4"] as const;

/**
 * Keys that can appear before the learner has seen any result.
 *
 * `tests/unit/buddy-script.test.ts` asserts none of these characterises the
 * learner — no RIASEC dimension name, no career noun, no evaluative praise.
 */
export const PRE_RESULT_KEYS = [
  "consentTitle",
  "consentStorage",
  "consentLimits",
  "stageInterests",
  "stageAboutYou",
  "ack1",
  "ack2",
  "ack3",
  "ack4",
  "reviewIntro",
] as const;

/**
 * Acknowledge one answer in four.
 *
 * Every answer is already confirmed visually by its own echo in the transcript,
 * so a line after each one is chatter rather than feedback — and over 35
 * questions it doubles the length of the page the learner has to scroll. One in
 * four keeps the Buddy present without burying the questions.
 */
export function shouldAcknowledge(stepIndex: number): boolean {
  return stepIndex % 4 === 3;
}

/**
 * Rotate over the *acknowledgements*, not over the steps.
 *
 * Indexing by step looks equivalent and is not: acknowledgements only fire on
 * every fourth step, so `stepIndex % 4` lands on the same remainder every time
 * and the Buddy repeats one line for the whole run. Counting how many have been
 * spoken is what actually rotates them.
 */
export function ackKeyFor(stepIndex: number): string {
  const spokenSoFar = Math.floor(stepIndex / 4);
  return ACK_KEYS[spokenSoFar % ACK_KEYS.length];
}

/** Stage label key for a step. */
export function stageKeyFor(step: ConversationStep): string {
  return step.stage === "interests" ? "buddy.stageInterests" : "buddy.stageAboutYou";
}

/**
 * The Buddy's pose while a question is on screen.
 *
 * Listening while waiting, thinking on the review step. Emotion stays neutral
 * throughout the questions: a Buddy that smiles at a 5 and frowns at a 1 would
 * be telling the learner which answers it likes.
 */
export function poseForPhase(phase: string): MascotPoseForStep {
  switch (phase) {
    case "consent":
      return { emotion: "smile", pose: "wave" };
    case "review":
      return { emotion: "neutral", pose: "think" };
    case "result":
      return { emotion: "very-happy", pose: "celebrate" };
    default:
      return { emotion: "neutral", pose: "listen" };
  }
}
