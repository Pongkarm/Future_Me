/**
 * Transcript persistence — presentation state only.
 *
 * The answers live in `futureme.guest.v1` via `lib/session`, which is versioned,
 * self-repairing and already tested. This module stores the *conversation* under
 * its own key so that losing or corrupting a transcript can never lose an
 * answer: on any disagreement the transcript is discarded and rebuilt from the
 * answers, and the learner carries on.
 *
 * That asymmetry is deliberate. A transcript is a nice record; an answer is
 * data the learner gave us.
 */
import type { AnswerRecord, ConversationState } from "../types";

export const TRANSCRIPT_KEY = "futureme.chat.v1";
export const TRANSCRIPT_VERSION = 1;

interface StoredTranscript {
  version: number;
  sessionId: string;
  state: ConversationState;
}

const PHASES = ["consent", "asking", "review", "result"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Parse stored state, returning null for anything not fully trustworthy.
 *
 * Deliberately strict: a half-valid transcript is worth less than rebuilding
 * from the answers, so there is no repair path here — unlike `lib/session`,
 * where repair is worth the complexity because the data is irreplaceable.
 */
export function parseTranscript(raw: unknown, sessionId: string): ConversationState | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== TRANSCRIPT_VERSION) return null;
  if (raw.sessionId !== sessionId) return null;

  const state = raw.state;
  if (!isRecord(state)) return null;
  if (typeof state.stepIndex !== "number" || !Number.isInteger(state.stepIndex)) return null;
  if (state.stepIndex < 0) return null;
  if (!PHASES.includes(state.phase as (typeof PHASES)[number])) return null;
  if (!Array.isArray(state.transcript)) return null;
  if (!isRecord(state.answers)) return null;

  return state as unknown as ConversationState;
}

/**
 * Does the transcript still describe the answers we hold?
 *
 * Answers can change without the transcript — another tab, a restore, a manual
 * edit of storage. When they disagree the transcript is stale and is thrown
 * away rather than shown alongside answers it does not match.
 */
export function agreesWithAnswers(
  state: ConversationState,
  answers: Record<string, number>,
): boolean {
  const stored = Object.keys(answers);
  for (const id of stored) {
    const record = state.answers[id];
    if (record === undefined) return false;
    if (Number(record.value) !== answers[id]) return false;
  }
  return true;
}

export function loadTranscript(sessionId: string): ConversationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TRANSCRIPT_KEY);
    if (!raw) return null;
    return parseTranscript(JSON.parse(raw), sessionId);
  } catch {
    // Unreadable storage is the same as no storage: rebuild and continue.
    return null;
  }
}

export function saveTranscript(state: ConversationState): boolean {
  if (typeof window === "undefined") return false;
  const payload: StoredTranscript = {
    version: TRANSCRIPT_VERSION,
    sessionId: state.sessionId,
    state,
  };
  try {
    window.localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(payload));
    return true;
  } catch {
    // Private mode, quota, disabled storage. The assessment still works in
    // memory for this visit, which is better than refusing to run.
    return false;
  }
}

export function clearTranscript(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TRANSCRIPT_KEY);
  } catch {
    /* nothing useful to do, and nothing worth interrupting the learner for */
  }
}

/** Rebuild answer records from the session's raw interest/context answers. */
export function answersFromSession(
  interest: Record<string, number>,
  context: Record<string, string | undefined>,
  at: string,
): Record<string, AnswerRecord> {
  const answers: Record<string, AnswerRecord> = {};
  for (const [stepId, value] of Object.entries(interest)) {
    answers[stepId] = { stepId, value, affectsResult: true, answeredAt: at };
  }
  for (const [stepId, value] of Object.entries(context)) {
    if (value === undefined || value === "") continue;
    answers[stepId] = { stepId, value, affectsResult: true, answeredAt: at };
  }
  return answers;
}
