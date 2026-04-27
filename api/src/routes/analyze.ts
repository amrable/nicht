import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  AnalyzeRequest,
  AnalysisResponse,
} from "../schemas/analysis.js";
import { analyzeWithOpenRouter } from "../services/openrouter.js";
import { getCount, incrementCount } from "../services/counter.js";
import { logRequest } from "../services/logger.js";
import { analyzeRateLimit } from "../middleware/rateLimit.js";
import { db } from "../db/index.js";
import { analyses } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const analyzeRouter = Router();

const ShareRequest = z.object({
  sentence: z.string().trim().min(1).max(2000),
  analysis: AnalysisResponse,
});

analyzeRouter.post("/analyze", analyzeRateLimit, async (req, res, next) => {
  const parsed = AnalyzeRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const analysis = await analyzeWithOpenRouter(parsed.data.sentence);
    incrementCount().catch((e) => console.error("counter", e));
    logRequest(parsed.data.sentence, analysis).catch((e) =>
      console.error("logger", e),
    );
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

analyzeRouter.post("/share", analyzeRateLimit, async (req, res, next) => {
  const parsed = ShareRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const id = uuidv4();
    await db.insert(analyses).values({
      id,
      sentence: parsed.data.sentence,
      result: JSON.stringify(parsed.data.analysis),
    });
    res.json({ id });
  } catch (err) {
    next(err);
  }
});

analyzeRouter.get("/shared/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(analyses).where(eq(analyses.id, id)).get();
    if (!result) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const parsedResult = JSON.parse(result.result);
    const wrapped =
      parsedResult && Array.isArray(parsedResult.sentences)
        ? parsedResult
        : { sentences: [parsedResult] };
    res.json({
      id: result.id,
      sentence: result.sentence,
      ...wrapped,
    });
  } catch (err) {
    next(err);
  }
});

analyzeRouter.get("/stats", async (_req, res, next) => {
  try {
    res.json({ count: await getCount() });
  } catch (err) {
    next(err);
  }
});
