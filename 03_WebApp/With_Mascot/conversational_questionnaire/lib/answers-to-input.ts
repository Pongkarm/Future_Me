/**
 * The boundary between the conversation and the scoring engine.
 *
 * Everything above this file collects answers. Everything below it
 * (`lib/decision-engine`) scores them. This module only moves data across, and
 * it does three things carefully:
 *
 *  1. Values pass through RAW. `applyDirection` runs inside the engine; a value
 *     reflected here would be reflected twice for a reverse-keyed item and land
 *     back where it started — a wrong score with no error. The bank has no
 *     reverse items today, which is exactly why the mistake would ship silently.
 *
 *  2. Unanswered items are OMITTED, never defaulted. A neutral 3 for a skipped
 *     question would fabricate data and push the answered count past the
 *     completeness gate, so the engine would recommend routes from evidence
 *     that does not exist.
 *
 *  3. Only `affectsResult` answers are read, so an unscored follow-up cannot
 *     reach the engine.
 */
import type {
  CostAnswer,
  Horizon,
  InterviewInput,
  Mobility,
  Tier,
} from "@/lib/decision-engine/types";
import type { AnswerRecord } from "../types";

const TIERS: Tier[] = ["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"];
const COSTS: CostAnswer[] = ["tight", "moderate", "flexible", "unknown"];
const MOBILITIES: Mobility[] = ["local_only", "can_move", "unknown"];
const HORIZONS: Horizon[] = ["soon", "later", "unsure"];

/** Context ids that are interest items rather than context, for clarity below. */
const CONTEXT_IDS = ["tier", "cost", "mobility", "horizon", "proud"] as const;
type ContextId = (typeof CONTEXT_IDS)[number];

function isContextId(id: string): id is ContextId {
  return (CONTEXT_IDS as readonly string[]).includes(id);
}

/**
 * Build the engine's input from conversation answers.
 *
 * Unknown option values are dropped rather than coerced: a value that is not in
 * the union is a data error, and passing it through would put the engine in a
 * state its types say is impossible.
 */
export function toInterviewInput(answers: Record<string, AnswerRecord>): InterviewInput {
  const interest: Record<string, number> = {};
  const context: InterviewInput["context"] = {};

  for (const record of Object.values(answers)) {
    if (!record.affectsResult) continue;

    if (!isContextId(record.stepId)) {
      const value = Number(record.value);
      if (!Number.isFinite(value)) continue;
      interest[record.stepId] = value;
      continue;
    }

    const value = String(record.value);
    switch (record.stepId) {
      case "tier":
        if (TIERS.includes(value as Tier)) context.tier = value as Tier;
        break;
      case "cost":
        if (COSTS.includes(value as CostAnswer)) context.cost = value as CostAnswer;
        break;
      case "mobility":
        if (MOBILITIES.includes(value as Mobility)) context.mobility = value as Mobility;
        break;
      case "horizon":
        if (HORIZONS.includes(value as Horizon)) context.horizon = value as Horizon;
        break;
      case "proud":
        if (value.trim() !== "") context.proud = value;
        break;
    }
  }

  return { interest, context };
}
