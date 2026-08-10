"use client";

import { useMemo } from "react";
import {
  CONTEXT_MAX,
  DIFFERENTIATION_GATE,
  PROGRAMME_META,
  recommendProgrammes,
  type ProgrammeRecommendation,
  type Quadrant,
  type ScoredProgramme,
} from "@/lib/recommend";
import type { InterviewInput } from "@/lib/decision-engine/types";
import { format, type Dictionary } from "@/lib/i18n";

/**
 * The programme layer of the result: real courses at real institutions,
 * ranked, with every number it used on show.
 *
 * Two things this deliberately does that a score display usually does not.
 * It prints the academic fit and the contextual adjustment as separate
 * figures, because a learner is entitled to know that a programme is ranked
 * where it is partly for being nearby. And when the evidence is thin it shows
 * nothing at all and says why — an empty result with a reason is the honest
 * output, and the component treats it as a first-class state rather than an
 * error.
 */

/**
 * The routes dictionary holds nested objects as well as strings, so the label
 * lookup is written out rather than indexed by a computed key — the compiler
 * can then prove each of these five is a string.
 */
function quadrantLabel(quadrant: Quadrant, t: Dictionary): string {
  switch (quadrant) {
    case "golden-fit":
      return t.routes.programmesQuadrantGolden;
    case "growth-area":
      return t.routes.programmesQuadrantGrowth;
    case "burnout-risk":
      return t.routes.programmesQuadrantBurnout;
    case "unfavourable":
      return t.routes.programmesQuadrantUnfavourable;
    default:
      return t.routes.programmesQuadrantUnknown;
  }
}

function Meter({ core, context }: { core: number; context: number }) {
  // The two components are drawn to the same scale so the reader can see how
  // small the contextual part is relative to the academic part.
  const total = core + context;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-subtle" aria-hidden="true">
      <div className="bg-accent" style={{ width: `${(core / total) * 100}%` }} />
      <div className="bg-accent/40" style={{ width: `${(context / total) * 100}%` }} />
    </div>
  );
}

function ProgrammeCard({
  row,
  rank,
  t,
}: {
  row: ScoredProgramme;
  rank: number;
  t: Dictionary;
}) {
  const { programme: p } = row;
  return (
    <li className="rounded-lg border border-subtle p-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-muted">{rank}</span>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold leading-snug">{p.title}</h4>
          <p className="mt-0.5 text-sm text-muted">
            {p.institutionTh} · {p.provinceTh}
          </p>
        </div>
        {/*
          The interest x efficacy quadrant is shown only when efficacy was
          actually answered. The interview does not ask those six items yet, so
          for now this chip is usually absent — which is the right absence: a
          chip reading "confidence not measured" on every card teaches a reader
          to ignore the chip.
        */}
        {row.quadrant !== "unknown-efficacy" && (
          <span className="whitespace-nowrap rounded-full bg-subtle px-2 py-0.5 text-xs">
            {quadrantLabel(row.quadrant, t)}
          </span>
        )}
      </div>

      <div className="mt-3">
        <Meter core={row.core} context={row.contextComponent} />
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <div className="flex gap-1.5">
            <dt className="text-muted">{t.routes.programmesCore}</dt>
            <dd className="font-mono font-bold tabular-nums">{row.core.toFixed(1)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">{t.routes.programmesContext}</dt>
            <dd className="font-mono tabular-nums">+{row.contextComponent.toFixed(1)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted">
              {p.seatsPlanned === null
                ? t.routes.programmesSeatsUnknown
                : format(t.routes.programmesSeats, { count: p.seatsPlanned })}
            </dt>
          </div>
        </dl>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">{t.routes.programmesWhy}</summary>
        <div className="mt-2 space-y-1 font-mono text-xs text-muted">
          <p>{p.level} · cos(profile, programme) = {row.congruence.toFixed(3)}</p>
          {/* Thin fields are common enough to matter: a vector averaged from
              one occupation reads exactly like one averaged from forty. */}
          {/* The degree side counts occupations per ISCED field. The
              vocational side is audited per subject instead, so it carries no
              count — showing "0 occupations" there would read as no evidence
              rather than evidence recorded elsewhere. */}
          <p>
            {p.iscedTitle}
            {p.iscedOccupations > 0
              ? ` · RIASEC วัดจาก ${p.iscedOccupations} อาชีพ${p.iscedOccupations < 3 ? " ⚠ หลักฐานบาง" : ""}`
              : " · ดูการจับคู่อาชีพใน vocational_audit.md"}
          </p>
          {p.productionCost !== null && (
            <p>ต้นทุนผลิต/คน/ปี {p.productionCost.toLocaleString("th-TH")} บาท (ไม่ใช่ค่าเทอม)</p>
          )}
          {row.efficacy !== null && (
            <p>
              efficacy({row.efficacyDimensions.join("")}) = {row.efficacy.toFixed(2)}
            </p>
          )}
          {Object.entries(row.context.known).map(([key, value]) => (
            <p key={key}>
              {key} = {(value as number).toFixed(2)}
            </p>
          ))}
          <p className="pt-1">
            {t.routes.programmesUnknown}: {row.context.unknown.join(", ")}
          </p>
        </div>
      </details>
    </li>
  );
}

export function ProgrammeMatches({
  interview,
  provinceIso,
  t,
}: {
  interview: InterviewInput;
  provinceIso: string | null;
  t: Dictionary;
}) {
  const result = useMemo<ProgrammeRecommendation>(
    () =>
      recommendProgrammes(interview.interest, {
        provinceIso: provinceIso ?? undefined,
        tier: interview.context.tier,
        mobility: interview.context.mobility,
        budgetBand:
          interview.context.cost === "unknown" ? undefined : interview.context.cost,
      }),
    [interview, provinceIso],
  );

  if (!result.confidentEnough) {
    return (
      <section className="mt-8 rounded-lg border border-subtle bg-subtle/40 p-5" data-testid="programmes-declined">
        <h3 className="font-bold">{t.routes.programmesDeclineTitle}</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {result.blockers.includes("LOW_CONFIDENCE") && (
            <li>{t.routes.programmesDeclineLowConfidence}</li>
          )}
          {result.blockers.includes("UNDIFFERENTIATED_PROFILE") && (
            <li>
              {format(t.routes.programmesDeclineFlat, {
                diff: result.profile.differentiation.toFixed(2),
                gate: DIFFERENTIATION_GATE.toFixed(2),
              })}
            </li>
          )}
        </ul>
        <p className="mt-3 text-sm">{t.routes.programmesDeclineAction}</p>
      </section>
    );
  }

  return (
    <section className="mt-8" data-testid="programmes">
      <h3 className="text-xl font-bold">{t.routes.programmesTitle}</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        {format(t.routes.programmesIntro, { cap: CONTEXT_MAX })}
      </p>

      <div className="mt-4 rounded-lg border border-subtle p-4">
        <h4 className="text-sm font-bold">{t.routes.programmesFieldsTitle}</h4>
        <p className="mt-0.5 text-xs text-muted">{t.routes.programmesFieldsNote}</p>
        <ul className="mt-3 space-y-1.5">
          {result.fields.slice(0, 4).map((field) => (
            <li key={field.isced} className="flex items-baseline gap-3 text-sm">
              <span className="w-12 shrink-0 font-mono font-bold tabular-nums">
                {field.core.toFixed(1)}
              </span>
              <span className="min-w-0 flex-1 truncate">{field.iscedTitle}</span>
              <span className="shrink-0 text-xs text-muted">
                {format(t.routes.programmesReachable, { count: field.reachable })}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ol className="mt-4 space-y-3">
        {result.top.map((row, i) => (
          <ProgrammeCard key={`${row.programme.institutionId}-${row.programme.title}`} row={row} rank={i + 1} t={t} />
        ))}
      </ol>

      <p className="mt-4 text-xs text-muted">
        {format(t.routes.programmesCoverage, {
          n: PROGRAMME_META.programmes,
          inst: PROGRAMME_META.institutions,
        })}{" "}
        {t.routes.programmesUnknownNote}
      </p>
    </section>
  );
}
