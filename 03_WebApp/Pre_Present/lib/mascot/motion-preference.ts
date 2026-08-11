/** Kept at the existing key so every journey shares one explicit opt-out. */
export const MASCOT_MOTION_KEY = "futureme-chat-mascot-motion-v1";

/** The demo mascot animates unless the learner explicitly chooses system motion. */
export function shouldForceMascotMotion(stored: string | null): boolean {
  return stored !== "system";
}
