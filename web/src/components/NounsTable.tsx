import type { Noun } from "../lib/types";
import { ArticlePill } from "./ArticlePill";
import { SectionLabel } from "./SectionLabel";
import { SpeakButton } from "./SpeakButton";
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
            className="card-row grid items-center nouns-row"
          >
            <ArticlePill article={n.article} />
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "var(--text)",
                  lineHeight: 1.4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span style={{ overflowWrap: "anywhere" }}>{n.word}</span>
                <SpeakButton
                  text={`${n.article} ${n.word}`}
                  label={`${n.article} ${n.word} vorlesen`}
                  size={13}
                />
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
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 2,
                minWidth: 0,
              }}
            >
              <span style={{ overflowWrap: "anywhere" }}>{n.plural ?? "—"}</span>
              {n.plural && (
                <SpeakButton
                  text={n.plural}
                  label={`${n.plural} vorlesen`}
                  size={13}
                />
              )}
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
