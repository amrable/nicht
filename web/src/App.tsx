import { useEffect, useState } from "react";
import { SentenceInput } from "./components/SentenceInput";
import { NounsTable } from "./components/NounsTable";
import { VerbsTable } from "./components/VerbsTable";
import { Breakdown } from "./components/Breakdown";
import { Corrections } from "./components/Corrections";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorBanner } from "./components/ErrorBanner";
import { analyzeSentence, fetchStats, messageForError } from "./lib/api";
import type { Analysis } from "./lib/types";

const EXAMPLE_SENTENCE = "Der Mann hat das Buch in die Bibliothek gebracht.";
const EXAMPLE_ANALYSIS: Analysis = {
  translation: "The man brought the book to the library.",
  nouns: [
    { word: "Mann", article: "der", plural: "die Männer", english: "man" },
    { word: "Buch", article: "das", plural: "die Bücher", english: "book" },
    {
      word: "Bibliothek",
      article: "die",
      plural: "die Bibliotheken",
      english: "library",
    },
  ],
  verbs: [
    {
      infinitive: "bringen",
      formInSentence: "hat ... gebracht",
      partizipII: "gebracht",
      auxiliary: "haben",
      english: "to bring",
      present: {
        ich: "bringe",
        du: "bringst",
        erSieEs: "bringt",
        wir: "bringen",
        ihr: "bringt",
        sie: "bringen",
      },
      praeteritum: {
        ich: "brachte",
        du: "brachtest",
        erSieEs: "brachte",
        wir: "brachten",
        ihr: "brachtet",
        sie: "brachten",
      },
    },
  ],
  breakdown: [
    { part: "Der Mann", role: "Subjekt (Nominativ)", english: "the man" },
    { part: "hat ... gebracht", role: "Prädikat", english: "brought" },
    { part: "das Buch", role: "Akkusativobjekt", english: "the book" },
    {
      part: "in die Bibliothek",
      role: "Lokaladverbial (Direktional)",
      english: "to the library",
    },
  ],
  corrections: [],
};

export default function App() {
  const [sentence, setSentence] = useState(EXAMPLE_SENTENCE);
  const [data, setData] = useState<Analysis | null>(EXAMPLE_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const refreshCount = () => {
    fetchStats()
      .then((s) => setCount(s.count))
      .catch(() => {});
  };

  useEffect(() => {
    refreshCount();
  }, []);

  const onAnalyze = async () => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    setData(null);
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeSentence(trimmed);
      setData(result);
      refreshCount();
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && error) setError(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [error]);

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-10 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        {count !== null && (
          <span>
            translated {count.toLocaleString()} sentence
            {count === 1 ? "" : "s"}
          </span>
        )}
        <a
          href="/about"
          className="hover:text-slate-900 dark:hover:text-slate-100 underline-offset-2 hover:underline"
        >
          About
        </a>
        {/* <iframe
          src="https://ghbtns.com/github-btn.html?user=amrable&repo=nicht&type=star&count=true"
          frameBorder="0"
          scrolling="0"
          width="110"
          height="20"
          title="Star amrable/nicht on GitHub"
          className="block"
        /> */}
      </div>
      <main
        lang="de"
        className="mx-auto px-6 sm:px-8 pb-12 w-full"
        style={{
          maxWidth: 1100,
          paddingTop: "clamp(40px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100 leading-snug">
            German Sentence Analyzer
          </h1>

          <div className="mt-8">
            {error && (
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}
            <SentenceInput
              value={sentence}
              onChange={setSentence}
              onSubmit={onAnalyze}
              disabled={loading}
              loading={loading}
            />
            {!loading && data?.translation && (
              <p
                lang="en"
                className="mt-3 text-sm text-slate-500 dark:text-slate-400 italic leading-snug"
              >
                {data.translation}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Uses AI — results may be inaccurate. Double-check when it matters.
            </p>
          </div>
        </div>

        <div aria-live="polite" className="mt-10">
          {loading && (
            <div className="mx-auto" style={{ maxWidth: 640 }}>
              <LoadingSkeleton />
            </div>
          )}
          {!loading && data && (
            <div className="flex flex-col gap-8">
              {data.corrections.length > 0 && (
                <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
                  <Corrections items={data.corrections} />
                </div>
              )}
              {data.breakdown.length > 0 && (
                <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
                  <Breakdown items={data.breakdown} />
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <NounsTable nouns={data.nouns} />
                <VerbsTable verbs={data.verbs} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
