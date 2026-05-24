import { useState } from "react";
import type { Analysis } from "../lib/types";
import { Breakdown } from "./Breakdown";
import { Corrections } from "./Corrections";
import { NounsTable } from "./NounsTable";
import { VerbsTable } from "./VerbsTable";

type Tab = "aufbau" | "nouns" | "verbs";

export function SentenceCard({ analysis }: { analysis: Analysis }) {
  const hasNouns = analysis.nouns.length > 0;
  const hasVerbs = analysis.verbs.length > 0;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "aufbau", label: "Aufbau" },
    ...(hasNouns ? [{ id: "nouns" as Tab, label: "Nomen", count: analysis.nouns.length }] : []),
    ...(hasVerbs ? [{ id: "verbs" as Tab, label: "Verben", count: analysis.verbs.length }] : []),
  ];

  const [activeTab, setActiveTab] = useState<Tab>("aufbau");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div
        role="tablist"
        className="mx-auto w-full"
        style={{
          maxWidth: 640,
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
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
                gap: 5,
                padding: "7px 12px",
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
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "1px 5px",
                    borderRadius: 999,
                    background: active ? "var(--text)" : "var(--border)",
                    color: active ? "var(--surface)" : "var(--text-muted)",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "aufbau" && (
        <div className="flex flex-col gap-6">
          {analysis.corrections.length > 0 && (
            <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
              <Corrections items={analysis.corrections} />
            </div>
          )}
          {analysis.breakdown.length > 0 && (
            <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
              <Breakdown
                items={analysis.breakdown}
                sentence={analysis.analyzed}
                translation={analysis.translation}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "nouns" && (
        <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
          <NounsTable nouns={analysis.nouns} />
        </div>
      )}

      {activeTab === "verbs" && (
        <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
          <VerbsTable verbs={analysis.verbs} />
        </div>
      )}
    </div>
  );
}
