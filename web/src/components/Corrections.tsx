import type { Correction } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

export function Corrections({ items }: { items: Correction[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="sec-corrections" className="mt-10">
      <SectionLabel>
        <span id="sec-corrections">Korrekturen</span>
      </SectionLabel>
      <ul className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {items.map((c, i) => (
          <li key={i} className="py-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-slate-500 line-through text-[15px]">
                {c.original}
              </span>
              <span className="text-slate-400 text-sm">→</span>
              <span className="text-slate-900 font-medium text-[15px]">
                {c.suggested}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{c.reason}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
