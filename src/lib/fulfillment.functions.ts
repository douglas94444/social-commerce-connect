import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOnboardingProgress, isWarehouseComplete } from "@/lib/onboarding";
import { INBOX_STATUSES } from "@/lib/order-status";

const orderListSelect =
  "id, order_number, tiktok_order_id, status, customer_name, total, tracking_code, shipping_label_url, created_at" as const;

const orderFilterSchema = z
  .object({
    status: z.enum(["inbox", "awaiting_shipment", "label_generated", "shipped", "all"]).optional(),
    search: z.string().max(120).optional(),
    limit: z.number().int().min(1).max(200).optional(),
  })
  .optional();

// ---------- Brand / Warehouse ----------

export const getMyBrand = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, email, warehouse_address, tiktok_shop_id, tiktok_token_expires_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const warehouseSchema = z.object({
  name: z.string().min(1).max(120),
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(120).optional().default(""),
  district: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  state: z.string().length(2),
  postal_code: z.string().min(8).max(9),
  phone: z.string().max(20).optional().default(""),
});

export const updateWarehouse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => warehouseSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("brands")
      .update({ warehouse_address: data })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("brands")
      .select("tiktok_shop_id, warehouse_address")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return getOnboardingProgress(data);
  });

// ---------- Dashboard ----------

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase
      .from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return { ordersToday: 0, pending: 0, gmvWeek: 0, lowStock: 0 };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [ordersToday, pending, weekOrders, lowStock] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true })
        .eq("brand_id", brand.id).gte("created_at", today.toISOString()),
      supabase.from("orders").select("id", { count: "exact", head: true })
        .eq("brand_id", brand.id).in("status", ["pending", "awaiting_shipment", "label_generated"]),
      supabase.from("orders").select("total")
        .eq("brand_id", brand.id).gte("created_at", weekAgo.toISOString()),
      supabase.from("products").select("id", { count: "exact", head: true })
        .eq("brand_id", brand.id).lt("stock", 5),
    ]);
    const gmvWeek = (weekOrders.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
    return {
      ordersToday: ordersToday.count ?? 0,
      pending: pending.count ?? 0,
      gmvWeek,
      lowStock: lowStock.count ?? 0,
    };
  });

export const listUrgentOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase.from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return [];
    const { data, error } = await supabase
      .from("orders")
      .select(orderListSelect)
      .eq("brand_id", brand.id)
      .in("status", [...INBOX_STATUSES])
      .order("created_at", { ascending: true })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getIntegrationHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase.from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return { lastWebhook: null, lastSync: null };
    const [webhook, sync] = await Promise.all([
      supabase
        .from("sync_logs")
        .select("created_at, status, message")
        .eq("brand_id", brand.id)
        .eq("type", "tiktok_order_webhook")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("sync_logs")
        .select("created_at, status, message, type")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      lastWebhook: webhook.data,
      lastSync: sync.data,
    };
  });

// ---------- Products ----------

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase
      .from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return [];
    const { data, error } = await supabase
      .from("products").select("*").eq("brand_id", brand.id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1).max(80),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().default(""),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  weight_grams: z.number().int().min(0),
  length_cm: z.number().min(0),
  width_cm: z.number().min(0),
  height_cm: z.number().min(0),
  image_url: z.string().url().optional().or(z.literal("")).default(""),
  active: z.boolean().default(true),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => productSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase
      .from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) throw new Error("Marca não encontrada");
    const payload = { ...data, brand_id: brand.id, image_url: data.image_url || null };
    if (data.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), stock: z.number().int().min(0) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").update({ stock: data.stock }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Orders ----------

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => orderFilterSchema.parse(d ?? {}))
  .handler(async ({ data: filters, context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase.from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return [];
    let q = supabase
      .from("orders")
      .select(orderListSelect)
      .eq("brand_id", brand.id);

    const status = filters?.status ?? "all";
    if (status === "inbox") {
      q = q.in("status", [...INBOX_STATUSES]);
    } else if (status !== "all") {
      q = q.eq("status", status);
    }

    const fifo = status === "inbox" || status === "awaiting_shipment";
    const { data, error } = await q
      .order("created_at", { ascending: fifo })
      .limit(filters?.limit ?? 200);
    if (error) throw new Error(error.message);

    const search = filters?.search?.trim().toLowerCase();
    if (!search) return data ?? [];

    return (data ?? []).filter((o) => {
      const hay = [
        o.order_number,
        o.tiktok_order_id,
        o.customer_name,
        o.tracking_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(search);
    });
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getOrderTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: order } = await context.supabase
      .from("orders")
      .select("brand_id, created_at, status, shipped_at")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) return [];

    const { data: logs, error } = await context.supabase
      .from("sync_logs")
      .select("id, type, status, message, created_at")
      .eq("order_id", data.orderId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const events: Array<{ id: string; label: string; at: string; detail?: string }> = [
      {
        id: "created",
        label: "Pedido recebido",
        at: order.created_at,
      },
    ];
    for (const log of logs ?? []) {
      events.push({
        id: log.id,
        label: log.message ?? log.type,
        at: log.created_at,
        detail: log.status,
      });
    }
    if (order.shipped_at) {
      events.push({
        id: "shipped",
        label: "Marcado como enviado",
        at: order.shipped_at,
      });
    }
    return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  });

export const createTestOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase.from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) throw new Error("Marca não encontrada");

    const testId = `TEST-${Date.now()}`;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        brand_id: brand.id,
        tiktok_order_id: testId,
        order_number: testId,
        status: "awaiting_shipment",
        customer_name: "Cliente de teste",
        customer_email: "teste@fulfillly.app",
        shipping_address: {
          street: "Rua Exemplo",
          number: "100",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          postal_code: "01310100",
        },
        items: [{ sku: "DEMO-001", title: "Produto de demonstração", qty: 1, price: 99.9 }],
        subtotal: 99.9,
        shipping_cost: 15,
        total: 114.9,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("sync_logs").insert({
      brand_id: brand.id,
      order_id: order.id,
      type: "tiktok_order_webhook",
      status: "success",
      message: "Pedido de teste criado manualmente",
    });

    return { id: order.id };
  });

const shipSchema = z.object({
  id: z.string().uuid(),
  carrier: z.string().min(1).max(80),
  tracking_code: z.string().min(3).max(80),
});

export const markOrderShipped = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => shipSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("orders").update({
      status: "shipped",
      carrier: data.carrier,
      tracking_code: data.tracking_code,
      shipped_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);

    const { data: order } = await context.supabase
      .from("orders")
      .select("brand_id")
      .eq("id", data.id)
      .maybeSingle();

    await context.supabase.from("sync_logs").insert({
      brand_id: order?.brand_id ?? null,
      order_id: data.id,
      type: "tiktok_rts",
      status: "pending",
      message: `Enviado localmente via ${data.carrier} — rastreio ${data.tracking_code}. Sincronização com TikTok pendente.`,
    });
    return { ok: true, tiktokSynced: false };
  });

// ---------- Label (Melhor Envio placeholder) ----------

export const generateLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: brand } = await context.supabase
      .from("brands")
      .select("warehouse_address")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!isWarehouseComplete(brand?.warehouse_address)) {
      throw new Error("Configure o endereço do armazém em Configurações antes de gerar etiquetas.");
    }

    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) {
      throw new Error(
        "Integração com Melhor Envio ainda não configurada. Adicione MELHOR_ENVIO_TOKEN nas configurações.",
      );
    }
    // Stub: produção real exigiria cotar + comprar + imprimir via API Melhor Envio.
    const { data: order } = await context.supabase
      .from("orders")
      .select("brand_id")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase.from("orders").update({
      status: "label_generated",
      shipping_label_url: `https://melhorenvio.example/label/${data.id}.pdf`,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);

    await context.supabase.from("sync_logs").insert({
      brand_id: order?.brand_id ?? null,
      order_id: data.id,
      type: "melhor_envio_label",
      status: "success",
      message: "Etiqueta gerada (sandbox)",
    });
    return { ok: true };
  });
