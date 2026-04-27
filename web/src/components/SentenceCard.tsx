import type { Analysis } from "../lib/types";
import { Breakdown } from "./Breakdown";
import { Corrections } from "./Corrections";
import { NounsTable } from "./NounsTable";
import { VerbsTable } from "./VerbsTable";

export function SentenceCard({ analysis }: { analysis: Analysis }) {
  return (
    <div className="flex flex-col gap-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <NounsTable nouns={analysis.nouns} />
        <VerbsTable verbs={analysis.verbs} />
      </div>
    </div>
  );
}
