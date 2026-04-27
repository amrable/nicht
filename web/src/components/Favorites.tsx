import { useFavorites } from "../lib/favorites";
import { useAuth } from "../lib/auth";
import { NounsTable } from "./NounsTable";
import { VerbsTable } from "./VerbsTable";
import type { Noun, Verb } from "../lib/types";

export function Favorites() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const { favorites, loading } = useFavorites();

  if (authLoading) return null;

  if (!user) {
    return (
      <div
        className="mx-auto"
        style={{ maxWidth: 640, marginTop: 24, textAlign: "center" }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Sign in to view your saved words.
        </p>
        <button
          type="button"
          onClick={openLoginModal}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    );
  }

  const nouns = favorites
    .filter((f) => f.kind === "noun")
    .map((f) => f.payload as Noun);
  const verbs = favorites
    .filter((f) => f.kind === "verb")
    .map((f) => f.payload as Verb);

  return (
    <div className="mx-auto" style={{ maxWidth: 1100 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          margin: 0,
        }}
      >
        Favorites{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          — your saved words
        </span>
      </h1>

      {loading && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 16 }}>
          Loading…
        </p>
      )}

      {!loading && favorites.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 24 }}>
          Star a word to save it here.
        </p>
      )}

      {!loading && favorites.length > 0 && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
          style={{ marginTop: 24 }}
        >
          <NounsTable nouns={nouns} />
          <VerbsTable verbs={verbs} />
        </div>
      )}
    </div>
  );
}
