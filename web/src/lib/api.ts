import type { AuthUser, Favorite, FavoriteKind, MultiAnalysis, Noun, Verb } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function analyzeSentence(sentence: string): Promise<MultiAnalysis> {
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

export async function shareAnalysis(
  sentence: string,
  analysis: MultiAnalysis,
): Promise<{ id: string }> {
  const { id: _id, sentence: _s, ...rest } = analysis;
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL}/api/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence, analysis: rest }),
    });
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) {
    throw new ApiError(res.status, String(res.status));
  }
  return res.json();
}

export async function fetchSharedAnalysis(id: string): Promise<MultiAnalysis> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL}/api/shared/${id}`);
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

const API = import.meta.env.VITE_API_URL;

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "network");
  }
  if (!res.ok) throw new ApiError(res.status, String(res.status));
  return res.json() as Promise<T>;
}

export function getMe(): Promise<{ user: AuthUser | null }> {
  return authFetch("/api/auth/me");
}

export function loginWithGoogle(idToken: string): Promise<{ user: AuthUser }> {
  return authFetch("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function logout(): Promise<{ ok: true }> {
  return authFetch("/api/auth/logout", { method: "POST" });
}

export function listFavorites(): Promise<{ favorites: Favorite[] }> {
  return authFetch("/api/favorites");
}

export function addFavorite(
  kind: FavoriteKind,
  key: string,
  payload: Noun | Verb,
): Promise<{ favorite: Favorite }> {
  return authFetch("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ kind, key, payload }),
  });
}

export function removeFavorite(
  kind: FavoriteKind,
  key: string,
): Promise<{ ok: true; removed: number }> {
  const params = new URLSearchParams({ kind, key });
  return authFetch(`/api/favorites?${params.toString()}`, { method: "DELETE" });
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
