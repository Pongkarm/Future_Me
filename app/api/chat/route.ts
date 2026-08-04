import { NextResponse } from "next/server";
import {
  CHAT_LIMITS,
  answerChat,
  requestAnthropic,
  validateChatRequest,
  type ChatResponse,
} from "@/lib/chat";

export const runtime = "nodejs";

const TIMEOUT_MS = 8_000;
const DEFAULT_MODEL = "claude-sonnet-5";
const NO_STORE = { "Cache-Control": "no-store" } as const;

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
    ? ({ system, messages }: { system: string; messages: typeof parsed.value.messages }) =>
        requestAnthropic({
          apiKey,
          model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
          system,
          messages,
          timeoutMs: TIMEOUT_MS,
        })
    : undefined;

  const response: ChatResponse = await answerChat(parsed.value, { generate });
  return json(response);
}
