import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyTikTokWebhookSignature } from "@/lib/tiktok/webhook-sign";

export const Route = createFileRoute("/api/public/tiktok/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.TIKTOK_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 503 });

        const signature =
          request.headers.get("authorization") ??
          request.headers.get("x-tts-signature") ??
          request.headers.get("x-tiktok-signature") ??
          "";
        const raw = await request.text();

        if (!verifyTikTokWebhookSignature(raw, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const data = (payload.data ?? payload) as Record<string, unknown>;
        const shopId = String(payload.shop_id ?? data.shop_id ?? "");
        if (!shopId) return new Response("Missing shop_id", { status: 400 });

        const { data: brand } = await supabaseAdmin
          .from("brands")
          .select("id")
          .eq("tiktok_shop_id", shopId)
          .maybeSingle();
        if (!brand) return new Response("Shop not registered", { status: 404 });

        const eventType = String(payload.type ?? payload.event ?? "");
        const orderStatus = String(data.order_status ?? data.status ?? "");

        if (
          eventType.includes("ORDER") &&
          (orderStatus === "AWAITING_SHIPMENT" || orderStatus === "awaiting_shipment")
        ) {
          const o = data;
          await supabaseAdmin.from("orders").upsert(
            {
              brand_id: brand.id,
              tiktok_order_id: String(o.order_id),
              order_number: (o.order_number as string) ?? null,
              status: "awaiting_shipment",
              customer_name: (o.recipient as { name?: string })?.name ?? "Cliente TikTok",
              customer_email: (o.recipient as { email?: string })?.email ?? null,
              customer_phone: (o.recipient as { phone?: string })?.phone ?? null,
              shipping_address: (o.recipient as { address?: object })?.address ?? {},
              items: o.items ?? [],
              subtotal: Number(o.subtotal ?? 0),
              shipping_cost: Number(o.shipping_fee ?? 0),
              total: Number(o.total ?? 0),
              raw_payload: payload,
            },
            { onConflict: "brand_id,tiktok_order_id" },
          );

          await supabaseAdmin.from("sync_logs").insert({
            brand_id: brand.id,
            type: "tiktok_order_webhook",
            status: "success",
            message: `Pedido ${o.order_id} recebido`,
            payload,
          });
        }

        const cancelled =
          orderStatus === "CANCELLED" ||
          orderStatus === "cancelled" ||
          eventType.toLowerCase().includes("cancel");
        if (cancelled && data.order_id) {
          await supabaseAdmin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("brand_id", brand.id)
            .eq("tiktok_order_id", String(data.order_id));

          await supabaseAdmin.from("sync_logs").insert({
            brand_id: brand.id,
            type: "tiktok_order_webhook",
            status: "success",
            message: `Pedido ${data.order_id} cancelado no TikTok`,
            payload,
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
