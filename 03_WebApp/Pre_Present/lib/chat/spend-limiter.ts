import { createRateLimiter } from "@/lib/chat/rate-limit";

/**
 * One ceiling shared by every route that spends the API key.
 *
 * Deliberately a single instance rather than one per route. The budget is
 * shared, so the limit has to be too: a per-route ceiling would let anyone
 * take the sum of them, and rate-limiting only the busiest endpoint just moves
 * the attack to the quieter one.
 *
 * Per-client is loose because a school shares one address through NAT — a
 * tight limit locks out a classroom rather than an abuser. The global ceiling
 * is what actually protects the key, and it is the one to lower first if spend
 * moves faster than expected.
 *
 * State is in this process: several instances enforce it several times over,
 * and a restart clears it. That makes this a budget guard, not authentication.
 * A shared store swaps in behind `createRateLimiter` without touching callers.
 */
const WINDOW_MS = 5 * 60_000;

const positiveOr = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const spendLimiter = createRateLimiter({
  perClient: {
    limit: positiveOr(process.env.CHAT_RATE_LIMIT_PER_CLIENT, 30),
    windowMs: WINDOW_MS,
  },
  global: {
    limit: positiveOr(process.env.CHAT_RATE_LIMIT_GLOBAL, 600),
    windowMs: WINDOW_MS,
  },
});
