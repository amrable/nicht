import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {
  clearSessionCookie,
  optionalUser,
  setSessionCookie,
  signSession,
} from "../middleware/auth.js";

export const authRouter = Router();

const GoogleLoginRequest = z.object({
  idToken: z.string().min(10),
});

function getClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");
  return new OAuth2Client(clientId);
}

authRouter.post("/auth/google", async (req, res, next) => {
  const parsed = GoogleLoginRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const client = getClient();
    const ticket = await client.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      res.status(401).json({ error: "Invalid Google token" });
      return;
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, payload.sub))
      .get();

    let user;
    if (existing) {
      user = existing;
    } else {
      const id = uuidv4();
      await db.insert(users).values({
        id,
        googleSub: payload.sub,
        email: payload.email,
        name: payload.name ?? null,
        picture: payload.picture ?? null,
      });
      user = await db.select().from(users).where(eq(users.id, id)).get();
    }

    if (!user) {
      res.status(500).json({ error: "User upsert failed" });
      return;
    }

    const token = signSession({ uid: user.id, email: user.email });
    setSessionCookie(res, token);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/auth/me", optionalUser, async (req, res, next) => {
  if (!req.userId) {
    res.json({ user: null });
    return;
  }
  try {
    const user = await db.select().from(users).where(eq(users.id, req.userId)).get();
    if (!user) {
      clearSessionCookie(res);
      res.json({ user: null });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    next(err);
  }
});
