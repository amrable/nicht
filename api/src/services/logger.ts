import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Analysis } from "../schemas/analysis.js";

const FILE = process.env.REQUEST_LOG_FILE ?? "./data/requests.jsonl";

let chain: Promise<unknown> = Promise.resolve();
let dirReady = false;

export function logRequest(request: string, response: Analysis): Promise<void> {
  const line =
    JSON.stringify({ ts: new Date().toISOString(), request, response }) + "\n";
  const next = chain.then(async () => {
    if (!dirReady) {
      await mkdir(dirname(FILE), { recursive: true });
      dirReady = true;
    }
    await appendFile(FILE, line, "utf8");
  });
  chain = next.catch(() => {});
  return next;
}
