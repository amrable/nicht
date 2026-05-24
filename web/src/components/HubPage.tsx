import { useLearned } from "../lib/learned";

const TOTAL_COMMON = 100;

type Card = {
  href: string;
  title: string;
  description: string;
  icon: JSX.Element;
  features?: string[];
};

function AnalyzeIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function CommonIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function PronounceIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 19v3M9 22h6" />
    </svg>
  );
}

function GuidesIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function HubCard({
  href,
  title,
  description,
  icon,
  badge,
  features,
}: {
  href: string;
  title: string;
  description: string;
  icon: JSX.Element;
  badge?: string;
  features?: string[];
}) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "20px 20px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        textDecoration: "none",
        color: "var(--text)",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--text-muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--surface-muted)",
            border: "1px solid var(--hairline)",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--text-faint)", marginTop: 4 }}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{title}</span>
          {badge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: 999,
                background: "var(--learned-bg)",
                color: "var(--learned-fg)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
        {features && features.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {features.map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--surface-muted)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--hairline)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export function HubPage() {
  const { learnedIds } = useLearned();
  const learnedCount = learnedIds.size;

  const cards: (Card & { badge?: string })[] = [
    {
      href: "/analyze",
      title: "Analyze a sentence",
      description: "Paste any German sentence and get a full breakdown — word order, cases, articles, and verb conjugation explained.",
      icon: <AnalyzeIcon />,
      features: ["Grammar correction", "Share analysis"],
    },
    {
      href: "/common",
      title: "Common sentences",
      description: "100 most common German sentences, fully analyzed. Study patterns and build your intuition.",
      icon: <CommonIcon />,
      badge: learnedCount > 0 ? `${learnedCount} / ${TOTAL_COMMON} learned` : undefined,
    },
    {
      href: "/pronounce",
      title: "Pronunciation trainer",
      description: "Listen to German sentences and repeat them. Get an instant score on your pronunciation.",
      icon: <PronounceIcon />,
      features: ["Coming soon"],
    },
    {
      href: "/guides",
      title: "Grammar guides",
      description: "Learn the rules behind German word order, cases, verb placement, and more.",
      icon: <GuidesIcon />,
    },
  ];

  return (
    <main
      className="mx-auto px-6 sm:px-8 pb-16 w-full"
      style={{ maxWidth: 760, paddingTop: "clamp(28px, 5vw, 48px)" }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "clamp(22px, 5vw, 28px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          German word order & grammar trainer
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          Pick a module to get started.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {cards.map((card) => (
          <HubCard key={card.href} {...card} />
        ))}
      </div>
    </main>
  );
}
