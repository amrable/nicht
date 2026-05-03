import { EXAMPLES, type Example } from "../lib/exampleFixtures";

type Props = {
  activeId: string | null;
  onPick: (example: Example) => void;
};

export function ExampleChips({ activeId, onPick }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
        }}
      >
        Try an example
      </p>

      <div
        className="example-chips-row"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 4,
          marginInline: -2,
          paddingInline: 2,
        }}
      >
        {EXAMPLES.map((ex) => {
          const active = ex.id === activeId;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onPick(ex)}
              className="focus-ring"
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: "start",
                minHeight: 52,
                padding: "10px 14px",
                borderRadius: 8,
                border: active
                  ? "1.5px solid #3b82f6"
                  : "1.5px solid var(--border)",
                background: active
                  ? "rgba(59,130,246,0.15)"
                  : "var(--surface)",
                color: active ? "#93c5fd" : "var(--text)",
                fontFamily: "inherit",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 3,
                transition:
                  "background 120ms ease, border-color 120ms ease, color 120ms ease",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: active ? "#60a5fa" : "var(--text-faint)",
                }}
              >
                {ex.label}
              </span>
              <span
                lang="de"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? "#e0f2fe" : "var(--text)",
                }}
              >
                {ex.sentence.length > 38
                  ? ex.sentence.slice(0, 36) + "…"
                  : ex.sentence}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
