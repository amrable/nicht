import type { Verb } from "../lib/types";
import { SectionLabel } from "./SectionLabel";
import { StarButton } from "./StarButton";

const PRONOUNS: Array<{ key: keyof Verb["present"]; label: string }> = [
  { key: "ich", label: "ich" },
  { key: "du", label: "du" },
  { key: "erSieEs", label: "er / sie / es" },
  { key: "wir", label: "wir" },
  { key: "ihr", label: "ihr" },
  { key: "sie", label: "sie / Sie" },
];

const META_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  paddingTop: 1,
};

function AuxPill({ aux }: { aux: string }) {
  const isSein = aux === "sein";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "2px 7px",
        borderRadius: "var(--radius-pill)",
        background: isSein ? "var(--sein-bg)" : "var(--haben-bg)",
        color: isSein ? "var(--sein-fg)" : "var(--haben-fg)",
      }}
    >
      {aux}
    </span>
  );
}

export function VerbsTable({ verbs }: { verbs: Verb[] }) {
  if (verbs.length === 0) return null;
  return (
    <section aria-labelledby="sec-verben">
      <SectionLabel>
        <span id="sec-verben">Verben</span>
      </SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {verbs.map((v, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}
              >
                <span
                  style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}
                >
                  {v.infinitive}
                </span>
                {v.english && (
                  <span
                    lang="en"
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {v.english}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <AuxPill aux={v.auxiliary} />
                <StarButton
                  kind="verb"
                  favKey={v.infinitive.toLowerCase()}
                  payload={v}
                />
              </div>
            </div>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                columnGap: 14,
                rowGap: 4,
                marginTop: 10,
              }}
            >
              <dt style={META_LABEL}>Im Satz</dt>
              <dd style={{ fontSize: 13.5, color: "var(--text)", margin: 0 }}>
                {v.formInSentence}
              </dd>
              <dt style={META_LABEL}>Partizip II</dt>
              <dd style={{ fontSize: 13.5, color: "var(--text)", margin: 0 }}>
                {v.partizipII}
              </dd>
            </dl>

            {(v.present || v.praeteritum) && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--hairline)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {v.present && (
                  <Conjugation label="Präsens" rows={v.present} />
                )}
                {v.praeteritum && (
                  <Conjugation label="Präteritum" rows={v.praeteritum} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Conjugation({
  label,
  rows,
}: {
  label: string;
  rows: Verb["present"];
}) {
  return (
    <div>
      <div style={META_LABEL}>{label}</div>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: 10,
          rowGap: 3,
          marginTop: 6,
          fontSize: 13.5,
        }}
      >
        {PRONOUNS.map(({ key, label }) => (
          <div key={key} style={{ display: "contents" }}>
            <dt className="tabnum" style={{ color: "var(--text-muted)" }}>
              {label}
            </dt>
            <dd style={{ color: "var(--text)", margin: 0 }}>{rows[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
