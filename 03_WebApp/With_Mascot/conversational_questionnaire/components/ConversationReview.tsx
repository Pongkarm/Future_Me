"use client";

import { Button, Card, Notice } from "@/components/ui";
import FutureMeMascot from "@/components/mascot/FutureMeMascot";
import { format, localised } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Language } from "@/lib/preferences";
import type { AnswerRecord, ConversationStep } from "../types";
import { isQuestionStep } from "../types";

/**
 * The review step, as the last thing the Buddy asks before scoring.
 *
 * When too few interest items are answered it does **not** offer to submit. The
 * engine would return `insufficientEvidence`, which is a designed outcome the
 * product treats as honest rather than an error to route around — so the
 * conversation says what is missing and offers to finish it.
 */
export default function ConversationReview({
  steps,
  answers,
  lang,
  t,
  answeredInterest,
  totalInterest,
  missing,
  onEdit,
  onSubmit,
  onRestart,
  onDelete,
}: {
  steps: ConversationStep[];
  answers: Record<string, AnswerRecord>;
  lang: Language;
  t: Dictionary;
  answeredInterest: number;
  totalInterest: number;
  missing: number;
  onEdit: (stepId: string) => void;
  onSubmit: () => void;
  onRestart: () => void;
  onDelete: () => void;
}) {
  const questions = steps.filter(isQuestionStep);
  const firstMissing = questions.find(
    (s) => s.kind === "interest" && answers[s.stepId] === undefined,
  );

  const labelFor = (step: ConversationStep, record: AnswerRecord | undefined): string => {
    if (!record || !isQuestionStep(step)) return "—";
    if (step.kind === "interest") {
      const option = step.options.find((o) => o.value === Number(record.value));
      return option ? localised(option.label, lang) : String(record.value);
    }
    if (step.kind === "context" && step.options) {
      const option = step.options.find((o) => o.value === record.value);
      return option ? localised(option.label, lang) : String(record.value);
    }
    return String(record.value);
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-5 py-6">
      <div className="flex items-start gap-3">
        <FutureMeMascot emotion="neutral" pose="think" size={72} crop="face" animated={false} />
        <div className="min-w-0 rounded-2xl rounded-bl-sm border border-line bg-surface2 px-4 py-3">
          <p className="text-base leading-relaxed">{t.buddy.reviewIntro}</p>
          <p className="mt-2 text-xs text-muted">
            {format(t.buddy.reviewCounter, { answered: answeredInterest, total: totalInterest })}
          </p>
        </div>
      </div>

      {missing > 0 ? (
        <Notice tone="warning" mascot>
          {format(t.buddy.reviewIncomplete, { missing })}
        </Notice>
      ) : null}

      <Card>
        <ul className="divide-y divide-line">
          {questions.map((step) => {
            const record = answers[step.stepId];
            return (
              <li key={step.stepId} className="flex items-start gap-3 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-muted">{localised(step.text, lang)}</p>
                  <p className={record ? "font-semibold text-ink" : "italic text-muted"}>
                    {labelFor(step, record)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(step.stepId)}
                  data-testid={`review-${step.stepId}`}
                  className="shrink-0 rounded-control px-2 py-1 text-xs font-semibold text-indigoText underline"
                >
                  {t.buddy.reviewEdit}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-2">
        {missing > 0 ? (
          <Button
            onClick={() => firstMissing && onEdit(firstMissing.stepId)}
            data-testid="chat-finish-missing"
          >
            {t.buddy.reviewGoToMissing}
          </Button>
        ) : (
          <Button onClick={onSubmit} data-testid="chat-submit">
            {t.buddy.reviewSubmit}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm(t.buddy.restartConfirm)) onRestart();
          }}
        >
          {t.buddy.restart}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm(t.buddy.deleteConfirm)) onDelete();
          }}
          data-testid="chat-delete"
        >
          {t.buddy.deleteData}
        </Button>
      </div>
    </div>
  );
}
