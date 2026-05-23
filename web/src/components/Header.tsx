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
        background:
          "color-mix(in srgb, var(--surface) 80%, transparent)",
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
          justifyContent: "flex-end",
          gap: 18,
          fontSize: 12.5,
          color: "var(--text-muted)",
        }}
      >
        {count != null && count > 0 && (
          <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
            {count.toLocaleString()} sentences analyzed
          </span>
        )}
        <span
          className="header-links"
          style={{ display: "contents" }}
        >
          <a href="/" style={{ color: "var(--text)", textDecoration: "none" }}>
            Home
          </a>
          <a href="/common" style={{ color: "var(--text)", textDecoration: "none" }}>
            Common
          </a>
          <a href="/guides" style={{ color: "var(--text)", textDecoration: "none" }}>
            Guides
          </a>
          <a href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>
            About
          </a>
          <a
            href="/favorites"
            style={{ color: "var(--text)", textDecoration: "none" }}
          >
            Favorites
          </a>
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
