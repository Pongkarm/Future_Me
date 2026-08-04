"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Shell } from "@/components/ui";
import FutureMeMascot from "@/components/mascot/FutureMeMascot";
import { usePreferences } from "@/components/PreferencesProvider";
import { format, localised } from "@/lib/i18n";
import { minAnswersFor, recommend } from "@/lib/decision-engine";
import { useConversation } from "../hooks/useConversation";
import { answeredInterestCount } from "../lib/conversation-machine";
import { interestSteps, questionCount } from "../lib/question-adapter";
import { poseForPhase } from "../lib/buddy-script";
import { BuddyMessage, SystemMessage, UserMessage } from "./ChatMessage";
import QuickReplyScale from "./QuickReplyScale";
import QuickReplyChoice from "./QuickReplyChoice";
import TextReply from "./TextReply";
import ConversationReview from "./ConversationReview";
import ConversationResult from "./ConversationResult";
import { toInterviewInput } from "../lib/answers-to-input";
import { formDefinition } from "../lib/forms";
import { isQuestionStep } from "../types";

/**
 * The conversational assessment.
 *
 * Deliberately a coordinator: it decides what to show, and the pieces below it
 * do the showing. The 580-line component this replaces is the reason.
 */
export default function ChatAssessment() {
  const router = useRouter();
  const { t, lang } = usePreferences();
  const { formId, steps, state, session, hydrated, storageOk, answer, restart, deleteEverything, dispatch } =
    useConversation();

  const bottomRef = useRef<HTMLDivElement>(null);
  const total = useMemo(() => questionCount(steps), [steps]);
  const step = steps[state.stepIndex];
  const answeredInterest = answeredInterestCount(steps, state.answers);
  // Derived from the form the learner is actually taking. Using the whole
  // bank's constant here would tell someone on the short form they still owe
  // answers to questions they were never shown.
  const totalInterest = interestSteps(steps).length;
  const missing = Math.max(0, minAnswersFor(totalInterest) - answeredInterest);

  // Keep the newest message in view. Jumps rather than glides under reduced
  // motion, and never takes focus — auto-scroll that steals focus makes a
  // keyboard run unusable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [state.transcript.length, state.stepIndex]);

  if (!hydrated) {
    return (
      <Shell step={1}>
        <p className="text-muted">{t.assessment.loading}</p>
      </Shell>
    );
  }

  const mascot = poseForPhase(state.phase);

  /* ------------------------------------------------------------- consent */

  /*
   * The first screen of the conversation, and deliberately the only one.
   *
   * There used to be a welcome step ahead of this with a large centred mascot —
   * the same image the landing page already leads with, and the same greeting.
   * Meeting the character twice before answering anything made the start feel
   * longer than it is, so the greeting stays on the landing page and the
   * conversation opens here, on the notice the learner actually needs before
   * answering.
   */
  if (state.phase === "consent") {
    return (
      <Shell step={1}>
        <div className="mx-auto grid max-w-2xl gap-5 py-6">
          <div className="flex items-start gap-3">
            <FutureMeMascot emotion="smile" pose="wave" size={80} crop="face" animated={false} />
            <div className="min-w-0 rounded-2xl rounded-bl-sm border border-line bg-surface2 px-5 py-4">
              <h1 className="text-lg font-bold">{t.buddy.consentTitle}</h1>
              <p className="mt-3 text-base leading-relaxed text-muted">{t.buddy.consentStorage}</p>
              <p className="mt-3 text-base leading-relaxed text-muted">{t.buddy.consentLimits}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => dispatch({ type: "CONSENT_GIVEN" })}
              data-testid="chat-consent"
            >
              {t.buddy.consentStart}
            </Button>
            <Button href="/privacy" variant="secondary">
              {t.buddy.consentPrivacy}
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  /* -------------------------------------------------------------- result */

  if (state.phase === "result") {
    /*
     * Scored here rather than in the reducer: the engine is the only thing that
     * decides what the answers mean, and it is called with the same arguments
     * /routes uses so the two screens can never disagree.
     */
    const result = recommend(toInterviewInput(state.answers), session?.mission ?? null, undefined, {
      itemsPresented: formDefinition(formId).interestCount,
    });

    return (
      <Shell step={1}>
        <ConversationResult
          result={result}
          formId={formId}
          t={t}
          onReview={() => dispatch({ type: "GO_TO_REVIEW" })}
          onRetake={restart}
          onGoTo={(href) => router.push(href)}
        />
      </Shell>
    );
  }

  /* -------------------------------------------------------------- review */

  if (state.phase === "review") {
    return (
      <Shell step={1}>
        <ConversationReview
          steps={steps}
          answers={state.answers}
          lang={lang}
          t={t}
          answeredInterest={answeredInterest}
          totalInterest={totalInterest}
          missing={missing}
          onEdit={(stepId) => dispatch({ type: "EDIT", stepId })}
          onSubmit={() => dispatch({ type: "SUBMIT" })}
          onRestart={restart}
          onDelete={deleteEverything}
        />
      </Shell>
    );
  }

  /* -------------------------------------------------------------- asking */

  const questionId = "chat-question";
  const pending = step && isQuestionStep(step) ? state.answers[step.stepId] : undefined;
  const stageLabel = step?.stage === "interests" ? t.buddy.stageInterests : t.buddy.stageAboutYou;

  return (
    <Shell step={1}>
      <div className="mx-auto flex max-w-2xl flex-col gap-4 py-4">
        {/* Progress is text as well as a bar, and sits outside the live region
            so it cannot interrupt the question being read. */}
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>
            {format(t.buddy.progress, {
              stage: stageLabel,
              done: Math.min(state.stepIndex + 1, total),
              total,
            })}
          </span>
          <div
            className="h-1.5 w-28 overflow-hidden rounded-full bg-surface2"
            role="progressbar"
            aria-valuenow={Math.round(((state.stepIndex + 1) / total) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t.buddy.progressLabel}
          >
            <div
              className="h-full bg-mint transition-all"
              style={{ width: `${Math.min(100, ((state.stepIndex + 1) / total) * 100)}%` }}
            />
          </div>
        </div>

        {!storageOk ? (
          <p className="rounded-control border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-muted">
            {t.buddy.errorStorage}
          </p>
        ) : null}

        {/* The transcript. Only additions are announced; the mascot lives
            outside so its animation never re-triggers a reading. */}
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-col gap-3"
        >
          {state.transcript.map((message) => {
            if (message.role === "user") {
              const forStep = steps.find((s) => s.stepId === message.stepId);
              const label =
                message.body ??
                (forStep && forStep.kind === "interest"
                  ? localised(
                      forStep.options.find((o) => o.value === Number(message.params?.value))
                        ?.label ?? { en: "", th: "" },
                      lang,
                    )
                  : forStep && forStep.kind === "context"
                    ? localised(
                        forStep.options?.find((o) => o.value === message.params?.value)?.label ?? {
                          en: String(message.params?.value ?? ""),
                          th: String(message.params?.value ?? ""),
                        },
                        lang,
                      )
                    : String(message.params?.value ?? ""));
              return (
                <UserMessage
                  key={message.id}
                  speakerLabel={t.buddy.youAnswered}
                  editedLabel={t.buddy.edited}
                  superseded={message.superseded}
                >
                  {label}
                </UserMessage>
              );
            }
            if (message.role === "system") {
              return <SystemMessage key={message.id}>{stageLabel}</SystemMessage>;
            }
            const key = message.key.replace("buddy.", "") as keyof typeof t.buddy;
            return (
              <BuddyMessage key={message.id} speakerLabel={t.buddy.buddySaid} muted>
                {t.buddy[key] as string}
              </BuddyMessage>
            );
          })}

          {/* The current question, always the last Buddy bubble. */}
          {step && isQuestionStep(step) ? (
            <BuddyMessage
              speakerLabel={t.buddy.buddySaid}
              showMascot
              emotion={mascot.emotion}
              pose={mascot.pose}
            >
              <span id={questionId} className="font-semibold">
                {localised(step.text, lang)}
              </span>
              {step.help ? (
                <span className="mt-1 block text-xs text-muted">{localised(step.help, lang)}</span>
              ) : null}
            </BuddyMessage>
          ) : null}
        </div>

        {/* Replies sit outside the log: they are controls, not transcript. */}
        {step && isQuestionStep(step) ? (
          <div className="pt-1">
            {step.kind === "interest" ? (
              <QuickReplyScale
                options={step.options.map((o) => ({
                  value: o.value,
                  label: localised(o.label, lang),
                }))}
                value={typeof pending?.value === "number" ? pending.value : undefined}
                onSelect={(value) => answer(step.stepId, value)}
                labelledBy={questionId}
                testIdPrefix={`q-${step.stepId}`}
              />
            ) : step.kind === "context" && step.responseType === "single" && step.options ? (
              <QuickReplyChoice
                options={step.options.map((o) => ({
                  value: o.value,
                  label: localised(o.label, lang),
                }))}
                value={typeof pending?.value === "string" ? pending.value : undefined}
                onSelect={(value) => answer(step.stepId, value)}
                labelledBy={questionId}
                testIdPrefix={`ctx-${step.stepId}`}
              />
            ) : (
              <TextReply
                value={typeof pending?.value === "string" ? pending.value : ""}
                onSubmit={(value) => answer(step.stepId, value)}
                onSkip={() => dispatch({ type: "GO_TO_REVIEW" })}
                labelledBy={questionId}
                submitLabel={t.assessment.next}
                skipLabel={t.assessment.skip}
                testId={`text-${step.stepId}`}
              />
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: "BACK" })}
            disabled={state.stepIndex === 0}
          >
            {t.buddy.back}
          </Button>
          <Button variant="secondary" onClick={() => dispatch({ type: "GO_TO_REVIEW" })}>
            {t.buddy.review}
          </Button>
          <span className="ml-auto text-xs text-muted">
            {format(t.buddy.reviewCounter, {
              answered: answeredInterest,
              total: interestSteps(steps).length,
            })}
          </span>
        </div>

        <div ref={bottomRef} />
      </div>
    </Shell>
  );
}
