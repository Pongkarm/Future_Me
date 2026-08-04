import type { ChatMessage } from "@/lib/chat/types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_REPLY_CHARS = 4_000;

export interface AnthropicRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export class ChatProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatProviderError";
  }
}

export function extractAnthropicText(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const response = value as { content?: unknown; stop_reason?: unknown };
  // A hard output-limit stop can leave a sentence or citation incomplete.
  if (response.stop_reason === "max_tokens") return null;
  const content = response.content;
  if (!Array.isArray(content)) return null;

  const text = content
    .map((block) => {
      if (typeof block !== "object" || block === null) return "";
      const candidate = block as { type?: unknown; text?: unknown };
      return candidate.type === "text" && typeof candidate.text === "string" ? candidate.text : "";
    })
    .join("\n")
    .trim();

  return text.length > 0 ? text.slice(0, MAX_REPLY_CHARS) : null;
}

export async function requestAnthropic(input: AnthropicRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? 8_000);
  const fetchImpl = input.fetchImpl ?? fetch;

  try {
    const response = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: 500,
        // This is a short, scoped explanation task. Sonnet 5 otherwise enables
        // adaptive thinking, which shares this deliberately small token cap.
        thinking: { type: "disabled" },
        system: input.system,
        messages: input.messages,
      }),
    });

    if (!response.ok) throw new ChatProviderError(`Provider returned ${response.status}.`);

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ChatProviderError("Provider returned malformed JSON.");
    }

    const text = extractAnthropicText(data);
    if (!text) throw new ChatProviderError("Provider returned no usable text.");
    return text;
  } catch (error) {
    if (error instanceof ChatProviderError) throw error;
    const timedOut = error instanceof Error && error.name === "AbortError";
    throw new ChatProviderError(timedOut ? "Provider timed out." : "Provider is unreachable.");
  } finally {
    clearTimeout(timer);
  }
}
