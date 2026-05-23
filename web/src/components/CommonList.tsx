import { useEffect, useMemo, useState } from "react";
import type { Analysis } from "../lib/types";

type Entry = { id: number; slug: string; sentence: string; analysis: { sentences: Analysis[] } };

export function CommonList() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/common-sentences.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Entry[]) => setEntries(data))
      .catch(() => setError("Could not load sentences."));
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.sentence.toLowerCase().includes(q));
  }, [entries, query]);

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
          — 100 examples, fully analyzed
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

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sentences..."
        aria-label="Search common sentences"
        style={{
          marginTop: 20,
          width: "100%",
          padding: "10px 14px",
          fontSize: 15,
          fontFamily: "inherit",
          color: "var(--text)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          outline: "none",
        }}
      />

      {error && (
        <p style={{ marginTop: 16, color: "var(--text-muted)" }}>{error}</p>
      )}

      {!entries && !error && (
        <p style={{ marginTop: 24, color: "var(--text-muted)" }}>Loading…</p>
      )}

      {entries && (
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
            return (
              <li key={e.id}>
                <a
                  href={`/common/${e.slug}`}
                  className="focus-ring"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
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
                </a>
              </li>
            );
          })}
          {filtered.length === 0 && entries.length > 0 && (
            <li
              style={{
                padding: 16,
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              No sentences match "{query}".
            </li>
          )}
        </ol>
      )}
    </div>
  );
}
