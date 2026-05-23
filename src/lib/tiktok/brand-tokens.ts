import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { refreshAccessToken } from "./client";
import { tokenExpiresAt } from "./client";

type BrandRow = Database["public"]["Tables"]["brands"]["Row"];

export async function getBrandWithTokens(
  supabase: SupabaseClient<Database>,
  brandId: string,
): Promise<BrandRow | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Returns access token, refreshing if expired within 5 minutes. */
export async function ensureFreshAccessToken(
  supabase: SupabaseClient<Database>,
  brand: BrandRow,
): Promise<{ accessToken: string; shopCipher: string; brand: BrandRow }> {
  if (!brand.tiktok_access_token || !brand.tiktok_shop_cipher) {
    throw new Error("TikTok Shop não conectado para esta marca.");
  }

  const expires = brand.tiktok_token_expires_at
    ? new Date(brand.tiktok_token_expires_at).getTime()
    : 0;
  const needsRefresh = expires - Date.now() < 5 * 60 * 1000;

  if (!needsRefresh || !brand.tiktok_refresh_token) {
    return {
      accessToken: brand.tiktok_access_token,
      shopCipher: brand.tiktok_shop_cipher,
      brand,
    };
  }

  const tokens = await refreshAccessToken(brand.tiktok_refresh_token);
  const { data: updated, error } = await supabase
    .from("brands")
    .update({
      tiktok_access_token: tokens.access_token,
      tiktok_refresh_token: tokens.refresh_token,
      tiktok_token_expires_at: tokenExpiresAt(tokens.access_token_expire_in),
    })
    .eq("id", brand.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  return {
    accessToken: tokens.access_token,
    shopCipher: updated.tiktok_shop_cipher!,
    brand: updated,
  };
}
