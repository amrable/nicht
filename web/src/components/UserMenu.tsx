import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: 0,
          padding: 0,
          cursor: "pointer",
          color: "var(--text)",
          fontSize: 12.5,
        }}
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt=""
            width={22}
            height={22}
            style={{ borderRadius: "50%" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--border)",
              color: "var(--text)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {initial}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 160,
            padding: 6,
            zIndex: 50,
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              fontSize: 12,
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--hairline)",
              marginBottom: 4,
              wordBreak: "break-all",
            }}
          >
            {user.email}
          </div>
          <a
            href="/favorites"
            role="menuitem"
            style={{
              display: "block",
              padding: "8px 10px",
              fontSize: 13,
              color: "var(--text)",
              textDecoration: "none",
              borderRadius: 6,
            }}
          >
            Favorites
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              fontSize: 13,
              color: "var(--text)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
