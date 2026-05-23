import { useEffect, useState } from "react";

type Guide = { slug: string; title: string; summary: string; body: string; cefr: string };

const cefrColor: Record<string, string> = {
  A1: "#16a34a",
  A2: "#2563eb",
  B1: "#7c3aed",
  B2: "#b45309",
};

export function GuideList() {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/guides.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Guide[]) => setGuides(data))
      .catch(() => setError("Could not load guides."));
  }, []);

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
        Grammar guides{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          — short, focused explainers
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
        The rules and patterns that come up again and again — written for
        learners who want a quick, honest answer.
      </p>

      {error && <p style={{ marginTop: 16, color: "var(--text-muted)" }}>{error}</p>}
      {!guides && !error && (
        <p style={{ marginTop: 24, color: "var(--text-muted)" }}>Loading…</p>
      )}

      {guides && (
        <ul
          style={{
            marginTop: 20,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {guides.map((g) => (
            <li key={g.slug}>
              <a
                href={`/guides/${g.slug}`}
                className="focus-ring"
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--hairline)",
                  background: "var(--surface)",
                  textDecoration: "none",
                  color: "var(--text)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: cefrColor[g.cefr] ?? "#64748b",
                      flexShrink: 0,
                    }}
                  >
                    {g.cefr}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {g.title}
                  </span>
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {g.summary}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
