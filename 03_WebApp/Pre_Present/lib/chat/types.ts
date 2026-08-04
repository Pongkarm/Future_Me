export const CHAT_LIMITS = {
  // A valid alternating conversation starts and ends with user, so the
  // largest possible count is odd.
  maxMessages: 11,
  maxMessageChars: 2_000,
  maxTotalChars: 8_000,
  maxRequestBytes: 64_000,
} as const;

export type ChatLanguage = "en" | "th";
export type ChatRole = "user" | "assistant";
export type ChatMode = "ai" | "offline" | "safety";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  language: ChatLanguage;
}

export interface ChatSource {
  id: string;
  title: string;
  excerpt?: string;
  url?: string;
  status?: string;
}

export interface ChatSafety {
  heading: string;
  action: string;
  hotline: string;
  disclaimer: string;
}

export interface ChatResponse {
  message: string;
  mode: ChatMode;
  sources: ChatSource[];
  note?: string;
  safety?: ChatSafety;
}

export type ChatValidationResult =
  | { ok: true; value: ChatRequest }
  | { ok: false; error: string; code: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => keys.has(key));
}

/**
 * Treat the browser body as untrusted. In particular, callers cannot inject a
 * system message or attach arbitrary context that would later be forwarded to
 * the model provider.
 */
export function validateChatRequest(value: unknown): ChatValidationResult {
  if (!isRecord(value)) {
    return { ok: false, code: "INVALID_BODY", error: "Request body must be a JSON object." };
  }

  if (!hasOnlyKeys(value, new Set(["messages", "language"]))) {
    return {
      ok: false,
      code: "UNKNOWN_FIELD",
      error: "Only messages and language are accepted.",
    };
  }

  if (value.language !== "en" && value.language !== "th") {
    return { ok: false, code: "INVALID_LANGUAGE", error: "language must be 'en' or 'th'." };
  }

  if (!Array.isArray(value.messages) || value.messages.length === 0) {
    return {
      ok: false,
      code: "INVALID_MESSAGES",
      error: "messages must contain at least one message.",
    };
  }

  if (value.messages.length > CHAT_LIMITS.maxMessages) {
    return {
      ok: false,
      code: "TOO_MANY_MESSAGES",
      error: `At most ${CHAT_LIMITS.maxMessages} messages are accepted.`,
    };
  }

  const messages: ChatMessage[] = [];
  let totalChars = 0;

  for (const candidate of value.messages) {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, new Set(["role", "content"]))) {
      return {
        ok: false,
        code: "INVALID_MESSAGE",
        error: "Each message must contain only role and content.",
      };
    }

    if (candidate.role !== "user" && candidate.role !== "assistant") {
      return {
        ok: false,
        code: "INVALID_ROLE",
        error: "Message role must be 'user' or 'assistant'.",
      };
    }

    if (typeof candidate.content !== "string") {
      return {
        ok: false,
        code: "INVALID_CONTENT",
        error: "Message content must be text.",
      };
    }

    const content = candidate.content.trim();
    if (content.length === 0) {
      return {
        ok: false,
        code: "EMPTY_CONTENT",
        error: "Message content cannot be empty.",
      };
    }
    if (content.length > CHAT_LIMITS.maxMessageChars) {
      return {
        ok: false,
        code: "MESSAGE_TOO_LONG",
        error: `Each message is limited to ${CHAT_LIMITS.maxMessageChars} characters.`,
      };
    }

    totalChars += content.length;
    if (totalChars > CHAT_LIMITS.maxTotalChars) {
      return {
        ok: false,
        code: "HISTORY_TOO_LONG",
        error: `Message history is limited to ${CHAT_LIMITS.maxTotalChars} characters.`,
      };
    }

    messages.push({ role: candidate.role, content });
  }

  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return {
      ok: false,
      code: "INVALID_TURN_ORDER",
      error: "The conversation must start and end with a user message.",
    };
  }

  for (let index = 1; index < messages.length; index += 1) {
    if (messages[index].role === messages[index - 1].role) {
      return {
        ok: false,
        code: "INVALID_TURN_ORDER",
        error: "User and assistant messages must alternate.",
      };
    }
  }

  return { ok: true, value: { messages, language: value.language } };
}
