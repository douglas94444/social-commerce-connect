import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isWarehouseComplete, type WarehouseAddress } from "@/lib/onboarding";
import { calculateMelhorEnvioQuotes, purchaseMelhorEnvioLabel } from "@/lib/shipping/melhor-envio";

export const calculateShipping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: order, error: orderErr } = await context.supabase
      .from("orders")
      .select("*, brands!inner(warehouse_address, user_id)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (orderErr || !order) throw new Error("Pedido não encontrado");

    const brand = order.brands as { warehouse_address: unknown; user_id: string };
    if (brand.user_id !== context.userId) throw new Error("Pedido não encontrado");
    if (!isWarehouseComplete(brand.warehouse_address)) {
      throw new Error("Configure o endereço do armazém antes de cotar frete.");
    }

    const addr = order.shipping_address as Record<string, string>;
    const items = (order.items as Array<{ weight?: number }>) ?? [];
    const weightKg = Math.max(0.3, (items[0] as { weight?: number })?.weight ? Number(items[0].weight) / 1000 : 0.5);

    const quotes = await calculateMelhorEnvioQuotes({
      from: brand.warehouse_address as WarehouseAddress,
      to: addr,
      weightKg,
      heightCm: 10,
      widthCm: 15,
      lengthCm: 20,
      insuranceValue: Number(order.total ?? 0),
    });

    return quotes.map((q) => ({
      id: q.id,
      name: q.company?.name ?? q.name,
      price: q.price,
      deliveryDays: q.delivery_time,
    }));
  });

export const generateLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ orderId: z.string().uuid(), serviceId: z.number().int() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: order, error: orderErr } = await context.supabase
      .from("orders")
      .select("*, brands!inner(warehouse_address, user_id, id)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (orderErr || !order) throw new Error("Pedido não encontrado");

    const brand = order.brands as { warehouse_address: unknown; user_id: string; id: string };
    if (brand.user_id !== context.userId) throw new Error("Pedido não encontrado");
    if (!isWarehouseComplete(brand.warehouse_address)) {
      throw new Error("Configure o endereço do armazém antes de gerar etiquetas.");
    }

    const addr = order.shipping_address as Record<string, string>;
    const weightKg = 0.5;

    const { labelUrl, orderId: meOrderId } = await purchaseMelhorEnvioLabel({
      serviceId: data.serviceId,
      from: brand.warehouse_address as WarehouseAddress,
      to: addr,
      customerName: order.customer_name,
      customerPhone: order.customer_phone ?? undefined,
      weightKg,
      heightCm: 10,
      widthCm: 15,
      lengthCm: 20,
      insuranceValue: Number(order.total ?? 0),
    });

    const { error } = await context.supabase
      .from("orders")
      .update({
        status: "label_generated",
        shipping_label_url: labelUrl,
        melhor_envio_order_id: meOrderId,
      })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);

    await context.supabase.from("sync_logs").insert({
      brand_id: brand.id,
      order_id: data.orderId,
      type: "melhor_envio_label",
      status: "success",
      message: "Etiqueta Melhor Envio gerada",
    });

    return { ok: true, labelUrl };
  });
