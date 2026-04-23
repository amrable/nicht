import type { KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
};

export function SentenceInput({ value, onChange, onSubmit, disabled, loading }: Props) {
  const canSubmit = !disabled && value.trim().length > 0;

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <div>
      <label htmlFor="sentence" className="sr-only">
        Deutscher Satz
      </label>
      <textarea
        id="sentence"
        className="textarea focus-ring w-full text-[15px] text-slate-900 bg-white border border-slate-200 rounded-xl resize-y shadow-sm transition-shadow dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700"
        rows={3}
        maxLength={500}
        placeholder="Deutschen Satz hier einfügen…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        style={{ padding: "14px 16px", lineHeight: 1.55 }}
      />
      <div className="flex items-center justify-between gap-3 mt-3">
        <div className="text-xs text-slate-400 dark:text-slate-500 min-h-[16px]">
          <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-px text-[11px] text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            ⌘
          </kbd>{" "}
          +{" "}
          <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-px text-[11px] text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            Enter
          </kbd>{" "}
          zum Analysieren
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`focus-ring text-sm font-medium rounded-lg transition-colors duration-150 min-w-[120px] h-10 px-5 ${
            canSubmit
              ? "bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white cursor-pointer dark:bg-slate-100 dark:hover:bg-white dark:active:bg-slate-200 dark:text-slate-900"
              : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {loading ? "Analysiere…" : "Analysieren"}
        </button>
      </div>
    </div>
  );
}
