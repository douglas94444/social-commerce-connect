import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// TikTok Shop Partner webhook receiver.
// Verifies HMAC SHA-256 signature (sha256 = HMAC(SECRET, raw_body)).
// On ORDER_STATUS_CHANGE with status AWAITING_SHIPMENT, upserts an order row.
export const Route = createFileRoute("/api/public/tiktok/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.TIKTOK_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 503 });

        const signature = request.headers.get("authorization") ?? request.headers.get("x-tts-signature") ?? "";
        const raw = await request.text();
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        try {
          if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return new Response("Invalid signature", { status: 401 });
          }
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try { payload = JSON.parse(raw); } catch { return new Response("Invalid JSON", { status: 400 }); }

        const shopId = payload?.shop_id ?? payload?.data?.shop_id;
        const { data: brand } = await supabaseAdmin
          .from("brands").select("id").eq("tiktok_shop_id", String(shopId)).maybeSingle();
        if (!brand) return new Response("Shop not registered", { status: 404 });

        if (payload?.type === "ORDER_STATUS_CHANGE" && payload?.data?.order_status === "AWAITING_SHIPMENT") {
          const o = payload.data;
          await supabaseAdmin.from("orders").upsert({
            brand_id: brand.id,
            tiktok_order_id: String(o.order_id),
            order_number: o.order_number ?? null,
            status: "awaiting_shipment",
            customer_name: o.recipient?.name ?? "Cliente TikTok",
            customer_email: o.recipient?.email ?? null,
            customer_phone: o.recipient?.phone ?? null,
            shipping_address: o.recipient?.address ?? {},
            items: o.items ?? [],
            subtotal: Number(o.subtotal ?? 0),
            shipping_cost: Number(o.shipping_fee ?? 0),
            total: Number(o.total ?? 0),
            raw_payload: payload,
          }, { onConflict: "brand_id,tiktok_order_id" });

          await supabaseAdmin.from("sync_logs").insert({
            brand_id: brand.id, type: "tiktok_order_webhook", status: "success",
            message: `Pedido ${o.order_id} recebido`, payload,
          });
        }

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
