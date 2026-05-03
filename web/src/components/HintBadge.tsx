export function HintBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        padding: "3px 10px",
        borderRadius: "var(--radius-chip)",
        background:
          "color-mix(in srgb, var(--accent) 8%, var(--surface))",
        border: "1px solid var(--hairline)",
        fontSize: 11.5,
        fontWeight: 500,
        color: "var(--text-muted)",
        lineHeight: 1.4,
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      {children}
    </div>
  );
}
