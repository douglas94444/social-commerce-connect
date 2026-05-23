export function getTikTokConfig() {
  const appKey = process.env.TIKTOK_APP_KEY;
  const appSecret = process.env.TIKTOK_APP_SECRET;
  const serviceId = process.env.TIKTOK_SERVICE_ID;
  const apiBase = process.env.TIKTOK_API_BASE ?? "https://open-api.tiktokglobalshop.com";
  const authBase = process.env.TIKTOK_AUTH_BASE ?? "https://auth.tiktok-shops.com";
  const authorizeBase =
    process.env.TIKTOK_AUTHORIZE_BASE ?? "https://services.tiktokshop.com/open/authorize";

  return { appKey, appSecret, serviceId, apiBase, authBase, authorizeBase };
}

export function assertTikTokConfigured() {
  const c = getTikTokConfig();
  if (!c.appKey || !c.appSecret || !c.serviceId) {
    throw new Error(
      "TikTok Shop não configurado. Defina TIKTOK_APP_KEY, TIKTOK_APP_SECRET e TIKTOK_SERVICE_ID no ambiente.",
    );
  }
  return c as Required<Pick<typeof c, "appKey" | "appSecret" | "serviceId">> & typeof c;
}

export function getAppOrigin(request?: Request) {
  if (request) {
    const url = new URL(request.url);
    return url.origin;
  }
  return process.env.APP_ORIGIN ?? process.env.VITE_APP_URL ?? "http://localhost:3000";
}
