import { useEffect, useState } from "react";
import { SentenceInput } from "./SentenceInput";
import { SentenceCarousel } from "./SentenceCarousel";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorBanner } from "./ErrorBanner";
import { analyzeSentence, fetchSharedAnalysis, messageForError, shareAnalysis } from "../lib/api";
import { track } from "../lib/analytics";
import type { MultiAnalysis } from "../lib/types";

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }
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
}

export function AnalyzePage() {
  const [sentence, setSentence] = useState("");
  const [data, setData] = useState<MultiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
        .catch(() => setError("Shared analysis not found."))
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && error) setError(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [error]);

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
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setLoading(false);
    }
  };

  const onShare = async () => {
    if (!data || sharing) return;
    if (data.id) {
      const url = `${window.location.origin}/analyze?shared=${data.id}`;
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
      const url = `${window.location.origin}/analyze?shared=${id}`;
      const wasCopied = await copyToClipboard(url);
      if (wasCopied) {
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

  return (
    <main
      lang="de"
      className="mx-auto px-6 sm:px-8 pb-16 w-full"
      style={{ maxWidth: 1100, paddingTop: "clamp(20px, 4vw, 36px)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 640 }}>
        <div>
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
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
              <a href={shareUrl} style={{ color: "inherit", textDecoration: "underline" }}>
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
        {!loading && data && <SentenceCarousel sentences={data.sentences} />}
      </div>

    </main>
  );
}
