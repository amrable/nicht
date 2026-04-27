import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { favorites } from "../db/schema.js";
import { requireUser } from "../middleware/auth.js";

export const favoritesRouter = Router();

const FavoriteRequest = z.object({
  kind: z.enum(["noun", "verb"]),
  key: z.string().min(1).max(200),
  payload: z.record(z.string(), z.unknown()),
});

function serialize(row: typeof favorites.$inferSelect) {
  return {
    id: row.id,
    kind: row.kind,
    key: row.key,
    payload: JSON.parse(row.payload),
    createdAt: row.createdAt,
  };
}

favoritesRouter.get("/favorites", requireUser, async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, req.userId!))
      .orderBy(desc(favorites.createdAt))
      .all();
    res.json({ favorites: rows.map(serialize) });
  } catch (err) {
    next(err);
  }
});

favoritesRouter.post("/favorites", requireUser, async (req, res, next) => {
  const parsed = FavoriteRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, req.userId!),
          eq(favorites.kind, parsed.data.kind),
          eq(favorites.key, parsed.data.key),
        ),
      )
      .get();

    if (existing) {
      res.json({ favorite: serialize(existing) });
      return;
    }

    const id = uuidv4();
    await db.insert(favorites).values({
      id,
      userId: req.userId!,
      kind: parsed.data.kind,
      key: parsed.data.key,
      payload: JSON.stringify(parsed.data.payload),
    });
    const row = await db.select().from(favorites).where(eq(favorites.id, id)).get();
    if (!row) {
      res.status(500).json({ error: "Insert failed" });
      return;
    }
    res.status(201).json({ favorite: serialize(row) });
  } catch (err) {
    next(err);
  }
});

favoritesRouter.delete("/favorites/:id", requireUser, async (req, res, next) => {
  try {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.id, req.params.id), eq(favorites.userId, req.userId!)))
      .run();
    if (result.changes === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const DeleteByKeyQuery = z.object({
  kind: z.enum(["noun", "verb"]),
  key: z.string().min(1).max(200),
});

favoritesRouter.delete("/favorites", requireUser, async (req, res, next) => {
  const parsed = DeleteByKeyQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  try {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, req.userId!),
          eq(favorites.kind, parsed.data.kind),
          eq(favorites.key, parsed.data.key),
        ),
      )
      .run();
    res.json({ ok: true, removed: result.changes });
  } catch (err) {
    next(err);
  }
});
