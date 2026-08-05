import { NextResponse } from "next/server";
import {
  CHAT_LIMITS,
  ChatProviderError,
  answerChat,
  clientKeyFromHeaders,
  createRateLimiter,
  requestAnthropic,
  validateChatRequest,
  type ChatResponse,
} from "@/lib/chat";

export const runtime = "nodejs";

const TIMEOUT_MS = 8_000;
const DEFAULT_MODEL = "claude-sonnet-5";
const NO_STORE = { "Cache-Control": "no-store" } as const;

const WINDOW_MS = 5 * 60_000;

/*
 * Generous per visitor, because a whole class behind one school NAT shares an
 * address and must not lock each other out; the global ceiling is what
 * actually protects the key. Both are env-tunable so a deployment can tighten
 * them without a release.
 */
const limiter = createRateLimiter({
  perClient: { limit: Number(process.env.CHAT_RATE_LIMIT_PER_CLIENT ?? 30), windowMs: WINDOW_MS },
  global: { limit: Number(process.env.CHAT_RATE_LIMIT_GLOBAL ?? 600), windowMs: WINDOW_MS },
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function GET() {
  const available = Boolean(process.env.ANTHROPIC_API_KEY);
  return json({
    available,
    mode: available ? "ai" : "offline",
    limits: CHAT_LIMITS,
  });
}

type BodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false; code: "MALFORMED_JSON" | "PAYLOAD_TOO_LARGE" };

/** Bound raw bytes before parsing so the semantic text limit is not bypassed. */
async function readJsonBody(request: Request): Promise<BodyReadResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > CHAT_LIMITS.maxRequestBytes) {
    return { ok: false, code: "PAYLOAD_TOO_LARGE" };
  }

  if (!request.body) return { ok: false, code: "MALFORMED_JSON" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > CHAT_LIMITS.maxRequestBytes) {
        await reader.cancel();
        return { ok: false, code: "PAYLOAD_TOO_LARGE" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, code: "MALFORMED_JSON" };
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  /*
   * Checked before the body is read: refusing costs nothing then, and a caller
   * trying to exhaust the quota should not also get to make us parse 64KB per
   * attempt.
   */
  const decision = limiter.check(clientKeyFromHeaders(request.headers));
  if (!decision.allowed) {
    console.warn(`[chat] rate limited (${decision.scope})`);
    return NextResponse.json(
      { error: "Too many requests. Try again shortly.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(decision.retryAfterSeconds) },
      },
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok && bodyResult.code === "PAYLOAD_TOO_LARGE") {
    return json({ error: "Request body is too large.", code: bodyResult.code }, 413);
  }
  if (!bodyResult.ok) {
    return json({ error: "Malformed JSON request body.", code: "MALFORMED_JSON" }, 400);
  }

  const parsed = validateChatRequest(bodyResult.value);
  if (!parsed.ok) {
    return json({ error: parsed.error, code: parsed.code }, 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const generate = apiKey
    ? async ({ system, messages }: { system: string; messages: typeof parsed.value.messages }) => {
        try {
          return await requestAnthropic({
            apiKey,
            model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
            system,
            messages,
            timeoutMs: TIMEOUT_MS,
          });
        } catch (error) {
          /*
           * The learner gets the offline answer either way — answerChat treats
           * a throw as "no AI available". This line is the only place the
           * distinction survives, and without it a dead key, an exhausted
           * quota and a safety refusal are the same silent degradation.
           * Nothing from the conversation is logged.
           */
          if (error instanceof ChatProviderError) {
            const wait = error.retryAfterSeconds ? ` retry-after=${error.retryAfterSeconds}s` : "";
            console.warn(`[chat] provider unavailable: ${error.reason}${wait}`);
          } else {
            console.warn("[chat] provider unavailable: unknown");
          }
          throw error;
        }
      }
    : undefined;

  const response: ChatResponse = await answerChat(parsed.value, { generate });
  return json(response);
}
