import { useEffect, useState } from "react";

type Item = {
  href: string;
  label: string;
  icon: JSX.Element;
  match: (path: string) => boolean;
};

const ICON_SIZE = 22;

const ITEMS: Item[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/" || p === "",
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/common",
    label: "Common",
    match: (p) => p.startsWith("/common"),
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h10" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    match: (p) => p.startsWith("/about"),
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <circle cx="12" cy="8" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Favorites",
    match: (p) => p.startsWith("/favorites"),
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const [path, setPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return (
    <nav
      className="bottom-nav"
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background:
          "color-mix(in srgb, var(--surface) 92%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid var(--hairline)",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        paddingTop: 8,
      }}
    >
      <ul
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {ITEMS.map((item) => {
          const active = item.match(path);
          return (
            <li key={item.href} style={{ flex: 1 }}>
              <a
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  minHeight: 48,
                  padding: "4px 6px",
                  textDecoration: "none",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  lineHeight: 1,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
