import { createFileRoute } from "@tanstack/react-router";
import { completeTikTokOAuth } from "@/lib/tiktok.server";
import { verifyOAuthState } from "@/lib/tiktok/oauth-state";
import { getAppOrigin } from "@/lib/tiktok/config";

export const Route = createFileRoute("/api/public/tiktok/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const origin = getAppOrigin(request);
        const fail = (msg: string) =>
          Response.redirect(`${origin}/app/setup?tiktok=error&message=${encodeURIComponent(msg)}`, 302);

        if (!code || !state) return fail("Parâmetros OAuth ausentes.");
        const parsed = verifyOAuthState(state);
        if (!parsed) return fail("State OAuth inválido ou expirado.");

        const redirectUri = `${origin}/api/public/tiktok/oauth/callback`;
        try {
          await completeTikTokOAuth(parsed.userId, code, redirectUri);
          return Response.redirect(`${origin}/app/setup?tiktok=connected`, 302);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Falha na conexão TikTok";
          return fail(message);
        }
      },
    },
  },
});
