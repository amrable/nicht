import { useAuth } from "../lib/auth";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  count?: number | null;
}

export default function Header({ count }: HeaderProps) {
  const { user } = useAuth();
  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "18px 24px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 18,
        fontSize: 12.5,
        color: "var(--text-muted)",
      }}
    >
      {count !== null && count !== undefined && (
        // <span>
        //   translated {count.toLocaleString()} sentence
        //   {count === 1 ? "" : "s"}
        // </span>
      )}
      <a href="/" style={{ color: "var(--text)", textDecoration: "none" }}>
        Home
      </a>
      <a href="/guides" style={{ color: "var(--text)", textDecoration: "none" }}>
        Guides
      </a>
      <a href="/about" style={{ color: "var(--text)", textDecoration: "none" }}>
        About
      </a>
      {user && (
        <a
          href="/favorites"
          style={{ color: "var(--text)", textDecoration: "none" }}
        >
          Favorites
        </a>
      )}
      <UserMenu />
    </div>
  );
}
