import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  exchangeAuthCode,
  getAuthorizedShops,
  getProductDetail,
  searchAwaitingShipmentOrders,
  shipPackage,
  tokenExpiresAt,
  updateProductInventory,
} from "@/lib/tiktok/client";
import { ensureFreshAccessToken } from "@/lib/tiktok/brand-tokens";

export async function completeTikTokOAuth(
  userId: string,
  authCode: string,
  redirectUri?: string,
) {
  const tokens = await exchangeAuthCode(authCode, redirectUri);
  const shops = await getAuthorizedShops(tokens.access_token);
  if (!shops.length) throw new Error("Nenhuma loja autorizada retornada pelo TikTok.");
  const shop = shops[0];

  const { data: brandRow, error: fetchErr } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchErr || !brandRow) throw new Error("Marca não encontrada para este usuário.");

  const { error } = await supabaseAdmin
    .from("brands")
    .update({
      tiktok_shop_id: shop.id,
      tiktok_shop_cipher: shop.cipher,
      tiktok_access_token: tokens.access_token,
      tiktok_refresh_token: tokens.refresh_token,
      tiktok_token_expires_at: tokenExpiresAt(tokens.access_token_expire_in),
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  await supabaseAdmin.from("sync_logs").insert({
    brand_id: brandRow.id,
    type: "tiktok_oauth",
    status: "success",
    message: `Loja TikTok conectada: ${shop.name ?? shop.id}`,
  });

  return { shopId: shop.id };
}

export async function confirmTikTokShipment(opts: {
  brandId: string;
  tiktokOrderId: string;
  trackingNumber: string;
  carrier: string;
}) {
  const { data: brand, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .eq("id", opts.brandId)
    .maybeSingle();
  if (error || !brand) throw new Error("Marca não encontrada");

  const { accessToken, shopCipher } = await ensureFreshAccessToken(supabaseAdmin, brand);
  const providerId = mapCarrierToTikTokProvider(opts.carrier);

  await shipPackage({
    accessToken,
    shopCipher,
    packageId: opts.tiktokOrderId,
    trackingNumber: opts.trackingNumber,
    shippingProviderId: providerId,
  });
}

function mapCarrierToTikTokProvider(carrier: string): string {
  const key = carrier.toLowerCase();
  const map: Record<string, string> = {
    correios: process.env.TIKTOK_PROVIDER_CORREIOS ?? "Correios",
    jadlog: process.env.TIKTOK_PROVIDER_JADLOG ?? "Jadlog",
    loggi: process.env.TIKTOK_PROVIDER_LOGGI ?? "Loggi",
  };
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return carrier;
}

export async function syncProductStockToTikTok(opts: {
  supabase: SupabaseClient<Database>;
  userId: string;
  productId: string;
}) {
  const { data: product, error: prodErr } = await opts.supabase
    .from("products")
    .select("*, brands!inner(user_id, tiktok_access_token, tiktok_shop_cipher)")
    .eq("id", opts.productId)
    .maybeSingle();
  if (prodErr || !product) throw new Error("Produto não encontrado");

  const brand = product.brands as {
    user_id: string;
    tiktok_access_token: string | null;
    tiktok_shop_cipher: string | null;
  };
  if (brand.user_id !== opts.userId) throw new Error("Produto não encontrado");
  if (!product.tiktok_product_id) {
    throw new Error("Produto sem vínculo TikTok — importe do catálogo ou vincule manualmente.");
  }
  if (!brand.tiktok_access_token) throw new Error("Conecte o TikTok Shop em Integrações.");

  const { data: brandRow } = await opts.supabase
    .from("brands")
    .select("*")
    .eq("user_id", opts.userId)
    .single();
  if (!brandRow) throw new Error("Marca não encontrada");

  const { accessToken, shopCipher } = await ensureFreshAccessToken(opts.supabase, brandRow);
  const detail = await getProductDetail({
    accessToken,
    shopCipher,
    productId: product.tiktok_product_id,
  });
  const sku =
    detail?.skus?.find((s) => s.seller_sku === product.sku) ?? detail?.skus?.[0];
  if (!sku?.id) throw new Error("SKU TikTok não encontrado para este produto.");

  await updateProductInventory({
    accessToken,
    shopCipher,
    productId: product.tiktok_product_id,
    skuId: sku.id,
    quantity: product.stock,
  });

  await opts.supabase
    .from("products")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", product.id);

  await opts.supabase.from("sync_logs").insert({
    brand_id: product.brand_id,
    type: "tiktok_stock_sync",
    status: "success",
    message: `Estoque sincronizado: ${product.sku} → ${product.stock}`,
  });

  return { ok: true };
}

function mapTikTokOrderRow(brandId: string, o: Record<string, unknown>) {
  const recipient = (o.recipient ?? o.recipient_address) as Record<string, unknown> | undefined;
  return {
    brand_id: brandId,
    tiktok_order_id: String(o.order_id ?? o.id),
    order_number: (o.order_number as string) ?? null,
    status: "awaiting_shipment" as const,
    customer_name: String(recipient?.name ?? o.buyer_name ?? "Cliente TikTok"),
    customer_email: (recipient?.email as string) ?? null,
    customer_phone: (recipient?.phone as string) ?? null,
    shipping_address: recipient?.address ?? recipient ?? {},
    items: o.items ?? o.line_items ?? [],
    subtotal: Number(o.subtotal ?? o.payment?.sub_total ?? 0),
    shipping_cost: Number(o.shipping_fee ?? o.payment?.shipping_fee ?? 0),
    total: Number(o.total ?? o.payment?.total_amount ?? 0),
    raw_payload: o,
  };
}

export async function pollTikTokOrdersForAllBrands() {
  const { data: brands, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .not("tiktok_access_token", "is", null)
    .not("tiktok_shop_cipher", "is", null);
  if (error) throw new Error(error.message);

  let upserted = 0;
  const errors: string[] = [];

  for (const brand of brands ?? []) {
    try {
      const { accessToken, shopCipher } = await ensureFreshAccessToken(supabaseAdmin, brand);
      const result = await searchAwaitingShipmentOrders({ accessToken, shopCipher });
      const orders = result?.orders ?? [];
      for (const raw of orders) {
        const row = mapTikTokOrderRow(brand.id, raw);
        const { error: upErr } = await supabaseAdmin
          .from("orders")
          .upsert(row, { onConflict: "brand_id,tiktok_order_id" });
        if (!upErr) upserted++;
      }
      if (orders.length > 0) {
        await supabaseAdmin.from("sync_logs").insert({
          brand_id: brand.id,
          type: "tiktok_order_webhook",
          status: "success",
          message: `Polling: ${orders.length} pedido(s) aguardando envio`,
        });
      }
    } catch (e) {
      errors.push(`${brand.id}: ${e instanceof Error ? e.message : "erro"}`);
    }
  }

  return { upserted, brands: brands?.length ?? 0, errors };
}
