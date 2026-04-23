import type { Verb } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

const PRONOUNS: Array<{ key: keyof Verb["present"]; label: string }> = [
  { key: "ich", label: "ich" },
  { key: "du", label: "du" },
  { key: "erSieEs", label: "er / sie / es" },
  { key: "wir", label: "wir" },
  { key: "ihr", label: "ihr" },
  { key: "sie", label: "sie / Sie" },
];

export function VerbsTable({ verbs }: { verbs: Verb[] }) {
  if (verbs.length === 0) return null;
  return (
    <section aria-labelledby="sec-verben">
      <SectionLabel>
        <span id="sec-verben">Verben</span>
      </SectionLabel>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {verbs.map((v, i) => (
            <li key={i} className="px-4 py-3.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-lg font-medium text-slate-900 dark:text-slate-100 leading-snug">
                  {v.infinitive}
                </span>
                <span
                  className="text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                  style={{ padding: "2px 8px" }}
                >
                  {v.auxiliary}
                </span>
              </div>
              {v.english && (
                <div
                  lang="en"
                  className="text-sm text-slate-500 dark:text-slate-400 italic mt-0.5"
                >
                  {v.english}
                </div>
              )}
              <dl
                className="mt-2 grid items-baseline text-[14px]"
                style={{
                  gridTemplateColumns: "auto 1fr",
                  columnGap: 14,
                  rowGap: 4,
                }}
              >
                <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 self-center">
                  Im Satz
                </dt>
                <dd className="text-slate-900 dark:text-slate-100">{v.formInSentence}</dd>

                <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 self-center">
                  Partizip II
                </dt>
                <dd className="text-slate-900 dark:text-slate-100">{v.partizipII}</dd>
              </dl>

              {(v.present || v.praeteritum) && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                  {v.present && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Präsens
                      </div>
                      <dl
                        className="grid text-[14px]"
                        style={{
                          gridTemplateColumns: "auto 1fr",
                          columnGap: 10,
                          rowGap: 3,
                        }}
                      >
                        {PRONOUNS.map(({ key, label }) => (
                          <div key={key} className="contents">
                            <dt className="text-slate-500 dark:text-slate-400 tabnum">{label}</dt>
                            <dd className="text-slate-900 dark:text-slate-100">
                              {v.present[key]}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {v.praeteritum && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Präteritum
                      </div>
                      <dl
                        className="grid text-[14px]"
                        style={{
                          gridTemplateColumns: "auto 1fr",
                          columnGap: 10,
                          rowGap: 3,
                        }}
                      >
                        {PRONOUNS.map(({ key, label }) => (
                          <div key={key} className="contents">
                            <dt className="text-slate-500 dark:text-slate-400 tabnum">{label}</dt>
                            <dd className="text-slate-900 dark:text-slate-100">
                              {v.praeteritum![key]}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
