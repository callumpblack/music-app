import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

const COOKIE_NAME = "music_app_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(
  user: Omit<SessionUser, "exp">
): string {
  const session: SessionUser = {
    ...user,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as SessionUser;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// OAuth state is HMAC-signed rather than stored in a cookie, so it survives
// the localhost -> 127.0.0.1 host switch during the Spotify redirect.
const STATE_TTL_MS = 10 * 60 * 1000;

export function createOAuthState(): string {
  const timestamp = Date.now().toString();
  return `${timestamp}.${sign(timestamp)}`;
}

export function verifyOAuthState(state: string): boolean {
  const dot = state.indexOf(".");
  if (dot < 0) return false;
  const timestamp = state.slice(0, dot);
  const signature = state.slice(dot + 1);
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(timestamp));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Date.now() - parseInt(timestamp, 10) < STATE_TTL_MS;
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
