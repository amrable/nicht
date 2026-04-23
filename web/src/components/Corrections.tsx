import type { Correction } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

export function Corrections({ items }: { items: Correction[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="sec-corrections">
      <SectionLabel>
        <span id="sec-corrections">Korrekturen</span>
      </SectionLabel>
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm overflow-hidden dark:border-amber-900/60 dark:bg-amber-950/30">
        <ul className="divide-y divide-amber-100 dark:divide-amber-900/40">
          {items.map((c, i) => (
            <li key={i} className="px-4 py-3">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-slate-500 dark:text-slate-500 line-through text-[15px]">
                  {c.original}
                </span>
                <span className="text-amber-700/70 dark:text-amber-300/70 text-sm">
                  →
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-medium text-[15px]">
                  {c.suggested}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {c.reason}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
