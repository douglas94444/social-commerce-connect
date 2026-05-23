import { assertTikTokConfig, getTikTokConfig } from "./config";
import { signTikTokRequest } from "./sign";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  access_token_expire_in: number;
  refresh_token_expire_in?: number;
  open_id?: string;
};

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data?: T;
  request_id?: string;
};

export type TikTokShop = {
  id: string;
  cipher: string;
  name?: string;
  region?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Resposta inválida do TikTok: ${text.slice(0, 200)}`);
  }
}

export function buildAuthorizeUrl(state: string, redirectUri: string) {
  const { serviceId, authorizeBase } = getTikTokConfig();
  if (!serviceId) throw new Error("TIKTOK_SERVICE_ID não configurado");
  const url = new URL(authorizeBase);
  url.searchParams.set("service_id", serviceId);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeAuthCode(
  authCode: string,
  redirectUri?: string,
): Promise<TokenResponse> {
  const { appKey, appSecret, authBase } = assertTikTokConfigured();
  const url = `${authBase}/api/v2/token/get`;
  const body: Record<string, string> = {
    app_key: appKey,
    app_secret: appSecret,
    auth_code: authCode,
    grant_type: "authorized_code",
  };
  if (redirectUri) body.redirect_uri = redirectUri;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiEnvelope<TokenResponse>>(res);
  if (json.code !== 0 || !json.data) {
    throw new Error(json.message || "Falha ao obter token TikTok");
  }
  return json.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const { appKey, appSecret, authBase } = assertTikTokConfigured();
  const url = `${authBase}/api/v2/token/get`;
  const body = {
    app_key: appKey,
    app_secret: appSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parseJson<ApiEnvelope<TokenResponse>>(res);
  if (json.code !== 0 || !json.data) {
    throw new Error(json.message || "Falha ao renovar token TikTok");
  }
  return json.data;
}

export async function tiktokApiGet<T>(opts: {
  path: string;
  accessToken: string;
  shopCipher: string;
  extraParams?: Record<string, string>;
}): Promise<T> {
  const { appKey, appSecret, apiBase } = assertTikTokConfigured();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = {
    app_key: appKey,
    timestamp,
    shop_cipher: opts.shopCipher,
    ...opts.extraParams,
  };
  const sign = signTikTokRequest({ appSecret, path: opts.path, params });
  const qs = new URLSearchParams({ ...params, sign });
  const url = `${apiBase}${opts.path}?${qs}`;
  const res = await fetch(url, {
    headers: { "x-tts-access-token": opts.accessToken },
  });
  const json = await parseJson<ApiEnvelope<T>>(res);
  if (json.code !== 0) {
    throw new Error(json.message || `Erro TikTok API (${json.code})`);
  }
  return json.data as T;
}

export async function tiktokApiPost<T>(opts: {
  path: string;
  accessToken: string;
  shopCipher: string;
  body: Record<string, unknown>;
}): Promise<T> {
  const { appKey, appSecret, apiBase } = assertTikTokConfigured();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const bodyStr = JSON.stringify(opts.body);
  const params: Record<string, string> = {
    app_key: appKey,
    timestamp,
    shop_cipher: opts.shopCipher,
  };
  const sign = signTikTokRequest({ appSecret, path: opts.path, params, body: bodyStr });
  const qs = new URLSearchParams({ ...params, sign });
  const url = `${apiBase}${opts.path}?${qs}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-token": opts.accessToken,
    },
    body: bodyStr,
  });
  const json = await parseJson<ApiEnvelope<T>>(res);
  if (json.code !== 0) {
    throw new Error(json.message || `Erro TikTok API (${json.code})`);
  }
  return json.data as T;
}

export async function getAuthorizedShops(accessToken: string): Promise<TikTokShop[]> {
  const { appKey, appSecret, apiBase } = assertTikTokConfigured();
  const path = "/authorization/202309/shops";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = { app_key: appKey, timestamp };
  const sign = signTikTokRequest({ appSecret, path, params });
  const qs = new URLSearchParams({ ...params, sign });
  const url = `${apiBase}${path}?${qs}`;
  const res = await fetch(url, { headers: { "x-tts-access-token": accessToken } });
  const json = await parseJson<
    ApiEnvelope<{ shops?: Array<{ id: string; cipher: string; name?: string; region?: string }> }>
  >(res);
  if (json.code !== 0) {
    throw new Error(json.message || "Falha ao listar lojas autorizadas");
  }
  const list = json.data?.shops ?? [];
  return list.map((s) => ({
    id: String(s.id),
    cipher: s.cipher,
    name: s.name,
    region: s.region,
  }));
}

export async function getProductDetail(opts: {
  accessToken: string;
  shopCipher: string;
  productId: string;
}) {
  return tiktokApiGet<{
    id: string;
    skus?: Array<{ id: string; seller_sku?: string }>;
  }>({
    path: `/product/202309/products/${opts.productId}`,
    accessToken: opts.accessToken,
    shopCipher: opts.shopCipher,
  });
}

export async function updateProductInventory(opts: {
  accessToken: string;
  shopCipher: string;
  productId: string;
  skuId: string;
  quantity: number;
}) {
  return tiktokApiPost({
    path: "/product/202309/products/stocks",
    accessToken: opts.accessToken,
    shopCipher: opts.shopCipher,
    body: {
      product_id: opts.productId,
      skus: [
        {
          id: opts.skuId,
          inventory: [{ quantity: opts.quantity }],
        },
      ],
    },
  });
}

export async function searchAwaitingShipmentOrders(opts: {
  accessToken: string;
  shopCipher: string;
  pageSize?: number;
}) {
  return tiktokApiPost<{
    orders?: Array<Record<string, unknown>>;
    next_page_token?: string;
  }>({
    path: "/order/202309/orders/search",
    accessToken: opts.accessToken,
    shopCipher: opts.shopCipher,
    body: {
      order_status: "AWAITING_SHIPMENT",
      page_size: opts.pageSize ?? 50,
    },
  });
}

export async function searchProducts(opts: {
  accessToken: string;
  shopCipher: string;
  pageSize?: number;
}) {
  return tiktokApiPost<{
    products?: Array<{
      id: string;
      title?: string;
      skus?: Array<{
        id: string;
        seller_sku?: string;
        price?: { sale_price?: string };
        inventory?: Array<{ quantity?: number }>;
      }>;
    }>;
    next_page_token?: string;
  }>({
    path: "/product/202309/products/search",
    accessToken: opts.accessToken,
    shopCipher: opts.shopCipher,
    body: { page_size: opts.pageSize ?? 50 },
  });
}

/** Mark package shipped (RTS) — path may vary by API version; adjust if Partner docs differ. */
export async function shipPackage(opts: {
  accessToken: string;
  shopCipher: string;
  packageId: string;
  trackingNumber: string;
  shippingProviderId: string;
}) {
  return tiktokApiPost({
    path: `/fulfillment/202309/packages/${opts.packageId}/ship`,
    accessToken: opts.accessToken,
    shopCipher: opts.shopCipher,
    body: {
      tracking_number: opts.trackingNumber,
      shipping_provider_id: opts.shippingProviderId,
    },
  });
}

export function tokenExpiresAt(expireIn: number) {
  const ms =
    expireIn > 1_000_000_000_000
      ? expireIn
      : expireIn > 1_000_000_000
        ? expireIn * 1000
        : Date.now() + expireIn * 1000;
  return new Date(ms).toISOString();
}
