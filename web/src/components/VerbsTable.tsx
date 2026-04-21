import type { Verb } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

export function VerbsTable({ verbs }: { verbs: Verb[] }) {
  if (verbs.length === 0) return null;
  return (
    <section aria-labelledby="sec-verben" className="mt-10">
      <SectionLabel>
        <span id="sec-verben">Verben</span>
      </SectionLabel>
      <div className="flex flex-col gap-3">
        {verbs.map((v, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="text-lg font-medium text-slate-900 leading-snug">
              {v.infinitive}
            </div>
            <dl
              className="mt-2 grid items-baseline"
              style={{
                gridTemplateColumns: "auto 1fr",
                columnGap: 16,
                rowGap: 6,
              }}
            >
              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">
                Im Satz
              </dt>
              <dd className="text-[15px] text-slate-900">{v.formInSentence}</dd>

              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">
                Partizip II
              </dt>
              <dd className="text-[15px] text-slate-900">{v.partizipII}</dd>

              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">
                Hilfsverb
              </dt>
              <dd>
                <span
                  className="text-xs font-semibold rounded-md bg-slate-100 text-slate-700"
                  style={{ padding: "2px 8px" }}
                >
                  {v.auxiliary}
                </span>
              </dd>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
