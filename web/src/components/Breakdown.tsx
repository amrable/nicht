import type { BreakdownItem } from "../lib/types";
import { SectionLabel } from "./SectionLabel";

export function Breakdown({ items }: { items: BreakdownItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="sec-aufbau" className="mt-10">
      <SectionLabel>
        <span id="sec-aufbau">Aufbau</span>
      </SectionLabel>
      <ul className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {items.map((b, i) => (
          <li key={i} className="py-2">
            <div className="hidden xs:flex items-baseline justify-between gap-6">
              <span className="text-slate-900 font-medium text-[15px]">
                {b.part}
              </span>
              <span className="text-sm text-slate-500 text-right">{b.role}</span>
            </div>
            <div className="xs:hidden">
              <div className="text-slate-900 font-medium text-[15px]">
                {b.part}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{b.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
