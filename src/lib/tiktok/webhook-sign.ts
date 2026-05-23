import { createHmac, timingSafeEqual } from "crypto";
import { getTikTokConfig } from "./config";

function safeEqual(a: string, b: string) {
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** Verifies TikTok Shop webhook signature (multiple known formats). */
export function verifyTikTokWebhookSignature(rawBody: string, headerValue: string): boolean {
  const secret = process.env.TIKTOK_WEBHOOK_SECRET;
  if (!secret || !headerValue) return false;

  let sig = headerValue.trim();
  if (sig.toLowerCase().startsWith("sha256=")) sig = sig.slice(7);

  const { appKey } = getTikTokConfig();
  const candidates = [
    createHmac("sha256", secret).update(rawBody).digest("hex"),
    appKey ? createHmac("sha256", secret).update(appKey + rawBody).digest("hex") : null,
  ].filter(Boolean) as string[];

  return candidates.some((expected) => safeEqual(sig, expected));
}
