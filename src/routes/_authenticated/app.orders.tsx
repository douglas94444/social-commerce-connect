import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createTestOrder, listOrders } from "@/lib/fulfillment.functions";
import { ORDER_STATUS_LABELS, type OrderStatusFilter } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/app/orders")({
  head: () => ({ meta: [{ title: "Pedidos — FulFillly" }] }),
  component: OrdersPage,
});

const filters: { key: OrderStatusFilter; label: string }[] = [
  { key: "inbox", label: "Na fila" },
  { key: "awaiting_shipment", label: "Aguardando envio" },
  { key: "label_generated", label: "Etiqueta gerada" },
  { key: "shipped", label: "Enviados" },
  { key: "all", label: "Todos" },
];

function OrdersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState<OrderStatusFilter>("inbox");
  const [search, setSearch] = useState("");
  const fetchOrders = useServerFn(listOrders);
  const testOrderFn = useServerFn(createTestOrder);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", status, search],
    queryFn: () =>
      fetchOrders({
        data: { status, search: search.trim() || undefined },
      }),
  });

  const createTest = useMutation({
    mutationFn: () => testOrderFn(),
    onSuccess: (res) => {
      toast.success("Pedido de teste criado");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["urgent-orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      if (res?.id) navigate({ to: "/app/orders/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-4xl">Pedidos</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTest.mutate()}
          disabled={createTest.isPending}
        >
          {createTest.isPending ? "Criando…" : "Criar pedido de teste"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={status === f.key ? "default" : "outline"}
            onClick={() => setStatus(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Input
        placeholder="Buscar por pedido, cliente ou rastreio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : orders.length === 0 ? (
        <Card className="grid place-items-center p-16 text-center">
          <p className="font-display text-xl">Nenhum pedido encontrado</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Conecte o TikTok Shop ou crie um pedido de teste para validar o fluxo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/app/setup">Conectar TikTok</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/settings">Configurar armazém</Link>
            </Button>
          </div>
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"
                  onClick={() => navigate({ to: "/app/orders/$id", params: { id: o.id } })}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {o.order_number ?? o.tiktok_order_id}
                  </td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      Number(o.total),
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/app/orders/$id" params={{ id: o.id }}>
                        Abrir
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
