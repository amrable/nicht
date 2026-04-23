export function LoadingSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-7">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-2.5 w-16 mb-4" />
        <div className="border-t border-slate-200 dark:border-slate-700" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3.5 border-b border-slate-200 dark:border-slate-700"
          >
            <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-9" />
            <div
              className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4"
              style={{ width: 90 + i * 20 }}
            />
            <div className="flex-1" />
            <div
              className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3.5"
              style={{ width: 60 + i * 20 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-2.5 w-16 mb-4" />
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-4">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-5 w-32 mb-3.5" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3.5 w-56 mb-2.5" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3.5 w-40 mb-2.5" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-12" />
        </div>
      </div>

      <div className="mt-10">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-2.5 w-16 mb-4" />
        <div className="border-t border-slate-200 dark:border-slate-700" />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700"
          >
            <div
              className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4"
              style={{ width: `${30 + (i * 8) % 40}%` }}
            />
            <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3.5 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
