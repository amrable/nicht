import type { BreakdownItem } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

export function Breakdown({ items }: { items: BreakdownItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="sec-aufbau">
      <SectionLabel>
        <span id="sec-aufbau">Aufbau</span>
      </SectionLabel>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((b, i) => (
            <li key={i} className="px-4 py-3">
              <div className="hidden xs:flex items-baseline justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-slate-900 dark:text-slate-100 font-medium text-[15px]">
                    {b.part}
                  </div>
                  {b.english && (
                    <div
                      lang="en"
                      className="text-sm text-slate-500 dark:text-slate-400 italic mt-0.5"
                    >
                      {b.english}
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 text-right shrink-0">
                  {b.role}
                </span>
              </div>
              <div className="xs:hidden">
                <div className="text-slate-900 dark:text-slate-100 font-medium text-[15px]">
                  {b.part}
                </div>
                {b.english && (
                  <div
                    lang="en"
                    className="text-sm text-slate-500 dark:text-slate-400 italic mt-0.5"
                  >
                    {b.english}
                  </div>
                )}
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{b.role}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
