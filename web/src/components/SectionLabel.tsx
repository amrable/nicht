import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {children}
      </div>
      <div className="border-t border-slate-200 mt-1.5 mb-2.5" />
    </div>
  );
}
