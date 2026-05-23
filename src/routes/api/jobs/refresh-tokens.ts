import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { refreshAccessToken, tokenExpiresAt } from "@/lib/tiktok/client";

export const Route = createFileRoute("/api/jobs/refresh-tokens")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) return new Response("CRON_SECRET not configured", { status: 503 });
        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { data: brands, error } = await supabaseAdmin
          .from("brands")
          .select("id, tiktok_refresh_token, tiktok_token_expires_at")
          .not("tiktok_refresh_token", "is", null)
          .or(`tiktok_token_expires_at.is.null,tiktok_token_expires_at.lt.${soon}`);

        if (error) {
          return new Response(error.message, { status: 500 });
        }

        let refreshed = 0;
        const errors: string[] = [];

        for (const brand of brands ?? []) {
          if (!brand.tiktok_refresh_token) continue;
          try {
            const tokens = await refreshAccessToken(brand.tiktok_refresh_token);
            await supabaseAdmin
              .from("brands")
              .update({
                tiktok_access_token: tokens.access_token,
                tiktok_refresh_token: tokens.refresh_token,
                tiktok_token_expires_at: tokenExpiresAt(tokens.access_token_expire_in),
              })
              .eq("id", brand.id);
            refreshed++;
          } catch (e) {
            errors.push(`${brand.id}: ${e instanceof Error ? e.message : "erro"}`);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, refreshed, errors }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
