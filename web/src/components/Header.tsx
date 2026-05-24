import { UserMenu } from "./UserMenu";

interface HeaderProps {
  count?: number | null;
}

export default function Header({ count }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in srgb, var(--surface) 80%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          Satzbau
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {count != null && count > 0 && (
            <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
              {count.toLocaleString()} analyzed
            </span>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
