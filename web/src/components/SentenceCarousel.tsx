import { useEffect, useRef, useState } from "react";
import type { Analysis } from "../lib/types";
import { SentenceCard } from "./SentenceCard";

export function SentenceCarousel({ sentences }: { sentences: Analysis[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const total = sentences.length;

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(total - 1, idx));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = el.clientWidth;
        if (w === 0) return;
        const idx = Math.round(el.scrollLeft / w);
        setActive(idx);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      )
        return;
      e.preventDefault();
      scrollTo(e.key === "ArrowLeft" ? active - 1 : active + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, total]);

  if (total === 0) return null;
  if (total === 1) return <SentenceCard analysis={sentences[0]} />;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="mx-auto w-full flex items-center justify-between"
        style={{ maxWidth: 640, paddingInline: 4 }}
      >
        <button
          type="button"
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          aria-label="Vorheriger Satz"
          style={pagerBtnStyle(active === 0)}
        >
          ←
        </button>

        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Satz {active + 1} / {total}
          </span>
          <div className="flex items-center gap-1.5">
            {sentences.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Satz ${i + 1}`}
                aria-current={i === active}
                style={dotStyle(i === active)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollTo(active + 1)}
          disabled={active === total - 1}
          aria-label="Nächster Satz"
          style={pagerBtnStyle(active === total - 1)}
        >
          →
        </button>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-label="Sätze"
        className="carousel-scroller"
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          outline: "none",
        }}
      >
        {sentences.map((s, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%",
              minWidth: 0,
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              paddingInline: 2,
            }}
          >
            <SentenceCard analysis={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

function pagerBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 40,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "transparent",
    color: disabled ? "var(--text-faint)" : "var(--text)",
    cursor: disabled ? "default" : "pointer",
    fontSize: 16,
    lineHeight: 1,
    opacity: disabled ? 0.5 : 1,
  };
}

function dotStyle(active: boolean): React.CSSProperties {
  return {
    width: active ? 18 : 6,
    height: 6,
    borderRadius: 999,
    border: "none",
    background: active ? "var(--text)" : "var(--text-faint)",
    padding: 0,
    cursor: "pointer",
    transition: "width 150ms ease, background 150ms ease",
  };
}
