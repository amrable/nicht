import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useFavorites } from "../lib/favorites";
import type { FavoriteKind, Noun, Verb } from "../lib/types";

type Props = {
  kind: FavoriteKind;
  favKey: string;
  payload: Noun | Verb;
};

export function StarButton({ kind, favKey, payload }: Props) {
  const { user, requireAuth } = useAuth();
  const { has, toggle } = useFavorites();
  const [busy, setBusy] = useState(false);
  const saved = user ? has(kind, favKey) : false;

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!user) {
        try {
          await requireAuth();
        } catch {
          setBusy(false);
          return;
        }
      }
      await toggle(kind, favKey, payload);
    } catch {
      // swallow — UI already reverted via optimistic-rollback path
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from Favorites" : "Add to Favorites"}
      title={saved ? "Saved — click to remove" : "Save to Favorites"}
      disabled={busy}
      style={{
        background: "transparent",
        border: 0,
        padding: 4,
        cursor: busy ? "default" : "pointer",
        color: saved ? "var(--accent, #f5b301)" : "var(--text-muted)",
        lineHeight: 0,
        opacity: busy ? 0.5 : 1,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
