import rateLimit from "express-rate-limit";

const max = Number(process.env.RATE_LIMIT_MAX ?? 20);
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 600_000);

export const analyzeRateLimit = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests" });
  },
});
