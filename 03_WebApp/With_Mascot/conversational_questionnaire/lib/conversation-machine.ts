/**
 * The conversation, as a pure reducer.
 *
 * No React, no storage, no timers, no randomness. Everything that decides what
 * happens next lives here so it can be tested in milliseconds without a DOM —
 * which is why the components above it can stay thin.
 *
 * Two rules this file enforces and the UI cannot override:
 *
 *  1. Answers are stored RAW. Reverse keying is the engine's job; reflecting a
 *     value here would double-apply it the day a reverse item is added.
 *  2. An answered step cannot be answered twice from the same message. The
 *     guard is state, not a disabled attribute, because a disabled button is a
 *     rendering detail and a double-submit is a data problem.
 */
import type {
  AnswerRecord,
  ConversationState,
  ConversationStep,
  Message,
} from "../types";
import { isQuestionStep } from "../types";

export type ConversationAction =
  | { type: "CONSENT_GIVEN" }
  | { type: "ANSWER"; stepId: string; value: number | string; at: string }
  | { type: "ACKNOWLEDGE"; key: string; at: string }
  | { type: "BACK" }
  | { type: "EDIT"; stepId: string }
  | { type: "GO_TO_REVIEW" }
  | { type: "SUBMIT" }
  | { type: "RESTART"; sessionId: string; at: string }
  | { type: "REHYDRATE"; state: ConversationState };

/** Deterministic ids: a counter in state would be one more thing to persist. */
function messageId(state: ConversationState, suffix: string): string {
  return `m${state.transcript.length}-${suffix}`;
}

export function initialState(sessionId: string): ConversationState {
  return {
    sessionId,
    phase: "consent",
    stepIndex: 0,
    answers: {},
    transcript: [],
    editingStepId: null,
    pendingStepId: null,
  };
}

function append(state: ConversationState, message: Message): Message[] {
  return [...state.transcript, message];
}

/**
 * The first step with no answer, or the review marker when everything required
 * has been answered. Used on resume so a refresh lands where the learner left
 * off rather than at question one.
 */
export function firstUnansweredIndex(
  steps: ConversationStep[],
  answers: Record<string, AnswerRecord>,
): number {
  const index = steps.findIndex(
    (step) => isQuestionStep(step) && step.required && answers[step.stepId] === undefined,
  );
  return index === -1 ? steps.length - 1 : index;
}

export function answeredInterestCount(
  steps: ConversationStep[],
  answers: Record<string, AnswerRecord>,
): number {
  return steps.filter((s) => s.kind === "interest" && answers[s.stepId] !== undefined).length;
}

export function makeReducer(steps: ConversationStep[]) {
  return function reduce(
    state: ConversationState,
    action: ConversationAction,
  ): ConversationState {
    switch (action.type) {
      case "CONSENT_GIVEN":
        return { ...state, phase: "asking", stepIndex: firstUnansweredIndex(steps, state.answers) };

      case "ANSWER": {
        const step = steps.find((s) => s.stepId === action.stepId);
        if (!step || !isQuestionStep(step)) return state;

        // Double-submit guard. A repeat of the value already stored is a
        // duplicate; a genuinely different value is an edit and is allowed.
        const existing = state.answers[action.stepId];
        if (existing && existing.value === action.value) return state;

        const record: AnswerRecord = {
          stepId: action.stepId,
          value: action.value,
          affectsResult: step.affectsResult,
          answeredAt: action.at,
          ...(existing ? { edited: true } : {}),
        };

        // A changed answer supersedes the old echo rather than deleting it, so
        // the transcript stays an honest record of what happened.
        const transcript = state.transcript.map((m) =>
          m.stepId === action.stepId && m.role === "user" ? { ...m, superseded: true } : m,
        );

        const echo: Message = {
          id: `m${transcript.length}-answer-${action.stepId}`,
          role: "user",
          key: "answer",
          stepId: action.stepId,
          ...(typeof action.value === "string" && step.responseType === "text"
            ? { body: action.value }
            : {}),
          params: { value: String(action.value) },
          at: action.at,
        };

        const answers = { ...state.answers, [action.stepId]: record };

        // Editing from the review list returns there; answering in sequence
        // moves on. Clamped so the review marker is the last stop.
        const nextIndex = state.editingStepId
          ? steps.length - 1
          : Math.min(step.index + 1, steps.length - 1);

        return {
          ...state,
          answers,
          transcript: [...transcript, echo],
          stepIndex: nextIndex,
          editingStepId: null,
          pendingStepId: null,
          phase: state.editingStepId ? "review" : state.phase,
        };
      }

      case "ACKNOWLEDGE":
        return {
          ...state,
          transcript: append(state, {
            id: messageId(state, "ack"),
            role: "buddy",
            key: action.key,
            at: action.at,
          }),
        };

      case "BACK": {
        // Walk back to the previous *question*; the review marker is not one.
        const target = Math.max(0, state.stepIndex - 1);
        return { ...state, stepIndex: target, phase: "asking", editingStepId: null };
      }

      case "EDIT": {
        const step = steps.find((s) => s.stepId === action.stepId);
        if (!step) return state;
        return { ...state, phase: "asking", stepIndex: step.index, editingStepId: action.stepId };
      }

      case "GO_TO_REVIEW":
        return { ...state, phase: "review", stepIndex: steps.length - 1, editingStepId: null };

      case "SUBMIT":
        return { ...state, phase: "result" };

      case "RESTART":
        return initialState(action.sessionId);

      case "REHYDRATE":
        return action.state;

      default:
        return state;
    }
  };
}
