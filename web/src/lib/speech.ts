export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const de = voices.find((v) => v.lang === "de-DE")
    ?? voices.find((v) => v.lang?.toLowerCase().startsWith("de"));
  cachedVoice = de ?? null;
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
