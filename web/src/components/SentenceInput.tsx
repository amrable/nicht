import type { KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  loading: boolean;
  onShare?: () => void;
  showShare?: boolean;
  copied?: boolean;
  sharing?: boolean;
};

const MAX = 500;

export function SentenceInput({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
  onShare,
  showShare,
  copied,
  sharing,
}: Props) {
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
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
      >
        <textarea
          id="sentence"
          className="textarea-bare"
          rows={3}
          maxLength={MAX}
          placeholder="Deutschen Satz hier einfügen…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          style={{
            padding: "14px 16px 10px",
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--text)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 10px 8px 14px",
            borderTop: "1px solid var(--hairline)",
            background: "var(--surface-muted)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--text-faint)",
              minHeight: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              className="hidden sm:inline-flex"
              style={{ alignItems: "center", gap: 6 }}
            >
              <Kbd>⌘</Kbd>+<Kbd>Enter</Kbd>
              <span style={{ marginLeft: 2 }}>zum Analysieren</span>
            </span>
            <span className="tabnum" style={{ color: "var(--text-faint)" }}>
              {value.length}/{MAX}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {value.length > 0 && (
              <GhostButton onClick={() => onChange("")}>
                <ClearIcon />
                Löschen
              </GhostButton>
            )}
            {showShare && onShare && (
              <GhostButton onClick={onShare} disabled={sharing}>
                {copied ? (
                  <>
                    <CheckIcon />
                    Copied
                  </>
                ) : sharing ? (
                  <>Sharing…</>
                ) : (
                  <>
                    <ShareIcon />
                  </>
                )}
              </GhostButton>
            )}
            <PrimaryButton
              onClick={onSubmit}
              disabled={!canSubmit}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: "inherit",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "1px 6px",
        fontSize: 11,
        color: "var(--text-muted)",
        fontWeight: 500,
      }}
    >
      {children}
    </kbd>
  );
}

function GhostButton({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring"
      style={{
        background: "transparent",
        color: "var(--text-muted)",
        border: "none",
        borderRadius: "var(--radius-btn)",
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "background-color 120ms ease, color 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hairline)";
        e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring"
      style={{
        height: 32,
        padding: "0 16px",
        borderRadius: "var(--radius-btn)",
        border: "none",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "inherit",
        background: disabled ? "var(--border)" : "var(--accent)",
        color: disabled ? "var(--text-faint)" : "var(--accent-fg)",
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 100,
        transition: "background-color 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = "var(--accent-hover)";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = "var(--accent)";
      }}
    >
      {loading ? "Analysiere…" : "Analysieren"}
    </button>
  );
}

function ClearIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
