type Props = { message: string; onDismiss: () => void };

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 mb-4"
      style={{ padding: "10px 14px" }}
    >
      <span className="text-sm font-medium flex-1 leading-snug">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fehlermeldung schließen"
        className="focus-ring text-red-800 text-base leading-none p-0.5 rounded"
      >
        ×
      </button>
    </div>
  );
}
