import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type SessionPayload = { uid: string; email: string };

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userEmail?: string;
  }
}

const COOKIE_NAME = "sid";

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function setSessionCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  });
}

function readSession(req: Request): SessionPayload | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || typeof token !== "string") return null;
  try {
    const decoded = jwt.verify(token, getSecret()) as SessionPayload;
    if (!decoded?.uid) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = session.uid;
  req.userEmail = session.email;
  next();
}

export function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const session = readSession(req);
  if (session) {
    req.userId = session.uid;
    req.userEmail = session.email;
  }
  next();
}
