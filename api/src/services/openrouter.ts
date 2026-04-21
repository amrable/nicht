import { SYSTEM_PROMPT } from "../prompts/system.js";
import { AnalysisResponse, type Analysis } from "../schemas/analysis.js";

export class UpstreamError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
    this.name = "UpstreamError";
  }
}

export class UpstreamTimeoutError extends Error {
  constructor() {
    super("Upstream timeout");
    this.name = "UpstreamTimeoutError";
  }
}

export async function analyzeWithOpenRouter(sentence: string): Promise<Analysis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) {
    throw new Error("Missing OPENROUTER_API_KEY or OPENROUTER_MODEL");
  }

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: sentence },
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err: unknown) {
    const name = (err as { name?: string } | null)?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new UpstreamTimeoutError();
    }
    throw new UpstreamError("Upstream network error");
  }

  if (!res.ok) {
    throw new UpstreamError(`Upstream status ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new UpstreamError("Empty upstream response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new UpstreamError("Upstream returned invalid JSON");
  }

  const result = AnalysisResponse.safeParse(parsed);
  if (!result.success) {
    throw new UpstreamError("Upstream returned unexpected shape");
  }
  return result.data;
}
