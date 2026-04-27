import { useEffect, useState } from "react";
import { SentenceInput } from "./components/SentenceInput";
import { SentenceCarousel } from "./components/SentenceCarousel";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorBanner } from "./components/ErrorBanner";
import Header from "./components/Header";
import { Favorites } from "./components/Favorites";
import { analyzeSentence, fetchSharedAnalysis, fetchStats, messageForError, shareAnalysis } from "./lib/api";
import type { MultiAnalysis } from "./lib/types";

const EXAMPLE_SENTENCE =
  "Der Mann hat das Buch in die Bibliothek gebracht. Ich gehe in dem Park.";

const FAQ = [
  {
    q: "Can it tell me if a noun is der, die, or das?",
    a: "Yes. For each noun in your sentence, Satzbau shows the correct definite article and the plural form.",
  },
  {
    q: "Does it identify German cases (accusative, dative, etc.)?",
    a: "Yes. The breakdown labels each phrase with its grammatical role — Subjekt (nominative), Akkusativobjekt, Dativobjekt, Genitiv, and adverbials.",
  },
  {
    q: "Will it catch mistakes in my own sentences?",
    a: "If you submit a sentence with a likely error — wrong case ending, wrong article, wrong verb form — Satzbau flags the probable mistake and shows the corrected form.",
  },
  {
    q: "Is it accurate?",
    a: "Satzbau uses a large language model, so results can occasionally be wrong. Use it as a study aid and double-check anything that matters with a dictionary or a teacher.",
  },
];
const EXAMPLE_ANALYSIS: MultiAnalysis = {
  sentences: [
    {
      analyzed: "Der Mann hat das Buch in die Bibliothek gebracht.",
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
    },
    {
      analyzed: "Ich gehe in den Park.",
      translation: "I'm going to the park.",
      nouns: [
        { word: "Park", article: "der", plural: "die Parks", english: "park" },
      ],
      verbs: [
        {
          infinitive: "gehen",
          formInSentence: "gehe",
          partizipII: "gegangen",
          auxiliary: "sein",
          english: "to go",
          present: {
            ich: "gehe",
            du: "gehst",
            erSieEs: "geht",
            wir: "gehen",
            ihr: "geht",
            sie: "gehen",
          },
          praeteritum: {
            ich: "ging",
            du: "gingst",
            erSieEs: "ging",
            wir: "gingen",
            ihr: "gingt",
            sie: "gingen",
          },
        },
      ],
      breakdown: [
        { part: "Ich", role: "Subjekt (Nominativ)", english: "I" },
        { part: "gehe", role: "Prädikat", english: "am going" },
        {
          part: "in den Park",
          role: "Lokaladverbial (Direktional)",
          english: "to the park",
        },
      ],
      corrections: [
        {
          original: "in dem Park",
          suggested: "in den Park",
          reason: "Direktional → Akkusativ",
        },
      ],
    },
  ],
};

export default function App() {
  const isFavoritesRoute =
    typeof window !== "undefined" && window.location.pathname === "/favorites";
  const [sentence, setSentence] = useState(EXAMPLE_SENTENCE);
  const [data, setData] = useState<MultiAnalysis | null>(EXAMPLE_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const refreshCount = () => {
    fetchStats()
      .then((s) => setCount(s.count))
      .catch(() => {});
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("shared");
    if (id) {
      setLoading(true);
      fetchSharedAnalysis(id)
        .then((result) => {
          setData(result);
          setSentence(result.sentence || "");
        })
        .catch(() => {
          setError("Shared analysis not found.");
        })
        .finally(() => setLoading(false));
    }
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

  const copyToClipboard = async (text: string) => {
    // Modern API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // fall through to legacy
      }
    }
    // Legacy fallback (works without fresh user gesture in most browsers)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  };

  const onShare = async () => {
    if (!data || sharing) return;
    if (data.id) {
      const url = `${window.location.origin}?shared=${data.id}`;
      const ok = await copyToClipboard(url);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
      return;
    }
    const ok = window.confirm(
      "Sharing creates a public link to this sentence and its analysis. Anyone with the link can view it. Continue?",
    );
    if (!ok) return;
    setSharing(true);
    try {
      const { id } = await shareAnalysis(sentence.trim(), data);
      setData({ ...data, id });
      const url = `${window.location.origin}?shared=${id}`;
      const copied = await copyToClipboard(url);
      if (copied) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        setShareUrl(url);
        setTimeout(() => setShareUrl(null), 8000);
      }
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && error) setError(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [error]);

  if (isFavoritesRoute) {
    return (
      <div className="min-h-screen">
        <Header count={count} />
        <main
          className="mx-auto px-6 sm:px-8 pb-16 w-full"
          style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}
        >
          <Favorites />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header count={count} />
      <main
        lang="de"
        className="mx-auto px-6 sm:px-8 pb-16 w-full"
        style={{
          maxWidth: 1100,
          paddingTop: "clamp(20px, 4vw, 36px)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 640 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Satzbau{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              — German Sentence Analyzer
            </span>
          </h1>

          <div style={{ marginTop: 20 }}>
            {error && (
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}
            {shareUrl && (
              <div
                style={{
                  background: "var(--warn-bg)",
                  border: "1px solid var(--warn-border)",
                  color: "var(--warn-text)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-card)",
                  marginBottom: 16,
                  fontSize: 14,
                  lineHeight: 1.5,
                  wordBreak: "break-all",
                }}
              >
                <strong>Shared!</strong> Copy this link:{" "}
                <a
                  href={shareUrl}
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  {shareUrl}
                </a>
              </div>
            )}
            <SentenceInput
              value={sentence}
              onChange={setSentence}
              onSubmit={onAnalyze}
              disabled={loading}
              loading={loading}
              onShare={onShare}
              showShare={!!data && !loading}
              copied={copied}
              sharing={sharing}
            />
          </div>
        </div>

        <div aria-live="polite" className="mt-8">
          {loading && (
            <div className="mx-auto" style={{ maxWidth: 640 }}>
              <LoadingSkeleton />
            </div>
          )}
          {!loading && data && (
            <SentenceCarousel sentences={data.sentences} />
          )}
        </div>

        <section
          lang="en"
          className="mx-auto"
          style={{
            maxWidth: 640,
            marginTop: 72,
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
              margin: 0,
            }}
          >
            What Satzbau does
          </h2>
          <p style={{ marginTop: 8 }}>
            Satzbau is a free German sentence analyzer for learners. Paste a
            sentence and you'll see every noun with its article (der, die, or das)
            and plural form; every verb with its Partizip II and auxiliary (haben
            or sein); and a role-by-role breakdown that labels the Subjekt,
            Akkusativobjekt, Dativobjekt, and adverbials. It also flags likely
            mistakes in your own writing.
          </p>

          <h2
            style={{
              marginTop: 32,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            German grammar guides
          </h2>
          <ul
            style={{
              marginTop: 8,
              paddingLeft: 20,
              listStyle: "disc",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <li><a className="underline underline-offset-2" href="/guides/der-die-das">How to know der, die, or das</a></li>
            <li><a className="underline underline-offset-2" href="/guides/accusative-vs-dative">Accusative vs dative in German</a></li>
            <li><a className="underline underline-offset-2" href="/guides/german-cases">The four German cases explained</a></li>
            <li><a className="underline underline-offset-2" href="/guides/partizip-2">Partizip II: how to form it + list</a></li>
            <li><a className="underline underline-offset-2" href="/guides/haben-or-sein">Haben or sein as auxiliary?</a></li>
            <li><a className="underline underline-offset-2" href="/guides/german-plurals">German plural rules</a></li>
            <li><a className="underline underline-offset-2" href="/guides/german-word-order">German word order (Satzbau)</a></li>
            <li><a className="underline underline-offset-2" href="/guides/modal-verbs">German modal verbs</a></li>
            <li><a className="underline underline-offset-2" href="/guides/strong-verbs">Strong & irregular verbs</a></li>
            <li><a className="underline underline-offset-2" href="/guides/two-way-prepositions">Two-way prepositions (Wechselpräpositionen)</a></li>
          </ul>

          <h2
            style={{
              marginTop: 32,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            FAQ
          </h2>
          <dl
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {FAQ.map((q) => (
              <div key={q.q}>
                <dt style={{ fontWeight: 500, color: "var(--text)" }}>{q.q}</dt>
                <dd style={{ marginTop: 4 }}>{q.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
