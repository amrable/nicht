# Backend Specs — German Sentence Analyzer

## 1. Purpose

A thin HTTP server that:
1. Accepts a German sentence from the frontend.
2. Forwards it to an LLM via OpenRouter with a fixed system prompt.
3. Returns a structured JSON grammatical analysis.
4. Hides the OpenRouter API key and enforces rate limits.

No database. No auth. No persistence. Stateless.

## 2. Tech stack

- **Runtime:** Node.js 20+
- **Framework:** Express 4 (or Hono if deploying to edge runtimes)
- **Language:** TypeScript
- **Validation:** Zod
- **HTTP client:** native `fetch`
- **Rate limiting:** `express-rate-limit` (in-memory) — swap for Upstash Redis if deployed to multiple instances

## 3. Project layout

```
/api
  src/
    index.ts           # Express app bootstrap
    routes/
      analyze.ts       # POST /api/analyze
    services/
      openrouter.ts    # LLM call
    prompts/
      system.ts        # System prompt constant
    schemas/
      analysis.ts      # Zod schemas for request/response
    middleware/
      rateLimit.ts
      errorHandler.ts
  .env.example
  package.json
  tsconfig.json
  README.md
```

## 4. Environment variables

| Name                  | Required | Example                          | Purpose                              |
|-----------------------|----------|----------------------------------|--------------------------------------|
| `OPENROUTER_API_KEY`  | yes      | `sk-or-v1-...`                   | Auth for OpenRouter                  |
| `OPENROUTER_MODEL`    | yes      | `anthropic/claude-sonnet-4`      | Which model to use                   |
| `PORT`                | no       | `3001`                           | Server port (default 3001)           |
| `ALLOWED_ORIGIN`      | yes      | `https://myapp.vercel.app`       | CORS origin for the frontend         |
| `RATE_LIMIT_MAX`      | no       | `20`                             | Requests per window (default 20)     |
| `RATE_LIMIT_WINDOW_MS`| no       | `600000`                         | Window in ms (default 10 min)        |

## 5. Endpoints

### `POST /api/analyze`

**Request body**
```json
{ "sentence": "Ich habe gestern einen Apfel gegessen." }
```

**Validation rules**
- `sentence`: string, trimmed, length 1–500
- Reject with `400` if invalid.

**Success response — 200**
```json
{
  "nouns": [
    { "word": "Apfel", "article": "der", "plural": "die Äpfel" }
  ],
  "verbs": [
    {
      "infinitive": "essen",
      "formInSentence": "habe ... gegessen",
      "partizipII": "gegessen",
      "auxiliary": "haben"
    }
  ],
  "breakdown": [
    { "part": "Ich", "role": "Subjekt (Nominativ)" },
    { "part": "habe ... gegessen", "role": "Prädikat im Perfekt (Satzklammer)" },
    { "part": "gestern", "role": "Temporaladverb" },
    { "part": "einen Apfel", "role": "Akkusativobjekt" }
  ]
}
```

**Error responses**
| Status | Body                                         | When                                  |
|--------|----------------------------------------------|---------------------------------------|
| 400    | `{ "error": "Invalid input" }`               | Zod validation fails                  |
| 429    | `{ "error": "Too many requests" }`           | Rate limit exceeded                   |
| 502    | `{ "error": "Upstream model error" }`        | OpenRouter returns non-2xx            |
| 500    | `{ "error": "Internal error" }`              | Unhandled exception                   |
| 504    | `{ "error": "Upstream timeout" }`            | LLM call exceeds 30s                  |

### `GET /api/health`

Returns `200 { "ok": true }`. For uptime checks.

## 6. Zod schemas

```ts
// schemas/analysis.ts
import { z } from "zod";

export const AnalyzeRequest = z.object({
  sentence: z.string().trim().min(1).max(500),
});

export const Noun = z.object({
  word: z.string(),
  article: z.enum(["der", "die", "das"]),
  plural: z.string().nullable(),
});

export const Verb = z.object({
  infinitive: z.string(),
  formInSentence: z.string(),
  partizipII: z.string(),
  auxiliary: z.enum(["haben", "sein"]),
});

export const BreakdownItem = z.object({
  part: z.string(),
  role: z.string(),
});

export const AnalysisResponse = z.object({
  nouns: z.array(Noun),
  verbs: z.array(Verb),
  breakdown: z.array(BreakdownItem),
});
```

The LLM response is parsed and validated with `AnalysisResponse.parse(...)`. If validation fails, return `502`.

## 7. System prompt (fixed, server-side constant)

```ts
// prompts/system.ts
export const SYSTEM_PROMPT = `
Du bist ein präziser Grammatik-Analysator für deutsche Sätze. Du bekommst genau einen deutschen Satz und gibst ausschließlich ein JSON-Objekt zurück, das exakt diesem Schema entspricht:

{
  "nouns": [
    { "word": string, "article": "der" | "die" | "das", "plural": string | null }
  ],
  "verbs": [
    {
      "infinitive": string,
      "formInSentence": string,
      "partizipII": string,
      "auxiliary": "haben" | "sein"
    }
  ],
  "breakdown": [
    { "part": string, "role": string }
  ]
}

Regeln:
1. Antworte NUR mit gültigem JSON. Kein Fließtext, keine Markdown-Codeblöcke, keine Kommentare.
2. "nouns": Liste ALLE Nomen im Satz in der Reihenfolge ihres Vorkommens. "word" ist der Nominativ Singular. "article" ist der bestimmte Artikel im Nominativ Singular. "plural" ist die Pluralform inklusive Artikel "die" (z. B. "die Äpfel"). Wenn das Nomen nur im Plural existiert oder nicht pluralisierbar ist, setze "plural" auf null. Eigennamen werden ausgelassen.
3. "verbs": Liste ALLE Verben im Satz, inklusive Hilfs- und Modalverben, in der Reihenfolge ihres Vorkommens. "formInSentence" ist die tatsächlich im Satz verwendete Form, bei zusammengesetzten Zeiten mit "..." zwischen den Teilen (z. B. "habe ... gegessen"). "partizipII" ist immer die Partizip-II-Form des Verbs, auch wenn sie im Satz nicht vorkommt. "auxiliary" ist das Hilfsverb, das dieses Verb im Perfekt verwendet ("haben" oder "sein").
4. "breakdown": Zerlege den Satz in seine grammatischen Bestandteile. Jeder Eintrag enthält "part" (der exakte Wortlaut aus dem Satz) und "role" (die grammatische Funktion auf Deutsch, z. B. "Subjekt (Nominativ)", "Akkusativobjekt", "Dativobjekt", "Temporaladverb", "Lokaladverb", "Präpositionalobjekt", "Prädikat", "Nebensatz (Kausalsatz)"). Die Reihenfolge folgt dem Satz. Fasse Satzklammern (Hilfsverb + Partizip / Modalverb + Infinitiv) zu einem Eintrag zusammen.
5. Rechtschreibung und Großschreibung bleiben exakt wie im Originalsatz.
6. Wenn der Input kein deutscher Satz ist oder unverständlich, gib { "nouns": [], "verbs": [], "breakdown": [] } zurück.
`.trim();
```

## 8. OpenRouter call

```ts
// services/openrouter.ts
const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: process.env.OPENROUTER_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: sentence },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
  }),
  signal: AbortSignal.timeout(30_000),
});
```

Parse `data.choices[0].message.content` as JSON, then validate against `AnalysisResponse`.

## 9. Middleware order

1. `cors({ origin: process.env.ALLOWED_ORIGIN })`
2. `express.json({ limit: "10kb" })`
3. Rate limiter (applied to `/api/analyze` only)
4. Route handlers
5. Error handler (last)

## 10. Logging

- Log one line per request: method, path, status, duration, sentence length.
- Never log the full sentence content (privacy).
- Never log the OpenRouter API key.
- Log validation failures and upstream errors with stack traces.

## 11. Local dev

```bash
cd api
cp .env.example .env
# fill in OPENROUTER_API_KEY, OPENROUTER_MODEL, ALLOWED_ORIGIN=http://localhost:5173
npm install
npm run dev   # tsx watch src/index.ts
```

Server listens on `http://localhost:3001`.

## 12. Deployment targets

Any Node host: Railway, Render, Fly.io, Cloudflare Workers (Hono variant). Must support long-running HTTP (30s timeout) and environment variables.

## 13. Out of scope (v1)

- User accounts
- Storing sentences
- Streaming responses
- Multiple languages
- Analytics
