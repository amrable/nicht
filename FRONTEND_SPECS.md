# Frontend Specs — German Sentence Analyzer

## 1. Purpose

A single-page web app where the user pastes a German sentence and gets back a structured grammatical analysis. Minimal UI, no accounts, no history, no settings.

## 2. Tech stack

- **Build tool:** Vite
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP:** native `fetch`
- **State:** `useState` only (no Redux, no Zustand, no React Query)
- **Deploy:** Vercel / Netlify / Cloudflare Pages (static output)

## 3. Project layout

```
/web
  src/
    App.tsx              # The entire app
    components/
      SentenceInput.tsx
      NounsTable.tsx
      VerbsTable.tsx
      Breakdown.tsx
      LoadingSkeleton.tsx
      ErrorBanner.tsx
    lib/
      api.ts             # analyzeSentence() fetch wrapper
      types.ts           # Shared types (mirrors backend schema)
    index.css            # Tailwind directives
    main.tsx
  public/
  .env.example           # VITE_API_URL
  index.html
  package.json
  tailwind.config.js
  tsconfig.json
  vite.config.ts
```

## 4. Environment variables

| Name           | Required | Example                          | Purpose                     |
|----------------|----------|----------------------------------|-----------------------------|
| `VITE_API_URL` | yes      | `https://api.myapp.com`          | Backend base URL            |

Accessed via `import.meta.env.VITE_API_URL`.

## 5. Types (mirror backend)

```ts
// lib/types.ts
export type Noun = {
  word: string;
  article: "der" | "die" | "das";
  plural: string | null;
};

export type Verb = {
  infinitive: string;
  formInSentence: string;
  partizipII: string;
  auxiliary: "haben" | "sein";
};

export type BreakdownItem = {
  part: string;
  role: string;
};

export type Analysis = {
  nouns: Noun[];
  verbs: Verb[];
  breakdown: BreakdownItem[];
};
```

## 6. API wrapper

```ts
// lib/api.ts
export async function analyzeSentence(sentence: string): Promise<Analysis> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error);
  }
  return res.json();
}
```

## 7. UI layout

Single-column, centered, max-width `640px`, generous vertical spacing.

```
┌─────────────────────────────────────┐
│  German Sentence Analyzer           │   ← h1, muted
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [textarea, 3 rows]          │    │   ← paste here
│  └─────────────────────────────┘    │
│             [ Analysieren ]         │   ← button, right-aligned
│                                     │
│  ─── Nomen ───                      │
│  ┌─────────────────────────────┐    │
│  │ der  Apfel     die Äpfel    │    │   ← 3-col table
│  └─────────────────────────────┘    │
│                                     │
│  ─── Verben ───                     │
│  ┌─────────────────────────────┐    │
│  │ essen                        │   │
│  │   im Satz:   habe...gegessen │   │
│  │   Partizip II: gegessen      │   │
│  │   Hilfsverb: haben           │   │
│  └─────────────────────────────┘    │
│                                     │
│  ─── Aufbau ───                     │
│  Ich                Subjekt (Nom.)  │
│  habe ... gegessen  Prädikat        │
│  gestern            Temporaladverb  │
│  einen Apfel        Akkusativobjekt │
└─────────────────────────────────────┘
```

All section labels in German: **Nomen**, **Verben**, **Aufbau**.
Button label in German: **Analysieren**.

## 8. Components

### `App.tsx`
Holds the top-level state:
```ts
const [sentence, setSentence] = useState("");
const [data, setData] = useState<Analysis | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```
Owns the `onAnalyze` handler. Renders `<SentenceInput>`, then conditionally `<LoadingSkeleton>`, `<ErrorBanner>`, or the three result components.

### `SentenceInput`
Props: `value`, `onChange`, `onSubmit`, `disabled`.
- `<textarea>` with `rows={3}`, `maxLength={500}`, placeholder `"Deutschen Satz hier einfügen..."`
- "Analysieren" button, disabled when sentence is empty or `disabled` prop is true
- Submits on Ctrl+Enter / Cmd+Enter as well

### `NounsTable`
Props: `nouns: Noun[]`.
- If empty: render nothing.
- Otherwise: table with three columns — Artikel, Wort, Plural.
- Render article as colored pill: `der` = blue, `die` = red, `das` = green. (Standard mnemonic colors.)
- `plural === null` renders as "—".

### `VerbsTable`
Props: `verbs: Verb[]`.
- If empty: render nothing.
- One card per verb, infinitive as header, three rows beneath: "im Satz", "Partizip II", "Hilfsverb".

### `Breakdown`
Props: `items: BreakdownItem[]`.
- If empty: render nothing.
- Two-column list: `part` (bold, monospace-ish) on the left, `role` (muted) on the right.
- On narrow screens, stack them.

### `LoadingSkeleton`
Three shimmering placeholder blocks mirroring the three result sections.

### `ErrorBanner`
Red tinted box above the input with the error message and a dismiss button.

## 9. State machine

```
idle ──submit──> loading ──success──> result
                         └─error────> error
result/error ──submit──> loading (clears previous data/error)
```

On new submission, clear `data` and `error` before setting `loading = true`.

## 10. Styling conventions

- Tailwind only; no custom CSS except Tailwind directives in `index.css`.
- Font: system font stack (`font-sans`).
- Colors: neutral grays (`slate-*`), accents only for article pills and error state.
- Subtle borders (`border-slate-200`), no shadows on cards beyond `shadow-sm`.
- Section separators: small uppercase label + thin divider line.
- Responsive: works down to 360px width.

## 11. Accessibility

- `<textarea>` has an associated `<label>` (visually hidden is fine).
- Button has accessible label.
- Loading state announced via `aria-live="polite"` region.
- Error banner has `role="alert"`.
- Color is never the only carrier of meaning — article pills also show the text `der`/`die`/`das`.

## 12. Error UX

- Network failure → `"Verbindung fehlgeschlagen. Bitte erneut versuchen."`
- 429 → `"Zu viele Anfragen. Bitte kurz warten."`
- 400 → `"Eingabe ungültig."`
- 5xx → `"Serverfehler. Bitte erneut versuchen."`

Keep previous successful result visible while retrying? **No** — clear it. Simpler mental model.

## 13. Local dev

```bash
cd web
cp .env.example .env
# set VITE_API_URL=http://localhost:3001
npm install
npm run dev   # vite, opens http://localhost:5173
```

## 14. Build & deploy

```bash
npm run build   # outputs /dist
```

Deploy `/dist` as static site. Set `VITE_API_URL` in the host's env config before building.

## 15. Out of scope (v1)

- History of analyzed sentences
- Copy-to-clipboard buttons
- Dark mode toggle
- Audio pronunciation
- Adjective declension, case tables, translation
- Offline support / PWA
- Tests (add Vitest + Testing Library in v2 if the app sticks)
