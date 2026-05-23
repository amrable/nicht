import { useEffect, useState } from "react";
import type { Analysis } from "../lib/types";
import { SentenceCarousel } from "./SentenceCarousel";
import { useLearned } from "../lib/learned";

type Entry = { id: number; slug: string; sentence: string; analysis: { sentences: Analysis[] } };

export function CommonDetail({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/common-sentences.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Entry[]) => setEntries(data))
      .catch(() => setError("Could not load sentence."));
  }, []);

  const { isLearned, toggle } = useLearned();

  const index = entries?.findIndex((e) => e.slug === slug) ?? -1;
  const entry = index >= 0 ? entries![index] : null;
  const total = entries?.length ?? 0;
  const prev = entry && index > 0 ? entries![index - 1] : null;
  const next = entry && index < total - 1 ? entries![index + 1] : null;

  return (
    <div>
      <div className="mx-auto" style={{ maxWidth: 640 }}>
        <a
          href="/common"
          style={{
            display: "inline-block",
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          ← All common sentences
        </a>

        {error && (
          <p style={{ color: "var(--text-muted)" }}>{error}</p>
        )}
        {!entries && !error && (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        )}
        {entries && !entry && (
          <p style={{ color: "var(--text-muted)" }}>Sentence not found.</p>
        )}

        {entry && (
          <>
            <h1
              lang="de"
              style={{
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              {entry.sentence}
            </h1>
            <button
              onClick={() => toggle(entry.id)}
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: isLearned(entry.id) ? "none" : "1px solid var(--border)",
                background: isLearned(entry.id) ? "var(--learned-bg)" : "var(--surface)",
                color: isLearned(entry.id) ? "var(--learned-fg)" : "var(--text-muted)",
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              ✓ {isLearned(entry.id) ? "Learned" : "Mark as learned"}
            </button>
          </>
        )}
      </div>

      {entry && (
        <div className="mt-6">
          <SentenceCarousel sentences={entry.analysis.sentences} />
        </div>
      )}

      {entry && (
        <nav
          className="mx-auto"
          style={{
            maxWidth: 640,
            marginTop: 32,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
          aria-label="Sentence navigation"
        >
          <a
            href={prev ? `/common/${prev.slug}` : undefined}
            aria-disabled={!prev}
            style={navBtnStyle(!prev)}
          >
            ← Previous
          </a>
          <span style={{ alignSelf: "center", fontSize: 13, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            {index + 1} / {total}
          </span>
          <a
            href={next ? `/common/${next.slug}` : undefined}
            aria-disabled={!next}
            style={navBtnStyle(!next)}
          >
            Next →
          </a>
        </nav>
      )}
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: disabled ? "var(--text-faint)" : "var(--text)",
    fontSize: 14,
    textDecoration: "none",
    pointerEvents: disabled ? "none" : "auto",
    opacity: disabled ? 0.5 : 1,
  };
}
