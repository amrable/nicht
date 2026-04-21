import type { ErrorRequestHandler } from "express";
import { UpstreamError, UpstreamTimeoutError } from "../services/openrouter.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof UpstreamTimeoutError) {
    res.status(504).json({ error: "Upstream timeout" });
    return;
  }
  if (err instanceof UpstreamError) {
    res.status(502).json({ error: "Upstream model error" });
    return;
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Internal error" });
};
