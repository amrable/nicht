import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { analyzeWithOpenRouter } from "../src/services/openrouter.js";
import type { Analysis } from "../src/schemas/analysis.js";

const ROOT = resolve(import.meta.dirname, "../..");
const INPUT = resolve(ROOT, "top100.json");
const OUTPUT = resolve(ROOT, "web/public/common-sentences.json");

type Entry = {
  id: number;
  sentence: string;
  analysis: Analysis;
};

async function main() {
  const sentences: string[] = JSON.parse(readFileSync(INPUT, "utf8"));
  const existing: Entry[] = existsSync(OUTPUT)
    ? JSON.parse(readFileSync(OUTPUT, "utf8"))
    : [];
  const byId = new Map(existing.map((e) => [e.id, e]));

  const results: Entry[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const id = i + 1;
    const sentence = sentences[i];
    const cached = byId.get(id);
    if (cached && cached.sentence === sentence) {
      results.push(cached);
      console.log(`[${id}/${sentences.length}] cached`);
      continue;
    }
    process.stdout.write(`[${id}/${sentences.length}] analyzing... `);
    try {
      const analysis = await analyzeWithOpenRouter(sentence);
      results.push({ id, sentence, analysis });
      writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
      console.log("ok");
    } catch (err) {
      console.error("FAILED:", (err as Error).message);
      console.error("Stopping. Re-run to resume.");
      process.exit(1);
    }
  }
  writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} entries to ${OUTPUT}`);
}

main();
