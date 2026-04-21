# nicht.wtf — German Sentence Analyzer

A minimal web app: paste a German sentence, get a structured grammatical analysis (nouns with articles + plurals, verbs with Partizip II + auxiliary, breakdown by grammatical role).

## Structure

- [`api/`](api) — Express + TypeScript backend. Proxies to OpenRouter with a fixed system prompt, validates response with Zod. Stateless, no DB.
- [`web/`](web) — Vite + React + TypeScript + Tailwind frontend. Single screen.

## Quick start

```bash
# backend
cd api
cp .env.example .env      # fill in OPENROUTER_API_KEY + OPENROUTER_MODEL
npm install
npm run dev               # http://localhost:3001

# frontend (in another terminal)
cd web
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm install
npm run dev               # http://localhost:5173
```
# nicht
