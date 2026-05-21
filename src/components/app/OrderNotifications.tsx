import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyBrand } from "@/lib/fulfillment.functions";

export function OrderNotifications() {
  const qc = useQueryClient();
  const fetchBrand = useServerFn(getMyBrand);
  const brandIdRef = useRef<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const brand = await fetchBrand();
      if (!brand?.id) return;
      brandIdRef.current = brand.id;

      channel = supabase
        .channel(`orders-${brand.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `brand_id=eq.${brand.id}`,
          },
          (payload) => {
            const row = payload.new as { id?: string; order_number?: string; tiktok_order_id?: string };
            const label = row.order_number ?? row.tiktok_order_id ?? "Novo pedido";
            toast.success(`Novo pedido: ${label}`, {
              description: "Abra a fila para processar.",
              action: row.id
                ? {
                    label: "Ver",
                    onClick: () => {
                      window.location.href = `/app/orders/${row.id}`;
                    },
                  }
                : undefined,
            });
            qc.invalidateQueries({ queryKey: ["orders"] });
            qc.invalidateQueries({ queryKey: ["urgent-orders"] });
            qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
          },
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchBrand, qc]);

  return null;
}
