import { createHmac } from "node:crypto";

/** TikTok Shop Open API request signing (HMAC-SHA256). */
export function signTikTokRequest(opts: {
  appSecret: string;
  path: string;
  params: Record<string, string>;
  body?: string;
}): string {
  const excluded = new Set(["sign", "access_token"]);
  const keys = Object.keys(opts.params)
    .filter((k) => !excluded.has(k))
    .sort();
  const paramStr = keys.map((k) => `${k}${opts.params[k]}`).join("");
  const raw = `${opts.appSecret}${opts.path}${paramStr}${opts.body ?? ""}${opts.appSecret}`;
  return createHmac("sha256", opts.appSecret).update(raw).digest("hex");
}
