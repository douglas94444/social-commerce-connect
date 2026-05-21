import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

// ---------- Orders ----------

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: brand } = await supabase
      .from("brands").select("id").eq("user_id", userId).maybeSingle();
    if (!brand) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, tiktok_order_id, status, customer_name, total, tracking_code, created_at")
      .eq("brand_id", brand.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
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

    // Best-effort log
    await context.supabase.from("sync_logs").insert({
      order_id: data.id,
      type: "tiktok_rts",
      status: "pending",
      message: `Marcado como enviado via ${data.carrier} — código ${data.tracking_code}`,
    });
    return { ok: true };
  });

// ---------- Label (Melhor Envio placeholder) ----------

export const generateLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) {
      throw new Error(
        "Integração com Melhor Envio ainda não configurada. Adicione MELHOR_ENVIO_TOKEN nas configurações.",
      );
    }
    // Stub: produção real exigiria cotar + comprar + imprimir via API Melhor Envio.
    const { error } = await context.supabase.from("orders").update({
      status: "label_generated",
      shipping_label_url: `https://melhorenvio.example/label/${data.id}.pdf`,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
