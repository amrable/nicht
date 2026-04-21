import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const FILE = process.env.COUNTER_FILE ?? "./data/counter.txt";

let chain: Promise<unknown> = Promise.resolve();

async function readCount(): Promise<number> {
  try {
    const raw = await readFile(FILE, "utf8");
    const n = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function writeCount(n: number): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, String(n));
  await rename(tmp, FILE);
}

export function incrementCount(): Promise<number> {
  const next = chain.then(async () => {
    const n = (await readCount()) + 1;
    await writeCount(n);
    return n;
  });
  chain = next.catch(() => {});
  return next;
}

export function getCount(): Promise<number> {
  return readCount();
}
