import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getAppOrigin } from "@/lib/tiktok/config";

export const getTikTokConnectUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertTikTokConfigured, buildAuthorizeUrl } = await import("@/lib/tiktok/client");
    assertTikTokConfigured();
    const request = getRequest();
    const origin = getAppOrigin(request);
    const { createOAuthState } = await import("@/lib/tiktok/oauth-state");
    const state = createOAuthState(context.userId);
    const url = buildAuthorizeUrl(state, `${origin}/api/public/tiktok/oauth/callback`);
    return { url, state };
  });

export const importTikTokProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { searchProducts } = await import("@/lib/tiktok/client");
    const { supabase, userId } = context;
    const { data: brand, error: brandErr } = await supabase
      .from("brands")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (brandErr || !brand) throw new Error("Marca não encontrada");
    if (!brand.tiktok_access_token) throw new Error("Conecte o TikTok Shop primeiro.");

    const { ensureFreshAccessToken } = await import("@/lib/tiktok/brand-tokens");
    const { accessToken, shopCipher } = await ensureFreshAccessToken(supabase, brand);
    const result = await searchProducts({ accessToken, shopCipher, pageSize: 50 });
    const products = result?.products ?? [];
    let imported = 0;

    for (const p of products) {
      const sku = p.skus?.[0];
      if (!sku?.seller_sku) continue;
      const stock = sku.inventory?.[0]?.quantity ?? 0;
      const price = Number(sku.price?.sale_price ?? 0);
      const { error } = await supabase.from("products").upsert(
        {
          brand_id: brand.id,
          tiktok_product_id: String(p.id),
          sku: sku.seller_sku,
          title: p.title ?? sku.seller_sku,
          price,
          stock,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "brand_id,sku" },
      );
      if (!error) imported++;
    }

    await supabase.from("sync_logs").insert({
      brand_id: brand.id,
      type: "tiktok_product_sync",
      status: "success",
      message: `${imported} produto(s) importados do TikTok`,
    });

    return { imported, total: products.length };
  });

export const syncTikTokStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ productId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { syncProductStockToTikTok } = await import("@/lib/tiktok.server");
    return syncProductStockToTikTok({
      supabase: context.supabase,
      userId: context.userId,
      productId: data.productId,
    });
  });

export const disconnectTikTokShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("brands")
      .update({
        tiktok_shop_id: null,
        tiktok_shop_cipher: null,
        tiktok_access_token: null,
        tiktok_refresh_token: null,
        tiktok_token_expires_at: null,
      })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
