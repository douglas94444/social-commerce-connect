import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE = "tiktok_oauth_state";

export function createOAuthState(userId: string) {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}.${nonce}`;
  const secret = process.env.TIKTOK_OAUTH_STATE_SECRET ?? process.env.TIKTOK_APP_SECRET ?? "dev-state-secret";
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state: string): { userId: string } | null {
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [userId, nonce, sig] = parts;
  const payload = `${userId}.${nonce}`;
  const secret = process.env.TIKTOK_OAUTH_STATE_SECRET ?? process.env.TIKTOK_APP_SECRET ?? "dev-state-secret";
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return { userId };
}

export function oauthStateCookie(state: string, maxAgeSec = 600) {
  return `${COOKIE}=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function readOAuthStateCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE.length + 1));
}
