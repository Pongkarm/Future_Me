"use client";

import { Button, Card, EvidenceBadge } from "@/components/ui";
import { FLAT_PROFILE_SPREAD } from "@/lib/decision-engine";
import FutureMeMascot from "@/components/mascot/FutureMeMascot";
import { format } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { Dimension, Recommendation } from "@/lib/decision-engine/types";
import type { FormId } from "../lib/forms";

/**
 * The result, as a framework rather than a receipt.
 *
 * The complaint this answers: a learner could answer thirty questions and be
 * told only that some patterns were found, then be pushed to the next screen.
 * Ticking boxes with no destination.
 *
 * Everything shown here is already computed by `lib/decision-engine` — the
 * dimension profile, which dimensions lead, how much was answered, whether a
 * task has been tried, and whether the evidence supports a recommendation at
 * all. None of it is recalculated here; this component only makes the engine's
 * existing output legible and turns it into a sequence the learner can follow.
 *
 * Three rules it keeps:
 *  - Describes the answers, never the person. "Your answers lean toward", not
 *    "you are".
 *  - Shows what the result rests on next to the result itself, so the reader
 *    can weigh it rather than take it.
 *  - When the engine says the evidence is too thin, that is presented as the
 *    real finding it is, with the specific thing to do about it.
 */

const DIMENSION_ORDER: Dimension[] = ["R", "I", "A", "S", "E", "C"];

export default function ConversationResult({
  result,
  formId,
  t,
  onReview,
  onRetake,
  onGoTo,
}: {
  result: Recommendation;
  formId: FormId;
  t: Dictionary;
  onReview: () => void;
  onRetake: () => void;
  onGoTo: (href: string) => void;
}) {
  const { profile } = result;
  const ranked = DIMENSION_ORDER.map((d) => ({ d, value: profile.riasec[d] })).sort(
    (a, b) => b.value - a.value,
  );
  const spread = ranked.length > 0 ? ranked[0].value - ranked[ranked.length - 1].value : 0;

  /*
   * `topDimensions` is a ranking, not a claim that all three stand out — it
   * always returns three however small the gaps. Labelling the third one
   * "strongest" when it sits level with the bottom of the profile would be the
   * interface asserting something the numbers do not.
   *
   * A dimension is called strongest only while it is within the engine's own
   * definition of distinguishable, so the badge and the engine's flat-profile
   * gate can never disagree about what "stands out" means.
   */
  const leadValue = ranked[0]?.value ?? 0;
  const isStrongest = (d: Dimension, value: number) =>
    profile.topDimensions.includes(d) && leadValue - value < FLAT_PROFILE_SPREAD;

  const steps = [
    { title: t.buddy.path1Title, body: t.buddy.path1Body, href: "/mission", done: profile.missionCompleted },
    { title: t.buddy.path2Title, body: t.buddy.path2Body, href: "/routes", done: false },
    { title: t.buddy.path3Title, body: t.buddy.path3Body, href: "/compare", done: false },
    { title: t.buddy.path4Title, body: t.buddy.path4Body, href: "/plan", done: false },
  ];
  const nextStep = steps.findIndex((s) => !s.done);

  return (
    <div className="mx-auto grid max-w-2xl gap-5 py-6">
      <div className="flex items-start gap-3">
        <FutureMeMascot
          emotion={result.insufficientEvidence ? "neutral" : "very-happy"}
          pose={result.insufficientEvidence ? "think" : "celebrate"}
          size={80}
          crop="face"
          animated={false}
        />
        <div className="min-w-0 rounded-2xl rounded-bl-sm border border-line bg-surface2 px-5 py-4">
          <p className="text-base leading-relaxed">{t.buddy.resultIntro}</p>
        </div>
      </div>

      {/* 1 — the profile itself, described rather than pronounced */}
      <Card>
        <h2 className="text-base font-bold">{t.buddy.profileTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.buddy.profileLead}</p>

        <ul className="mt-4 grid gap-2.5">
          {ranked.map(({ d, value }) => {
            const percent = Math.round(value * 100);
            const isTop = isStrongest(d, value);
            return (
              <li key={d} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={isTop ? "font-bold text-ink" : "text-muted"}>
                    {t.engine.dimensions[d]}
                    {isTop ? (
                      <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-indigoText">
                        {t.buddy.profileTop}
                      </span>
                    ) : null}
                  </span>
                  {/* The number is text, so the bars are never the only signal. */}
                  <span className="shrink-0 tabular-nums text-muted">{percent}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-surface2"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t.engine.dimensions[d]}
                >
                  <div
                    className={`h-full rounded-full ${isTop ? "bg-mint" : "bg-muted/40"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {/* A flat profile is a finding, not an error — say so rather than
            picking a winner out of noise. */}
        {spread < FLAT_PROFILE_SPREAD ? (
          <p className="mt-4 rounded-control border border-line bg-surface2 px-3 py-2 text-sm text-muted">
            {t.buddy.profileFlat}
          </p>
        ) : null}
      </Card>

      {/* 2 — what it rests on, beside the result rather than in a footnote */}
      <Card>
        <h2 className="text-base font-bold">{t.buddy.basisTitle}</h2>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted">
          <li>
            •{" "}
            {format(t.buddy.basisAnswered, {
              answered: profile.answeredInterest,
              total: profile.totalInterest,
            })}
          </li>
          <li>• {formId === "short" ? t.buddy.basisFormShort : t.buddy.basisFormFull}</li>
          <li>• {profile.missionCompleted ? t.buddy.basisMissionDone : t.buddy.basisMissionTodo}</li>
        </ul>
        {result.routes.length > 0 ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span>{format(t.buddy.basisEvidence, { level: "" }).trim()}</span>
            <EvidenceBadge
              strength={result.routes[0].evidenceStrength}
              label={t.engine.strengthLabels[result.routes[0].evidenceStrength]}
            />
          </div>
        ) : null}
      </Card>

      {/* 3 — the thin-evidence case, treated as a real outcome */}
      {result.insufficientEvidence ? (
        <Card className="border-warning/40">
          <h2 className="text-base font-bold">{t.buddy.thinTitle}</h2>
          <p className="mt-2 text-sm text-muted">{t.buddy.thinBody}</p>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            {result.insufficientReasons.map((code) => (
              <li key={code}>• {t.engine.reasons[code]}</li>
            ))}
          </ul>
          <div className="mt-4">
            <Button onClick={onReview} data-testid="result-fix">
              {t.buddy.thinFix}
            </Button>
          </div>
        </Card>
      ) : null}

      {/* 4 — the path, numbered, with what each step adds */}
      <Card>
        <h2 className="text-base font-bold">{t.buddy.pathTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.buddy.pathLead}</p>

        <ol className="mt-4 grid gap-3">
          {steps.map((step, i) => {
            const isNext = i === nextStep;
            return (
              <li
                key={step.href}
                className={[
                  "flex items-start gap-3 rounded-control border px-3 py-3",
                  isNext ? "border-mint bg-mint/5" : "border-line",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                    isNext ? "bg-mint text-mintInk" : "bg-surface2 text-muted",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {step.title}
                    {/* Status is words as well as colour. */}
                    {step.done ? (
                      <span className="ml-2 text-[11px] font-semibold uppercase text-muted">
                        {t.buddy.pathDone}
                      </span>
                    ) : isNext ? (
                      <span className="ml-2 text-[11px] font-semibold uppercase text-indigoText">
                        {t.buddy.pathNext}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {nextStep >= 0 ? (
          <div className="mt-4">
            <Button onClick={() => onGoTo(steps[nextStep].href)} data-testid="interview-continue">
              {format(t.buddy.pathStart, { n: nextStep + 1 })}
            </Button>
          </div>
        ) : null}
      </Card>

      {/* 5 — the limits, not buried */}
      <Card className="border-warning/30">
        <h2 className="text-base font-bold">{t.buddy.limitsTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.buddy.resultLimits}</p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onReview}>
          {t.buddy.resultReview}
        </Button>
        <Button variant="secondary" onClick={onRetake} data-testid="result-retake">
          {t.buddy.resultRetake}
        </Button>
      </div>
    </div>
  );
}
