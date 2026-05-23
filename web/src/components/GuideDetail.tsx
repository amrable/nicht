import { useEffect, useState } from "react";

type Guide = { slug: string; title: string; summary: string; body: string; cefr: string };

const cefrColor: Record<string, string> = {
  A1: "#16a34a",
  A2: "#2563eb",
  B1: "#7c3aed",
  B2: "#b45309",
};

export function GuideDetail({ slug }: { slug: string }) {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/guides.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: Guide[]) => setGuides(data))
      .catch(() => setError("Could not load guide."));
  }, []);

  const guide = guides?.find((g) => g.slug === slug) ?? null;

  return (
    <div className="mx-auto" style={{ maxWidth: 680 }}>
      <a
        href="/guides"
        style={{
          display: "inline-block",
          fontSize: 13,
          color: "var(--text-muted)",
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        ← All guides
      </a>

      {error && <p style={{ color: "var(--text-muted)" }}>{error}</p>}
      {!guides && !error && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
      {guides && !guide && <p style={{ color: "var(--text-muted)" }}>Guide not found.</p>}

      {guide && (
        <>
          <span
            style={{
              display: "inline-block",
              marginBottom: 12,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: cefrColor[guide.cefr] ?? "#64748b",
            }}
          >
            CEFR {guide.cefr}
          </span>
          <article className="prose" dangerouslySetInnerHTML={{ __html: guide.body }} />
        </>
      )}
    </div>
  );
}
