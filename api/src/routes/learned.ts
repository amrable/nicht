import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { learnedSentences } from "../db/schema.js";
import { requireUser } from "../middleware/auth.js";

export const learnedRouter = Router();

learnedRouter.get("/learned", requireUser, async (req, res, next) => {
  try {
    const rows = await db
      .select({ sentenceId: learnedSentences.sentenceId })
      .from(learnedSentences)
      .where(eq(learnedSentences.userId, req.userId!))
      .all();
    res.json({ learnedIds: rows.map((r) => r.sentenceId) });
  } catch (err) {
    next(err);
  }
});

const MarkRequest = z.object({
  sentenceId: z.number().int().positive(),
});

learnedRouter.post("/learned", requireUser, async (req, res, next) => {
  const parsed = MarkRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const existing = await db
      .select()
      .from(learnedSentences)
      .where(
        and(
          eq(learnedSentences.userId, req.userId!),
          eq(learnedSentences.sentenceId, parsed.data.sentenceId),
        ),
      )
      .get();

    if (existing) {
      res.json({ ok: true });
      return;
    }

    await db.insert(learnedSentences).values({
      id: uuidv4(),
      userId: req.userId!,
      sentenceId: parsed.data.sentenceId,
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const UnmarkQuery = z.object({
  sentenceId: z.coerce.number().int().positive(),
});

learnedRouter.delete("/learned", requireUser, async (req, res, next) => {
  const parsed = UnmarkQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  try {
    const result = await db
      .delete(learnedSentences)
      .where(
        and(
          eq(learnedSentences.userId, req.userId!),
          eq(learnedSentences.sentenceId, parsed.data.sentenceId),
        ),
      )
      .run();
    res.json({ ok: true, removed: result.changes });
  } catch (err) {
    next(err);
  }
});
