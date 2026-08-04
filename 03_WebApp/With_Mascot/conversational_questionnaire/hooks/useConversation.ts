"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  clearSession,
  loadOrCreate,
  saveSession,
  type GuestSession,
} from "@/lib/session";
import { recordAnswer } from "@/lib/research/telemetry";
import {
  firstUnansweredIndex,
  initialState,
  makeReducer,
  type ConversationAction,
} from "../lib/conversation-machine";
import { buildFormSteps } from "../lib/forms";
import { clearFormId, loadFormId } from "../lib/form-storage";
import { toInterviewInput } from "../lib/answers-to-input";
import {
  agreesWithAnswers,
  answersFromSession,
  clearTranscript,
  loadTranscript,
  saveTranscript,
} from "../lib/transcript-storage";
import { ackKeyFor, shouldAcknowledge } from "../lib/buddy-script";
import { isQuestionStep, type AnswerRecord } from "../types";

/**
 * Binds the pure conversation reducer to the app's real session and to storage.
 *
 * The split matters: everything that decides *what happens* is in
 * `conversation-machine.ts` and is tested without a DOM. This hook only deals
 * with the things a reducer cannot — persistence, timers, and the fact that the
 * answers already live somewhere.
 */
export function useConversation() {
  // The chosen form decides the step list. Read once on mount: changing it
  // mid-conversation would silently drop or add questions under the learner.
  const [formId] = useState(() => (typeof window === "undefined" ? "full" : loadFormId()));
  const steps = useMemo(() => buildFormSteps(formId), [formId]);
  const reducer = useMemo(() => makeReducer(steps), [steps]);
  const [state, dispatch] = useReducer(reducer, "pending", () => initialState("pending"));

  const [session, setSession] = useState<GuestSession | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  /* ------------------------------------------------------------- hydrate */

  useEffect(() => {
    const loaded = loadOrCreate();
    setSession(loaded);

    const answers = answersFromSession(
      loaded.interview.interest,
      loaded.interview.context as Record<string, string | undefined>,
      loaded.updatedAt,
    );

    const stored = loadTranscript(loaded.id);

    // The transcript is presentation; the answers are data. When they disagree
    // — another tab, a restore, hand-edited storage — the transcript is thrown
    // away and rebuilt rather than shown next to answers it does not match.
    const usable =
      stored && agreesWithAnswers(stored, loaded.interview.interest) ? stored : null;

    if (usable) {
      dispatch({ type: "REHYDRATE", state: usable });
    } else {
      const answered = Object.keys(answers).length > 0;
      dispatch({
        type: "REHYDRATE",
        state: {
          ...initialState(loaded.id),
          answers,
          // Someone with answers has already consented; showing the notice
          // again would be asking a question already answered.
          phase: answered ? "asking" : "consent",
          stepIndex: answered ? firstUnansweredIndex(steps, answers) : 0,
        },
      });
    }

    setHydrated(true);
  }, [steps]);

  /* ------------------------------------------------------------- persist */

  useEffect(() => {
    if (!hydrated || state.sessionId === "pending") return;
    const ok = saveTranscript(state);
    if (!ok) setStorageOk(false);
  }, [state, hydrated]);

  /* ------------------------------------------------------------- actions */

  const persistAnswers = useCallback(
    (next: Record<string, AnswerRecord>) => {
      if (!session) return;
      const input = toInterviewInput(next);
      const updated: GuestSession = { ...session, interview: input };
      setSession(updated);
      if (!saveSession(updated)) setStorageOk(false);
    },
    [session],
  );

  const answer = useCallback(
    (stepId: string, value: number | string) => {
      const step = steps.find((s) => s.stepId === stepId);
      const at = new Date().toISOString();

      dispatch({ type: "ANSWER", stepId, value, at });

      if (step && isQuestionStep(step)) {
        // Same local-only response-process capture the step flow records.
        if (step.kind === "interest") recordAnswer(stepId, step.index);

        /*
         * Acknowledged immediately, with no typing pause.
         *
         * A 380ms indicator between questions cost roughly thirteen seconds
         * across a full run, and while it played the next question and its
         * replies were hidden — so the learner could not answer even if they
         * were ready. The Buddy still replies; it just does not make anyone
         * wait to watch it think.
         */
        if (shouldAcknowledge(step.index)) {
          dispatch({
            type: "ACKNOWLEDGE",
            key: ackKeyFor(step.index),
            at: new Date().toISOString(),
          });
        }
      }
    },
    [steps],
  );

  // Answers reach the session on the next render, once the reducer has produced
  // the new map — writing from inside `answer` would persist the previous state.
  useEffect(() => {
    if (!hydrated || !session) return;
    persistAnswers(state.answers);
    // persistAnswers depends on session, which this sets; including it loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.answers, hydrated]);

  const restart = useCallback(() => {
    clearTranscript();
    const fresh = loadOrCreate();
    const cleared: GuestSession = { ...fresh, interview: { interest: {}, context: {} } };
    setSession(cleared);
    saveSession(cleared);
    dispatch({ type: "RESTART", sessionId: cleared.id, at: new Date().toISOString() });
  }, []);

  const deleteEverything = useCallback(() => {
    // Both keys. Forgetting the transcript would leave the learner's answers
    // echoed in storage after they asked for deletion.
    clearTranscript();
    clearFormId();
    clearSession();
    const fresh = loadOrCreate();
    setSession(fresh);
    dispatch({ type: "RESTART", sessionId: fresh.id, at: new Date().toISOString() });
  }, []);

  const run = useCallback((action: ConversationAction) => dispatch(action), []);

  return {
    formId,
    steps,
    state,
    session,
    hydrated,
    storageOk,
    answer,
    restart,
    deleteEverything,
    dispatch: run,
  };
}
