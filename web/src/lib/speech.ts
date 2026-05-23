export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

const PREFERRED_NAME_PATTERNS = [
  /google/i,
  /microsoft/i,
  /\b(anna|markus|petra|yannick|viktor|katja|stefan|hedda)\b/i,
  /natural|neural|enhanced|premium/i,
];

const BAD_NAME_PATTERNS = [/espeak/i, /pico/i, /flite/i];

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name || "";
  if (BAD_NAME_PATTERNS.some((r) => r.test(name))) return -100;
  let score = 0;
  if (v.lang === "de-DE") score += 10;
  else if (v.lang?.toLowerCase().startsWith("de")) score += 5;
  if (v.localService === false) score += 8;
  for (const r of PREFERRED_NAME_PATTERNS) if (r.test(name)) score += 4;
  return score;
}

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const german = voices.filter((v) => v.lang?.toLowerCase().startsWith("de"));
  if (!german.length) return null;
  const ranked = german
    .map((v) => ({ v, s: scoreVoice(v) }))
    .sort((a, b) => b.s - a.s);
  if (ranked[0].s < 0) return null;
  cachedVoice = ranked[0].v;
  return cachedVoice;
}

export function speakGerman(text: string): void {
  if (!isSpeechSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "de-DE";
  utter.rate = 0.95;
  const voice = pickGermanVoice();
  if (voice) utter.voice = voice;
  synth.speak(utter);
}
