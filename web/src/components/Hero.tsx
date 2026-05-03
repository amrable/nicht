type Props = {
  count: number | null;
};

export function Hero({ count }: Props) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(32px, 8vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "var(--text)",
        }}
      >
        Satzbau
      </h1>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: "clamp(14px, 3.5vw, 16px)",
          fontWeight: 400,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          maxWidth: 420,
        }}
      >
        Paste a German sentence and instantly see noun genders, Partizip&nbsp;II,
        and a role-by-role grammatical breakdown.
      </p>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
          Free · no signup · no ads
        </span>

        {count !== null && count !== undefined && count > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "var(--text-faint)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#10b981",
                flexShrink: 0,
              }}
              aria-hidden
            />
            {count.toLocaleString()} sentences analyzed
          </span>
        )}
      </div>
    </div>
  );
}
