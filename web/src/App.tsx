import { useEffect, useState } from "react";
import { SentenceInput } from "./components/SentenceInput";
import { SentenceCarousel } from "./components/SentenceCarousel";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ErrorBanner } from "./components/ErrorBanner";
import Header from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { Favorites } from "./components/Favorites";
import { CommonList } from "./components/CommonList";
import { CommonDetail } from "./components/CommonDetail";
import { GuideList } from "./components/GuideList";
import { GuideDetail } from "./components/GuideDetail";
import { AboutPage } from "./components/AboutPage";
import { SupportPage } from "./components/SupportPage";
import { Footer } from "./components/Footer";
import { matchRoute, type Route } from "./routes";
import { analyzeSentence, fetchSharedAnalysis, fetchStats, messageForError, shareAnalysis } from "./lib/api";
import { track } from "./lib/analytics";
import type { MultiAnalysis } from "./lib/types";

const FAQ = [
  {
    q: "How is this different from Duolingo or Babbel?",
    a: "Duolingo and Babbel build habits through repetition — they're great for vocabulary. Satzbau is a reference tool: paste any sentence and get a full explanation of why the word order, cases, and articles are what they are. No streaks, no gamification — just answers.",
  },
  {
    q: "I know vocabulary but can't build sentences — can this help?",
    a: "Yes. Paste any sentence and Satzbau shows you exactly how each part works: what role it plays, what case it's in, and why the verb is where it is. Reading enough of these breakdowns builds the intuition for German word order.",
  },
  {
    q: "Can it tell me if a noun is der, die, or das?",
    a: "Yes. For each noun in your sentence, Satzbau shows the correct definite article and the plural form.",
  },
  {
    q: "Will it catch mistakes in my own sentences?",
    a: "If you submit a sentence with a likely error — wrong case ending, wrong article, wrong verb form — Satzbau flags the probable mistake and shows the corrected form.",
  },
];
export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    matchRoute(typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  const [sentence, setSentence] = useState("");
  const [data, setData] = useState<MultiAnalysis | null>(null);
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
      track("shared_view", { share_id: id });
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

  useEffect(() => {
    const fire = () => {
      track("page_view", { path: window.location.pathname });
      setRoute(matchRoute(window.location.pathname));
    };
    fire();
    window.addEventListener("popstate", fire);
    return () => window.removeEventListener("popstate", fire);
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
      track("sentence_analyzed", {
        char_length: trimmed.length,
        word_count: trimmed.split(/\s+/).filter(Boolean).length,
      });
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
      track("share_created", { share_id: id });
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

  if (route.kind === "favorites") {
    return (
      <div className="min-h-screen bottom-nav-spacer">
        <Header count={count} />
        <main
          className="mx-auto px-6 sm:px-8 pb-16 w-full"
          style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}
        >
          <Favorites />
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (
    route.kind === "common-list" ||
    route.kind === "common-detail" ||
    route.kind === "guides-list" ||
    route.kind === "guides-detail" ||
    route.kind === "about" ||
    route.kind === "support"
  ) {
    return (
      <div className="min-h-screen bottom-nav-spacer">
        <Header count={count} />
        <main
          className="mx-auto px-6 sm:px-8 pb-16 w-full"
          style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}
        >
          {route.kind === "common-list" && <CommonList />}
          {route.kind === "common-detail" && <CommonDetail slug={route.slug} />}
          {route.kind === "guides-list" && <GuideList />}
          {route.kind === "guides-detail" && <GuideDetail slug={route.slug} />}
          {route.kind === "about" && <AboutPage />}
          {route.kind === "support" && <SupportPage />}
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bottom-nav-spacer">
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
              — German word order & grammar trainer
            </span>
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
              marginBottom: 4,
            }}
          >
            {[
              { label: "Word order & cases" },
              { label: "Instant grammar correction" },
              { label: "Noun gender & plural" },
              { label: "Verb conjugation" },
            ].map(({ label }) => (
              <span
                key={label}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "var(--surface)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--hairline)",
                }}
              >
                {label}
              </span>
            ))}
          </div>

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

        {!loading && (
          <div
            className="mx-auto"
            style={{ maxWidth: 640, marginTop: 32 }}
          >
            <a
              href="/common"
              className="focus-ring"
              style={{
                display: "block",
                padding: "16px 18px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                textDecoration: "none",
                color: "var(--text)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  marginBottom: 4,
                }}
              >
                Browse examples
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                100 most common German sentences, fully analyzed
                <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>→</span>
              </span>
            </a>
          </div>
        )}

        {!data && !loading && (
          <section
            lang="en"
            className="mx-auto"
            style={{
              maxWidth: 640,
              marginTop: 64,
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            <dl
              style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {FAQ.map((q) => (
                <div key={q.q}>
                  <dt style={{ fontWeight: 500, color: "var(--text)" }}>{q.q}</dt>
                  <dd style={{ marginTop: 4, marginInlineStart: 0 }}>{q.a}</dd>
                </div>
              ))}
            </dl>
            <p style={{ marginTop: 24, fontSize: 13 }}>
              <a className="underline underline-offset-2" href="/guides">
                Browse all grammar guides →
              </a>
            </p>
          </section>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
