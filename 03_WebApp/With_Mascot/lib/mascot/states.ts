/**
 * FutureMe mascot — shared state vocabulary.
 *
 * These strings are the contract between product code, the SVG classes in
 * mascot.css, and any later Rive state machine or GLB animation clip. Renaming
 * one here means renaming it everywhere; see the design lab's
 * docs/asset-naming.md.
 *
 * Nothing in this file renders. It exists so a page can say "show the empty
 * state" instead of picking an emotion and a pose by hand, which is how a
 * mascot ends up meaning three different things on three different screens.
 */

export type MascotEmotion =
  | "dislike"
  | "not-okay"
  | "neutral"
  | "smile"
  | "very-happy";

export type MascotPose =
  | "idle"
  | "wave"
  | "think"
  | "listen"
  | "point-left"
  | "point-right"
  | "celebrate"
  | "jump"
  | "sit";

/** `face` crops to the head so emotion still reads below ~140px. */
export type MascotCrop = "full" | "face";

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Layout widths, matching the export targets in the lab's SKILL.md. */
export const MASCOT_SIZES: Record<MascotSize, number> = {
  xs: 64,
  sm: 96,
  md: 200,
  lg: 300,
  xl: 440,
};

export const MASCOT_EMOTIONS: readonly MascotEmotion[] = [
  "dislike",
  "not-okay",
  "neutral",
  "smile",
  "very-happy",
];

export const MASCOT_POSES: readonly MascotPose[] = [
  "idle",
  "wave",
  "think",
  "listen",
  "point-left",
  "point-right",
  "celebrate",
  "jump",
  "sit",
];

/**
 * The five-point interest scale.
 *
 * `value` is what the assessment already stores, so a questionnaire never has
 * to map a number to a face by hand. Level 4 keeps its eyes open and only
 * level 5 closes them — that distinction is the whole reason the scale reads
 * as five steps rather than four.
 */
export const MASCOT_SCALE: readonly { value: number; emotion: MascotEmotion }[] = [
  { value: 1, emotion: "dislike" },
  { value: 2, emotion: "not-okay" },
  { value: 3, emotion: "neutral" },
  { value: 4, emotion: "smile" },
  { value: 5, emotion: "very-happy" },
];

/** Static asset path for a scale face. Files live in public/mascot/. */
export function mascotFaceSrc(emotion: MascotEmotion): string {
  return `/mascot/futureme_mascot_face_${emotion.replace(/-/g, "_")}.svg`;
}

/** Emotion for a 1–5 answer, or undefined when nothing is chosen yet. */
export function emotionForValue(value: number): MascotEmotion | undefined {
  return MASCOT_SCALE.find((s) => s.value === value)?.emotion;
}

/**
 * Product state → mascot state.
 *
 * One table, so the character means the same thing on every screen. Add a
 * product state here before using it in a page, never the other way round —
 * tests/unit/mascot.test.ts checks every entry resolves to a real state.
 */
export const MASCOT_PRODUCT_STATES = {
  onboarding: { emotion: "smile", pose: "wave" },
  assessment: { emotion: "neutral", pose: "idle" },
  interviewListening: { emotion: "neutral", pose: "listen" },
  aiThinking: { emotion: "neutral", pose: "think" },
  routeReady: { emotion: "smile", pose: "point-right" },
  planReady: { emotion: "very-happy", pose: "celebrate" },
  empty: { emotion: "not-okay", pose: "sit" },
  warning: { emotion: "not-okay", pose: "idle" },
  success: { emotion: "very-happy", pose: "jump" },
} as const satisfies Record<string, { emotion: MascotEmotion; pose: MascotPose }>;

export type MascotProductState = keyof typeof MASCOT_PRODUCT_STATES;
