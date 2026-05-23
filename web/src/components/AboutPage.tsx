import { useEffect, useState } from "react";

type About = { title: string; summary: string; body: string };

export function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/about.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: About) => setAbout(data))
      .catch(() => setError("Could not load page."));
  }, []);

  return (
    <div className="mx-auto" style={{ maxWidth: 680 }}>
      {error && <p style={{ color: "var(--text-muted)" }}>{error}</p>}
      {!about && !error && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
      {about && (
        <>
          <article className="prose" dangerouslySetInnerHTML={{ __html: about.body }} />
          <div style={{ marginTop: 32 }}>
            <a
              href="/support"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Send feedback
            </a>
          </div>
        </>
      )}
    </div>
  );
}
