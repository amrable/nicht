import type { Noun } from "../lib/types";
import { ArticlePill } from "./ArticlePill";
import { SectionLabel } from "./SectionLabel";
import { StarButton } from "./StarButton";

export function NounsTable({ nouns }: { nouns: Noun[] }) {
  if (nouns.length === 0) return null;
  return (
    <section aria-labelledby="sec-nomen">
      <SectionLabel>
        <span id="sec-nomen">Nomen</span>
      </SectionLabel>
      <div className="card">
        {nouns.map((n, i) => (
          <div
            key={i}
            className="card-row grid items-baseline"
            style={{
              gridTemplateColumns: "auto 1fr auto auto",
              columnGap: 12,
            }}
          >
            <ArticlePill article={n.article} />
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "var(--text)",
                  lineHeight: 1.4,
                }}
              >
                {n.word}
              </div>
              {n.english && (
                <div
                  lang="en"
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    marginTop: 1,
                  }}
                >
                  {n.english}
                </div>
              )}
            </div>
            <div
              className="tabnum text-right"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              {n.plural ?? "—"}
            </div>
            <StarButton
              kind="noun"
              favKey={`${n.article}:${n.word}`}
              payload={n}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
