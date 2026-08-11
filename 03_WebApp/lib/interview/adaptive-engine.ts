import questions from "@/data/questions.json";
import { DIMENSIONS, type Dimension, type Localised } from "@/lib/decision-engine/types";

export interface InterestQuestion {
  id: string;
  dimension: Dimension;
  direction: "positive" | "negative";
  text: Localised;
}

export type FirstAnswerBranch = "unanswered" | "deepen" | "clarify" | "broaden";

export interface AdaptiveInterestPlan {
  questions: InterestQuestion[];
  followUpIds: string[];
  branch: FirstAnswerBranch;
  firstQuestionId: string;
}

const ALL_ITEMS = questions.interest as InterestQuestion[];
const FIRST_ITEM = ALL_ITEMS[0];
const FOLLOW_UP_COUNT = 2;

function itemsForDimension(dimension: Dimension, excluded: Set<string>): InterestQuestion[] {
  return ALL_ITEMS.filter((item) => item.dimension === dimension && !excluded.has(item.id));
}

function nextDimensions(dimension: Dimension): Dimension[] {
  const start = DIMENSIONS.indexOf(dimension);
  return Array.from({ length: DIMENSIONS.length - 1 }, (_, offset) =>
    DIMENSIONS[(start + offset + 1) % DIMENSIONS.length],
  );
}

/**
 * Build one stable question order from the learner's first saved answer.
 *
 * This is deliberately a small, rule-based follow-up layer rather than CAT or
 * IRT. The current 30 bilingual items remain unchanged and every learner still
 * sees all of them. Only the two questions immediately after the first one are
 * selected differently:
 *
 * - 4–5: ask two more activities from the same RIASEC dimension;
 * - 3: ask one same-dimension clarification and one adjacent dimension;
 * - 1–2: broaden to the next two dimensions instead of treating one dislike as
 *   evidence that an entire route is closed.
 *
 * Later answers never reshuffle the order, so refresh, review, and backtracking
 * remain predictable. The restored 1,000-item research file is intentionally
 * not imported here because its Thai text and psychometric properties still
 * need review.
 */
export function planInterestQuestions(
  answers: Record<string, number>,
): AdaptiveInterestPlan {
  const firstQuestionId = FIRST_ITEM.id;
  const firstAnswer = answers[firstQuestionId];

  if (!Number.isInteger(firstAnswer) || firstAnswer < 1 || firstAnswer > 5) {
    return {
      questions: [...ALL_ITEMS],
      followUpIds: [],
      branch: "unanswered",
      firstQuestionId,
    };
  }

  const excluded = new Set<string>([firstQuestionId]);
  const sameDimension = itemsForDimension(FIRST_ITEM.dimension, excluded);
  const adjacentDimensions = nextDimensions(FIRST_ITEM.dimension);
  let candidates: InterestQuestion[];
  let branch: FirstAnswerBranch;

  if (firstAnswer >= 4) {
    branch = "deepen";
    candidates = sameDimension.slice(0, FOLLOW_UP_COUNT);
  } else if (firstAnswer === 3) {
    branch = "clarify";
    const adjacent = itemsForDimension(adjacentDimensions[0], excluded)[0];
    candidates = [sameDimension[0], adjacent].filter(
      (item): item is InterestQuestion => Boolean(item),
    );
  } else {
    branch = "broaden";
    candidates = adjacentDimensions
      .map((dimension) => itemsForDimension(dimension, excluded)[0])
      .filter((item): item is InterestQuestion => Boolean(item))
      .slice(0, FOLLOW_UP_COUNT);
  }

  const followUps = candidates.filter((item, index, list) =>
    list.findIndex((candidate) => candidate.id === item.id) === index,
  );
  const followUpIds = followUps.map((item) => item.id);
  const prioritised = new Set([firstQuestionId, ...followUpIds]);

  return {
    questions: [FIRST_ITEM, ...followUps, ...ALL_ITEMS.filter((item) => !prioritised.has(item.id))],
    followUpIds,
    branch,
    firstQuestionId,
  };
}

