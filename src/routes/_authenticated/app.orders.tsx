import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listOrders } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/orders")({
  head: () => ({ meta: [{ title: "Pedidos — FulFillly" }] }),
  component: OrdersPage,
});

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  awaiting_shipment: "Aguardando envio",
  label_generated: "Etiqueta gerada",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  failed: "Falhou",
};

function OrdersPage() {
  const fetchOrders = useServerFn(listOrders);
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrders() });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Pedidos</h1>
      {orders.length === 0 ? (
        <Card className="grid place-items-center p-16 text-center">
          <p className="font-display text-xl">Nenhum pedido ainda</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Assim que seu TikTok Shop estiver conectado, novos pedidos chegam aqui em tempo real via webhook.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Criado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to="/app/orders/$id" params={{ id: o.id }} className="font-mono text-xs underline-offset-2 hover:underline">
                      {o.order_number ?? o.tiktok_order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{statusLabel[o.status] ?? o.status}</Badge></td>
                  <td className="px-4 py-3 text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(o.total))}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
