import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";

function MenuIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

const itemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 13,
  color: "var(--text)",
  textDecoration: "none",
  background: "transparent",
  border: 0,
  cursor: "pointer",
  borderRadius: 6,
};

export function UserMenu() {
  const { user, logout, openLoginModal } = useAuth();
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

  const close = () => setOpen(false);

  const initial = user ? (user.name || user.email).charAt(0).toUpperCase() : null;

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
          justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: user?.picture ? 0 : "4px 8px",
          cursor: "pointer",
          color: "var(--text)",
          gap: 6,
          height: 30,
          minWidth: 30,
        }}
      >
        {user ? (
          user.picture ? (
            <img
              src={user.picture}
              alt=""
              width={28}
              height={28}
              style={{ borderRadius: "50%", display: "block" }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
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
          )
        ) : (
          <MenuIcon />
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
            minWidth: 180,
            padding: 6,
            zIndex: 50,
          }}
        >
          {user ? (
            <>
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
              <a href="/profile" role="menuitem" onClick={close} style={itemStyle}>
                Profile
              </a>
              <a href="/about" role="menuitem" onClick={close} style={itemStyle}>
                About
              </a>
              <a href="/support" role="menuitem" onClick={close} style={itemStyle}>
                Support
              </a>
              <div style={{ borderTop: "1px solid var(--hairline)", margin: "4px 0" }} />
              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  close();
                  await logout();
                }}
                style={{ ...itemStyle, color: "var(--text-muted)" }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  openLoginModal();
                }}
                style={{ ...itemStyle, fontWeight: 500 }}
              >
                Sign in
              </button>
              <div style={{ borderTop: "1px solid var(--hairline)", margin: "4px 0" }} />
              <a href="/about" role="menuitem" onClick={close} style={itemStyle}>
                About
              </a>
              <a href="/support" role="menuitem" onClick={close} style={itemStyle}>
                Support
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
