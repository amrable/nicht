import type { Analysis } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function analyzeSentence(sentence: string): Promise<Analysis> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) {
    throw new ApiError(res.status, String(res.status));
  }
  return res.json();
}

export async function fetchStats(): Promise<{ count: number }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
  if (!res.ok) throw new ApiError(res.status, String(res.status));
  return res.json();
}

export function messageForError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) return "Verbindung fehlgeschlagen. Bitte erneut versuchen.";
    if (err.status === 429) return "Zu viele Anfragen. Bitte kurz warten.";
    if (err.status === 400) return "Eingabe ungültig.";
    if (err.status >= 500) return "Serverfehler. Bitte erneut versuchen.";
  }
  return "Serverfehler. Bitte erneut versuchen.";
}
