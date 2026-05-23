import { createFileRoute } from "@tanstack/react-router";
import { pollTikTokOrdersForAllBrands } from "@/lib/tiktok.server";

export const Route = createFileRoute("/api/jobs/poll-orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) return new Response("CRON_SECRET not configured", { status: 503 });
        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const result = await pollTikTokOrdersForAllBrands();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(e instanceof Error ? e.message : "Poll failed", { status: 500 });
        }
      },
    },
  },
});
