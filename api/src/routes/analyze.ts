import { Router } from "express";
import { AnalyzeRequest } from "../schemas/analysis.js";
import { analyzeWithOpenRouter } from "../services/openrouter.js";
import { getCount, incrementCount } from "../services/counter.js";
import { logRequest } from "../services/logger.js";
import { analyzeRateLimit } from "../middleware/rateLimit.js";

export const analyzeRouter = Router();

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

analyzeRouter.get("/stats", async (_req, res, next) => {
  try {
    res.json({ count: await getCount() });
  } catch (err) {
    next(err);
  }
});
