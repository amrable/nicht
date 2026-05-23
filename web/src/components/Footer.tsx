export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hairline)",
        marginTop: 64,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        fontSize: 13,
        color: "var(--text-faint)",
      }}
    >
      <a href="/about" style={{ color: "inherit", textDecoration: "none" }}>
        About
      </a>
      <a href="/support" style={{ color: "inherit", textDecoration: "none" }}>
        Send feedback
      </a>
    </footer>
  );
}
