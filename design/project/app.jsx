const { useState, useEffect, useRef, useCallback, useMemo } = React;

// --- Gender pill color map ---------------------------------------------------
const GENDER_COLORS = {
  der: { bg: '#DBEAFE', text: '#1E40AF', bgTw: 'bg-blue-100', textTw: 'text-blue-800' },
  die: { bg: '#FEE2E2', text: '#991B1B', bgTw: 'bg-red-100',  textTw: 'text-red-800'  },
  das: { bg: '#DCFCE7', text: '#166534', bgTw: 'bg-green-100',textTw: 'text-green-800'},
};

// --- Mock / sample sentences -------------------------------------------------
const SAMPLES = {
  "Der Mann hat das Buch in die Bibliothek gebracht.": {
    nouns: [
      { article: 'der', word: 'Mann',        plural: 'Männer' },
      { article: 'das', word: 'Buch',        plural: 'Bücher' },
      { article: 'die', word: 'Bibliothek',  plural: 'Bibliotheken' },
    ],
    verbs: [
      { infinitive: 'bringen', inSentence: 'hat … gebracht', partizipII: 'gebracht', hilfsverb: 'haben' },
    ],
    breakdown: [
      { part: 'Der Mann',           role: 'Subjekt (Nominativ)' },
      { part: 'hat … gebracht',     role: 'Prädikat (Perfekt)' },
      { part: 'das Buch',           role: 'Akkusativobjekt' },
      { part: 'in die Bibliothek',  role: 'Richtungsangabe (Akkusativ)' },
    ],
  },
  "Die Kinder spielen im Garten mit dem Hund.": {
    nouns: [
      { article: 'die', word: 'Kinder', plural: null },
      { article: 'der', word: 'Garten', plural: 'Gärten' },
      { article: 'der', word: 'Hund',   plural: 'Hunde' },
    ],
    verbs: [
      { infinitive: 'spielen', inSentence: 'spielen', partizipII: 'gespielt', hilfsverb: 'haben' },
    ],
    breakdown: [
      { part: 'Die Kinder',      role: 'Subjekt (Nominativ)' },
      { part: 'spielen',         role: 'Prädikat (Präsens)' },
      { part: 'im Garten',       role: 'Ortsangabe (Dativ)' },
      { part: 'mit dem Hund',    role: 'Präpositionalobjekt (Dativ)' },
    ],
  },
  "Gestern ist sie mit dem Zug nach Berlin gefahren.": {
    nouns: [
      { article: 'der', word: 'Zug', plural: 'Züge' },
    ],
    verbs: [
      { infinitive: 'fahren', inSentence: 'ist … gefahren', partizipII: 'gefahren', hilfsverb: 'sein' },
    ],
    breakdown: [
      { part: 'Gestern',        role: 'Temporalangabe' },
      { part: 'ist … gefahren', role: 'Prädikat (Perfekt)' },
      { part: 'sie',            role: 'Subjekt (Nominativ)' },
      { part: 'mit dem Zug',    role: 'Modalangabe (Dativ)' },
      { part: 'nach Berlin',    role: 'Richtungsangabe' },
    ],
  },
};

// --- Analysis helper: Claude or mock -----------------------------------------
async function analyzeSentence(sentence) {
  // Short-circuit to sample map for the known examples (instant, deterministic)
  const trimmed = sentence.trim();
  if (SAMPLES[trimmed]) {
    await new Promise(r => setTimeout(r, 450));
    return SAMPLES[trimmed];
  }

  const prompt = `Du bist ein Linguist. Analysiere diesen deutschen Satz und gib GENAU diese JSON-Struktur zurück, ohne Markdown, ohne Kommentare, nur das rohe JSON-Objekt:

{
  "nouns": [{ "article": "der|die|das", "word": "Substantiv (Nominativ Singular)", "plural": "Pluralform oder null" }],
  "verbs": [{ "infinitive": "Infinitiv", "inSentence": "konjugierte Form wie im Satz", "partizipII": "Partizip II", "hilfsverb": "haben oder sein" }],
  "breakdown": [{ "part": "Satzteil wörtlich aus dem Satz", "role": "grammatikalische Rolle auf Deutsch" }]
}

Regeln:
- "article" ist immer der bestimmte Artikel im Nominativ Singular (der/die/das), auch wenn im Satz ein anderer Kasus oder Plural steht.
- "word" ist das Substantiv im Nominativ Singular. Wenn ein Substantiv nur im Plural existiert (z.B. "Leute"), gib das Pluralwort bei "word" und null bei "plural".
- "plural" ist null wenn es keinen gebräuchlichen Plural gibt.
- Keine Duplikate in "nouns" oder "verbs".
- "breakdown" zerlegt den Satz in seine grammatikalischen Bestandteile in ihrer natürlichen Reihenfolge.
- Rollen auf Deutsch: Subjekt, Prädikat, Akkusativobjekt, Dativobjekt, Präpositionalobjekt, Ortsangabe, Temporalangabe, Modalangabe, Richtungsangabe, etc.

Satz: "${trimmed}"`;

  const raw = await window.claude.complete(prompt);
  // Strip code fences if the model adds them anyway
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  // Find the first { ... last }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
  const parsed = JSON.parse(cleaned);
  // Normalize
  const nouns = Array.isArray(parsed.nouns) ? parsed.nouns.filter(n => n && n.article && n.word).map(n => ({
    article: String(n.article).toLowerCase(),
    word: n.word,
    plural: n.plural === null || n.plural === undefined || n.plural === '' || n.plural === 'null' ? null : n.plural,
  })) : [];
  const verbs = Array.isArray(parsed.verbs) ? parsed.verbs.filter(v => v && v.infinitive).map(v => ({
    infinitive: v.infinitive,
    inSentence: v.inSentence || v.infinitive,
    partizipII: v.partizipII || '—',
    hilfsverb: (v.hilfsverb || 'haben').toLowerCase(),
  })) : [];
  const breakdown = Array.isArray(parsed.breakdown) ? parsed.breakdown.filter(b => b && b.part && b.role) : [];
  return { nouns, verbs, breakdown };
}

// --- UI primitives -----------------------------------------------------------

function SectionLabel({ children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {children}
      </div>
      <div className="border-t border-slate-200" style={{ marginTop: 6, marginBottom: 10 }} />
    </div>
  );
}

function ArticlePill({ article, style = 'soft' }) {
  const c = GENDER_COLORS[article];
  if (!c) return null;
  if (style === 'outline') {
    return (
      <span
        className="text-xs font-semibold tabnum"
        style={{
          padding: '2px 8px',
          borderRadius: 6,
          border: `1px solid ${c.text}`,
          color: c.text,
          background: 'transparent',
          lineHeight: 1.4,
        }}
      >
        {article}
      </span>
    );
  }
  if (style === 'dot') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
        <span style={{ width: 8, height: 8, borderRadius: 999, background: c.text, display: 'inline-block' }} />
        {article}
      </span>
    );
  }
  // soft (default)
  return (
    <span
      className="text-xs font-semibold"
      style={{ padding: '2px 8px', borderRadius: 6, background: c.bg, color: c.text, lineHeight: 1.4 }}
    >
      {article}
    </span>
  );
}

// --- Result sub-sections -----------------------------------------------------

function NounsSection({ nouns, pillStyle }) {
  if (!nouns || nouns.length === 0) return null;
  return (
    <section aria-labelledby="sec-nomen">
      <SectionLabel>
        <span id="sec-nomen">Nomen</span>
      </SectionLabel>
      <ul className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {nouns.map((n, i) => (
          <li key={i} className="noun-row" style={{ padding: '8px 0' }}>
            {/* Desktop: 3-col grid. Mobile: pill+word inline, plural below. */}
            <div className="hidden sm:grid" style={{ gridTemplateColumns: '56px 1fr auto', alignItems: 'baseline', gap: 12 }}>
              <span><ArticlePill article={n.article} style={pillStyle} /></span>
              <span className="text-base font-medium text-slate-900" style={{ lineHeight: 1.4 }}>{n.word}</span>
              <span className="text-sm text-slate-500 tabnum">{n.plural ?? '—'}</span>
            </div>
            <div className="sm:hidden">
              <div className="flex items-baseline gap-2">
                <ArticlePill article={n.article} style={pillStyle} />
                <span className="text-base font-medium text-slate-900">{n.word}</span>
              </div>
              <div className="text-sm text-slate-500 mt-0.5">Plural: {n.plural ?? '—'}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VerbsSection({ verbs }) {
  if (!verbs || verbs.length === 0) return null;
  return (
    <section aria-labelledby="sec-verben" style={{ marginTop: 24 }} className="verbs-section">
      <SectionLabel>
        <span id="sec-verben">Verben</span>
      </SectionLabel>
      <div className="flex flex-col" style={{ gap: 8 }}>
        {verbs.map((v, i) => (
          <div key={i} className="border border-slate-200 rounded-lg bg-white" style={{ padding: '12px 14px' }}>
            <div className="text-lg font-medium text-slate-900" style={{ lineHeight: 1.3 }}>{v.infinitive}</div>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4, marginTop: 8 }}>
              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">Im Satz</dt>
              <dd className="text-[15px] text-slate-900">{v.inSentence}</dd>
              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">Partizip II</dt>
              <dd className="text-[15px] text-slate-900">{v.partizipII}</dd>
              <dt className="text-xs uppercase tracking-wider text-slate-500 self-center">Hilfsverb</dt>
              <dd>
                <span
                  className="text-xs font-semibold"
                  style={{ padding: '2px 8px', borderRadius: 6, background: '#F1F5F9', color: '#334155' }}
                >
                  {v.hilfsverb}
                </span>
              </dd>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function BreakdownSection({ breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;
  return (
    <section aria-labelledby="sec-aufbau" style={{ marginTop: 24 }}>
      <SectionLabel>
        <span id="sec-aufbau">Aufbau</span>
      </SectionLabel>
      <ul className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {breakdown.map((b, i) => (
          <li key={i} style={{ padding: '6px 0' }}>
            <div className="hidden sm:flex items-baseline justify-between gap-6">
              <span className="text-slate-900 font-medium text-[15px]">{b.part}</span>
              <span className="text-sm text-slate-500 text-right">{b.role}</span>
            </div>
            <div className="sm:hidden">
              <div className="text-slate-900 font-medium text-[15px]">{b.part}</div>
              <div className="text-sm text-slate-500 mt-0.5">{b.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// --- Skeleton ----------------------------------------------------------------
function Skeleton() {
  const row = (w) => (
    <div className="animate-pulse bg-slate-200 rounded" style={{ height: 14, width: w, marginBottom: 10 }} />
  );
  return (
    <div aria-hidden="true">
      {/* Nouns block */}
      <div style={{ marginTop: 28 }}>
        <div className="animate-pulse bg-slate-200 rounded" style={{ height: 10, width: 60, marginBottom: 16 }} />
        <div className="border-t border-slate-200" />
        <div style={{ padding: '14px 0', borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-4">
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 18, width: 36 }} />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 16, width: 120 }} />
            <div className="flex-1" />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 14, width: 80 }} />
          </div>
        </div>
        <div style={{ padding: '14px 0', borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-4">
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 18, width: 36 }} />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 16, width: 90 }} />
            <div className="flex-1" />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 14, width: 60 }} />
          </div>
        </div>
        <div style={{ padding: '14px 0' }}>
          <div className="flex items-center gap-4">
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 18, width: 36 }} />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 16, width: 140 }} />
            <div className="flex-1" />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 14, width: 100 }} />
          </div>
        </div>
      </div>

      {/* Verbs block */}
      <div style={{ marginTop: 40 }}>
        <div className="animate-pulse bg-slate-200 rounded" style={{ height: 10, width: 60, marginBottom: 16 }} />
        <div className="border border-slate-200 rounded-lg bg-white" style={{ padding: 16 }}>
          <div className="animate-pulse bg-slate-200 rounded" style={{ height: 20, width: 120, marginBottom: 14 }} />
          {row(220)}
          {row(160)}
          <div className="animate-pulse bg-slate-200 rounded" style={{ height: 16, width: 50 }} />
        </div>
      </div>

      {/* Breakdown block */}
      <div style={{ marginTop: 40 }}>
        <div className="animate-pulse bg-slate-200 rounded" style={{ height: 10, width: 60, marginBottom: 16 }} />
        <div className="border-t border-slate-200" />
        {[0,1,2,3].map(i => (
          <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #E2E8F0' }} className="flex justify-between">
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 16, width: `${30 + (i*8)%40}%` }} />
            <div className="animate-pulse bg-slate-200 rounded" style={{ height: 14, width: 120 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Error banner ------------------------------------------------------------
function ErrorBanner({ message, onDismiss }) {
  return (
    <div
      role="alert"
      className="rounded-lg flex items-start gap-3"
      style={{
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#991B1B',
        padding: '10px 14px',
        marginBottom: 16,
      }}
    >
      <span className="text-sm font-medium flex-1" style={{ lineHeight: 1.5 }}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fehlermeldung schließen"
        className="focus-ring"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#991B1B',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
          borderRadius: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}

// --- Tweaks panel (edit mode) ------------------------------------------------
function TweaksPanel({ tweaks, setTweaks, visible }) {
  if (!visible) return null;
  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 260,
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: 16,
        zIndex: 9999,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ marginBottom: 12 }}>Tweaks</div>

      <div style={{ marginBottom: 14 }}>
        <div className="text-xs font-medium text-slate-900" style={{ marginBottom: 6 }}>Pill-Stil</div>
        <div className="flex gap-1" role="radiogroup">
          {[
            { v: 'soft',    label: 'Soft' },
            { v: 'outline', label: 'Outline' },
            { v: 'dot',     label: 'Dot' },
          ].map(o => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={tweaks.pillStyle === o.v}
              onClick={() => set('pillStyle', o.v)}
              className="text-xs focus-ring"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid ' + (tweaks.pillStyle === o.v ? '#0F172A' : '#E2E8F0'),
                background: tweaks.pillStyle === o.v ? '#0F172A' : 'white',
                color: tweaks.pillStyle === o.v ? 'white' : '#0F172A',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="text-xs font-medium text-slate-900" style={{ marginBottom: 6 }}>Dichte</div>
        <div className="flex gap-1" role="radiogroup">
          {[
            { v: 'compact', label: 'Kompakt' },
            { v: 'normal',  label: 'Normal' },
            { v: 'airy',    label: 'Luftig' },
          ].map(o => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={tweaks.density === o.v}
              onClick={() => set('density', o.v)}
              className="text-xs focus-ring"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid ' + (tweaks.density === o.v ? '#0F172A' : '#E2E8F0'),
                background: tweaks.density === o.v ? '#0F172A' : 'white',
                color: tweaks.density === o.v ? 'white' : '#0F172A',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-900" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={tweaks.showKeyboardHint}
          onChange={e => set('showKeyboardHint', e.target.checked)}
        />
        Tastatur-Hinweis zeigen
      </label>
    </div>
  );
}

// --- Main App ----------------------------------------------------------------

function App() {
  const [sentence, setSentence] = useState("Der Mann hat das Buch in die Bibliothek gebracht.");
  const [status, setStatus] = useState('idle'); // idle | loading | error | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useState(false);
  const textareaRef = useRef(null);

  // Density multiplier
  const densityScale = tweaks.density === 'compact' ? 0.75 : tweaks.density === 'airy' ? 1.25 : 1;

  // Edit-mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setEditMode(true);
      if (e.data.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = sentence.trim();
    if (!trimmed) {
      setError('Bitte einen Satz eingeben.');
      setStatus('error');
      setResult(null);
      return;
    }
    setError(null);
    setStatus('loading');
    setResult(null);
    try {
      const r = await analyzeSentence(trimmed);
      // If everything empty, treat as error
      if ((!r.nouns || r.nouns.length === 0) && (!r.verbs || r.verbs.length === 0) && (!r.breakdown || r.breakdown.length === 0)) {
        throw new Error('Keine Analyse möglich.');
      }
      setResult(r);
      setStatus('result');
    } catch (err) {
      setError('Der Satz konnte nicht analysiert werden. Bitte erneut versuchen.');
      setStatus('error');
    }
  }, [sentence]);

  // Keyboard: Ctrl/Cmd+Enter submits; Esc dismisses error
  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape' && status === 'error') {
        setError(null);
        setStatus(result ? 'result' : 'idle');
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [status, result]);

  const isLoading = status === 'loading';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <main
        lang="de"
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: 'clamp(28px, 5vw, 48px)',
          paddingBottom: 48,
        }}
      >
        <h1 className="text-xl font-medium text-slate-900" style={{ lineHeight: 1.4 }}>
          German Sentence Analyzer
        </h1>

        <div className="gap-title-input" style={{ marginTop: 20 }}>
          {status === 'error' && error && (
            <ErrorBanner message={error} onDismiss={() => { setError(null); setStatus(result ? 'result' : 'idle'); }} />
          )}

          <label htmlFor="sentence" className="sr-only">Deutscher Satz</label>
          <textarea
            id="sentence"
            ref={textareaRef}
            className="textarea focus-ring w-full text-[15px] text-slate-900"
            rows={3}
            maxLength={500}
            placeholder="Deutschen Satz hier einfügen…"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading}
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: '12px 14px',
              resize: 'vertical',
              lineHeight: 1.5,
              color: '#0F172A',
            }}
          />

          <div className="flex items-center justify-between gap-3" style={{ marginTop: 12 }}>
            <div className="text-xs text-slate-400" style={{ minHeight: 16 }}>
              {tweaks.showKeyboardHint && (
                <span>
                  <kbd style={{ fontFamily: 'inherit', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 6px', fontSize: 11, color: '#475569' }}>⌘</kbd>
                  {' '}+{' '}
                  <kbd style={{ fontFamily: 'inherit', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 6px', fontSize: 11, color: '#475569' }}>Enter</kbd>
                  {' '}zum Analysieren
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !sentence.trim()}
              className="btn-primary focus-ring text-sm font-medium"
              style={{
                height: 40,
                padding: '0 20px',
                borderRadius: 8,
                border: 'none',
                background: (isLoading || !sentence.trim()) ? '#E2E8F0' : '#0F172A',
                color: (isLoading || !sentence.trim()) ? '#94A3B8' : 'white',
                cursor: (isLoading || !sentence.trim()) ? 'not-allowed' : 'pointer',
                minWidth: 120,
              }}
              onMouseEnter={(e) => { if (!isLoading && sentence.trim()) e.currentTarget.style.background = '#1E293B'; }}
              onMouseLeave={(e) => { if (!isLoading && sentence.trim()) e.currentTarget.style.background = '#0F172A'; }}
              onMouseDown={(e) => { if (!isLoading && sentence.trim()) e.currentTarget.style.background = '#020617'; }}
              onMouseUp={(e) => { if (!isLoading && sentence.trim()) e.currentTarget.style.background = '#1E293B'; }}
            >
              {isLoading ? 'Analysiere…' : 'Analysieren'}
            </button>
          </div>
        </div>

        {/* Sample chips below input — subtle, neutral, not in spec but useful */}
        {status === 'idle' && !result && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
            {Object.keys(SAMPLES).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSentence(s)}
                className="text-xs text-slate-500 focus-ring"
                style={{
                  padding: '4px 10px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  borderRadius: 999,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 280,
                }}
              >
                {s.length > 40 ? s.slice(0, 40) + '…' : s}
              </button>
            ))}
          </div>
        )}

        <div aria-live="polite" style={{ marginTop: 28 * densityScale }}>
          {isLoading && <Skeleton />}
          {status === 'result' && result && (
            <div style={{ transform: `none` }}>
              <NounsSection nouns={result.nouns} pillStyle={tweaks.pillStyle} />
              <VerbsSection verbs={result.verbs} />
              <BreakdownSection breakdown={result.breakdown} />
            </div>
          )}
        </div>
      </main>

      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} visible={editMode} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
