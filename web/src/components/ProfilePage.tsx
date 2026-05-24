import { useEffect, useState } from "react";
import { useFavorites } from "../lib/favorites";
import { useLearned } from "../lib/learned";
import { useAuth } from "../lib/auth";
import { NounsTable } from "./NounsTable";
import { VerbsTable } from "./VerbsTable";
import type { Noun, Verb } from "../lib/types";

type Tab = "learned" | "saved" | "pronunciation";
type CommonEntry = { id: number; slug: string; sentence: string; analysis: { sentences: Array<{ translation?: string }> } };

function EmptyState({ message }: { message: string }) {
  return (
    <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>{message}</p>
  );
}

function LearnedTab() {
  const { learnedIds } = useLearned();
  const [allSentences, setAllSentences] = useState<CommonEntry[]>([]);

  useEffect(() => {
    fetch("/common-sentences.json")
      .then((r) => r.json())
      .then(setAllSentences)
      .catch(() => {});
  }, []);

  const learned = allSentences.filter((s) => learnedIds.has(s.id));

  if (learned.length === 0) {
    return <EmptyState message="No sentences learned yet. Mark sentences as learned in the Common section." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {learned.map((entry) => {
        const translation = entry.analysis?.sentences?.[0]?.translation;
        return (
          <a
            key={entry.id}
            href={`/common/${entry.slug}`}
            style={{
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              textDecoration: "none",
              color: "var(--text)",
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--hairline)";
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }} lang="de">
              {entry.sentence}
            </span>
            {translation && (
              <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {translation}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

function SavedTab() {
  const { favorites, loading } = useFavorites();
  const nouns = favorites.filter((f) => f.kind === "noun").map((f) => f.payload as Noun);
  const verbs = favorites.filter((f) => f.kind === "verb").map((f) => f.payload as Verb);

  if (loading) return <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Loading…</p>;
  if (favorites.length === 0) return <EmptyState message="No saved words yet. Star a noun or verb while analyzing a sentence." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <NounsTable nouns={nouns} />
      <VerbsTable verbs={verbs} />
    </div>
  );
}

function PronunciationTab() {
  return (
    <div
      style={{
        padding: "32px 24px",
        borderRadius: 10,
        border: "1px dashed var(--border)",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Coming soon</p>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Your pronunciation practice scores will appear here.
      </p>
      <a
        href="/pronounce"
        style={{
          display: "inline-block",
          marginTop: 14,
          padding: "7px 16px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        Start practicing →
      </a>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "learned", label: "Learned" },
  { id: "saved", label: "Saved words" },
  { id: "pronunciation", label: "Pronunciation" },
];

export function ProfilePage() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const { learnedIds } = useLearned();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState<Tab>("learned");

  if (authLoading) return null;

  if (!user) {
    return (
      <main
        className="mx-auto px-6 sm:px-8 pb-16 w-full"
        style={{ maxWidth: 760, paddingTop: "clamp(20px, 4vw, 36px)" }}
      >
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Sign in to see your progress, saved words, and scores.
          </p>
          <button
            type="button"
            onClick={() => openLoginModal("favorites")}
            style={{
              marginTop: 14,
              padding: "9px 20px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  const counts: Record<Tab, number | undefined> = {
    learned: learnedIds.size || undefined,
    saved: favorites.length || undefined,
    pronunciation: undefined,
  };

  return (
    <main
      className="mx-auto px-6 sm:px-8 pb-16 w-full"
      style={{ maxWidth: 760, paddingTop: "clamp(20px, 4vw, 36px)" }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--text)",
            margin: 0,
          }}
        >
          Profile
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
          {user.name || user.email}
        </p>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--hairline)",
          marginBottom: 24,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : "var(--text-muted)",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid var(--text)" : "2px solid transparent",
                marginBottom: -1,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: active ? "var(--text)" : "var(--border)",
                    color: active ? "var(--surface)" : "var(--text-muted)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "learned" && <LearnedTab />}
      {activeTab === "saved" && <SavedTab />}
      {activeTab === "pronunciation" && <PronunciationTab />}
    </main>
  );
}
