/**
 * Types for the conversational assessment.
 *
 * The instrument itself is not modelled here — `data/questions.json` stays the
 * source of truth and `lib/question-adapter.ts` reads it. These types describe
 * the *conversation* over that instrument: what a step is, what an answer is,
 * and what a transcript message is.
 */

export type Localised = { en: string; th: string };

export type ResponseType = "likert" | "single" | "text";

export type ConversationStage = "interests" | "about-you";

export interface ScaleOption {
  value: number;
  label: Localised;
}

export interface ChoiceOption {
  value: string;
  label: Localised;
}

interface StepBase {
  /** Interest item id or context question id. */
  stepId: string;
  /** Position in the run, 0-based. */
  index: number;
  stage: ConversationStage;
  responseType: ResponseType;
  required: boolean;
  text: Localised;
  help?: Localised;
}

export interface InterestStep extends StepBase {
  kind: "interest";
  responseType: "likert";
  /** Carried for the review screen only. Scoring reads the bank, not this. */
  dimension: string;
  /** Carried through verbatim. Never applied here — see docs/SCORING_INTEGRATION.md. */
  direction: string;
  options: ScaleOption[];
  affectsResult: true;
}

export interface ContextStep extends StepBase {
  kind: "context";
  responseType: "single" | "text";
  options?: ChoiceOption[];
  affectsResult: true;
}

/**
 * An optional conversational question that does not reach the engine.
 *
 * `affectsResult` is a literal `false` rather than a boolean, so a follow-up
 * cannot be assembled into a scored step by accident — that is a compile error
 * rather than a runtime check.
 */
export interface FollowUpStep extends StepBase {
  kind: "follow-up";
  affectsResult: false;
}

export interface ReviewStepMarker {
  kind: "review";
  stepId: "review";
  index: number;
  stage: ConversationStage;
  affectsResult: false;
}

export type QuestionStep = InterestStep | ContextStep | FollowUpStep;
export type ConversationStep = QuestionStep | ReviewStepMarker;

export function isQuestionStep(step: ConversationStep): step is QuestionStep {
  return step.kind !== "review";
}

export function isInterestStep(step: ConversationStep): step is InterestStep {
  return step.kind === "interest";
}

export interface AnswerRecord {
  stepId: string;
  /**
   * RAW. 1..5 for likert, the option value for single, the string for text.
   * Never reflected for reverse-keyed items — the engine does that.
   */
  value: number | string;
  affectsResult: boolean;
  answeredAt: string;
  /** Set when the learner changed an answer they had already given. */
  edited?: boolean;
}

/* ------------------------------------------------------------- transcript */

export type MessageRole = "buddy" | "user" | "system";

/**
 * A message stores a dictionary key and its parameters, never rendered text.
 *
 * That is what lets a language switch re-render the whole transcript without
 * losing anything, and it is why no user-facing string lives in this folder.
 * `body` is the exception: learner free text, which is not translatable.
 */
export interface Message {
  id: string;
  role: MessageRole;
  /** Key into `t.buddy`, or a question/answer marker resolved by the renderer. */
  key: string;
  params?: Record<string, string | number>;
  /** For question and answer messages, the step this belongs to. */
  stepId?: string;
  /** Verbatim learner input, used only for free-text answers. */
  body?: string;
  at: string;
  /** True when a later edit superseded this message. */
  superseded?: boolean;
}

export type ConversationPhase =
  | "consent"
  | "asking"
  | "review"
  | "result";

export interface ConversationState {
  sessionId: string;
  phase: ConversationPhase;
  /** Index into the step list. */
  stepIndex: number;
  answers: Record<string, AnswerRecord>;
  transcript: Message[];
  /** Set while the learner is changing an answer from the review list. */
  editingStepId: string | null;
  /** Guards against a double submit for the step currently being answered. */
  pendingStepId: string | null;
}
