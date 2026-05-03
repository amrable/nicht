import type { BreakdownItem } from "../lib/types";
import { SectionLabel } from "./SectionLabel";
import { SpeakButton } from "./SpeakButton";

export function Breakdown({
  items,
  sentence,
  translation,
}: {
  items: BreakdownItem[];
  sentence?: string;
  translation?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="sec-aufbau">
      <SectionLabel>
        <span id="sec-aufbau">Aufbau</span>
      </SectionLabel>
      {sentence && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "0 0 2px",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text)",
              lineHeight: 1.45,
              margin: 0,
              flex: 1,
              minWidth: 0,
            }}
          >
            {sentence}
          </p>
          <SpeakButton text={sentence} label="Satz vorlesen" />
        </div>
      )}
      {translation && (
        <p
          lang="en"
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            fontStyle: "italic",
            lineHeight: 1.45,
            margin: "0 0 10px",
          }}
        >
          {translation}
        </p>
      )}
      <div className="card">
        {items.map((b, i) => (
          <div
            key={i}
            className="card-row grid items-baseline"
            style={{
              gridTemplateColumns: "1fr auto",
              columnGap: 16,
            }}
          >
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "var(--text)",
                  lineHeight: 1.4,
                }}
              >
                {b.part}
              </div>
              {b.english && (
                <div
                  lang="en"
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    marginTop: 1,
                  }}
                >
                  {b.english}
                </div>
              )}
            </div>
            <span
              className="text-right shrink-0"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              {b.role}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
