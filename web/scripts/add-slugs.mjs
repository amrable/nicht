// One-shot: backfills `slug` on each entry of public/common-sentences.json.
// Idempotent — existing slugs are preserved; only entries missing slug get one.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(here, "../public/common-sentences.json");

const GERMAN_MAP = { "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "ae", "Ö": "oe", "Ü": "ue" };

function slugify(input, maxLength = 60) {
  const t = Array.from(input).map((c) => GERMAN_MAP[c] ?? c).join("");
  const ascii = t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const cleaned = ascii.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (cleaned.length <= maxLength) return cleaned;
  const trimmed = cleaned.slice(0, maxLength);
  const lastDash = trimmed.lastIndexOf("-");
  return lastDash > 20 ? trimmed.slice(0, lastDash) : trimmed;
}

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
const taken = new Set(data.filter((e) => e.slug).map((e) => e.slug));
let added = 0;
for (const entry of data) {
  if (entry.slug) continue;
  const base = slugify(entry.sentence) || `sentence-${entry.id}`;
  let slug = base;
  let i = 2;
  while (taken.has(slug)) slug = `${base}-${i++}`;
  taken.add(slug);
  entry.slug = slug;
  added++;
}
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
console.log(`added ${added} slugs (total ${data.length} entries)`);
