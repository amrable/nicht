const GERMAN_MAP: Record<string, string> = {
  "ä": "ae",
  "ö": "oe",
  "ü": "ue",
  "ß": "ss",
  "Ä": "ae",
  "Ö": "oe",
  "Ü": "ue",
};

export function slugify(input: string, maxLength = 60): string {
  const transliterated = Array.from(input)
    .map((ch) => GERMAN_MAP[ch] ?? ch)
    .join("");
  const ascii = transliterated
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  const cleaned = ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned.length <= maxLength) return cleaned;
  const trimmed = cleaned.slice(0, maxLength);
  const lastDash = trimmed.lastIndexOf("-");
  return lastDash > 20 ? trimmed.slice(0, lastDash) : trimmed;
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
