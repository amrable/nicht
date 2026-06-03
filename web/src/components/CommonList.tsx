import { useEffect, useMemo, useState } from "react";
import type { Analysis } from "../lib/types";
import { useLearned } from "../lib/learned";
import { useAuth } from "../lib/auth";

type Entry = { id: number; slug: string; sentence: string; analysis: { sentences: Analysis[] } };
type Tab = "all" | "unlearned" | "learned";

function CheckButton({
  learned,
  onToggle,
}: {
  learned: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={learned ? "Mark as not learned" : "Mark as learned"}
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: learned ? "none" : "1.5px solid var(--border)",
        background: learned ? "var(--learned-bg)" : "transparent",
        color: learned ? "var(--learned-fg)" : "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 15,
        lineHeight: 1,
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      ✓
    </button>
  );
}

export function CommonList() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const { isLearned, toggle, loading: learnedLoading } = useLearned();
  const { user } = useAuth();

  useEffect(() => {
    fetch("/common-sentences.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Entry[]) => setEntries(data))
      .catch(() => setError("Could not load sentences."));
  }, []);

  const totalCount = useMemo(() => {
      if (!entries) return 0;
      return entries.length;
    }, [entries]);

    const totalCount = useMemo(() => {
      if (!entries) return 0;
      return entries.length;
    }, [entries]);

    const learnedCount = useMemo(() => {
    if (!entries) return 0;
    return entries.filter((e) => isLearned(e.id)).length;
  }, [entries, isLearned]);

  const unlearnedCount = useMemo(() => {
    if (!entries) return 0;
    return entries.filter((e) => !isLearned(e.id)).length;
  }, [entries, isLearned]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    let source = entries;
    if (tab === "learned") source = entries.filter((e) => isLearned(e.id));
    else if (tab === "unlearned") source = entries.filter((e) => !isLearned(e.id));
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((e) => e.sentence.toLowerCase().includes(q));
  }, [entries, query, tab, isLearned]);

  function handleToggle(e: React.MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--text)" : "var(--text-muted)",
    background: active ? "var(--surface)" : "transparent",
    border: active ? "1px solid var(--border)" : "1px solid transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.1s, color 0.1s",
  });

  return (
    <div className="mx-auto" style={{ maxWidth: 720 }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        Common sentences{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          — {totalCount}{totalCount === 1 ? " example, fully analyzed" : " examples, fully analyzed"}
        </span>
      </h1>
      <p
        lang="en"
        style={{
          marginTop: 8,
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        Tap any sentence to see its full breakdown — articles, plurals, verb
        forms, and case roles.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 4 }}>
        <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>
          All
        </button>
        <button style={tabStyle(tab === "unlearned")} onClick={() => setTab("unlearned")}>
          Unlearned{user && unlearnedCount > 0 ? ` (${unlearnedCount})` : ""}
        </button>
        <button style={tabStyle(tab === "learned")} onClick={() => setTab("learned")}>
          Learned{learnedCount > 0 ? ` (${learnedCount})` : ""}
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sentences..."
        aria-label="Search common sentences"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 14px",
          fontSize: 15,
          fontFamily: "inherit",
          color: "var(--text)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {error && (
        <p style={{ marginTop: 16, color: "var(--text-muted)" }}>{error}</p>
      )}

      {!entries && !error && (
        <p style={{ marginTop: 24, color: "var(--text-muted)" }}>Loading…</p>
      )}

      {(tab === "learned" || tab === "unlearned") && !user && (
        <p style={{ marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          Sign in to track your progress.
        </p>
      )}

      {tab === "learned" && user && learnedCount === 0 && !learnedLoading && (
        <p style={{ marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          No learned sentences yet. Tap ✓ on any sentence to mark it as learned.
        </p>
      )}

      {tab === "unlearned" && user && unlearnedCount === 0 && !learnedLoading && (
        <p style={{ marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          You've learned all 100 sentences.
        </p>
      )}

      {entries && (tab === "all" || ((tab === "learned" || tab === "unlearned") && user)) && (
        <ol
          style={{
            marginTop: 16,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {filtered.map((e) => {
            const translation = e.analysis.sentences[0]?.translation ?? "";
            const learned = isLearned(e.id);
            return (
              <li key={e.id}>
                <a
                  href={`/common/${e.slug}`}
                  className="focus-ring"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--hairline)",
                    background: "var(--surface)",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--text-faint)",
                      minWidth: 24,
                      alignSelf: "flex-start",
                      paddingTop: 2,
                    }}
                  >
                    {e.id}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      lang="de"
                      style={{
                        display: "block",
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {e.sentence}
                    </span>
                    {translation && (
                      <span
                        lang="en"
                        style={{
                          display: "block",
                          marginTop: 2,
                          fontSize: 13,
                          color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {translation}
                      </span>
                    )}
                  </span>
                  <CheckButton learned={learned} onToggle={(ev) => handleToggle(ev, e.id)} />
                </a>
              </li>
            );
          })}
          {filtered.length === 0 && query && (
            <li style={{ padding: 16, color: "var(--text-muted)", fontSize: 14 }}>
              No sentences match "{query}".
            </li>
          )}
        </ol>
      )}
    </div>
  );
}
