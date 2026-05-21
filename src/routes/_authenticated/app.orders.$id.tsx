import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Truck } from "lucide-react";
import { toast } from "sonner";
import { getOrder, generateLabel, markOrderShipped } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/orders/$id")({
  head: () => ({ meta: [{ title: "Pedido — FulFillly" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const labelFn = useServerFn(generateLabel);
  const shipFn = useServerFn(markOrderShipped);
  const qc = useQueryClient();
  const { data: order } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrder({ data: { id } }) });
  const [carrier, setCarrier] = useState("Correios");
  const [tracking, setTracking] = useState("");

  const label = useMutation({
    mutationFn: () => labelFn({ data: { id } }),
    onSuccess: () => { toast.success("Etiqueta gerada"); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const ship = useMutation({
    mutationFn: () => shipFn({ data: { id, carrier, tracking_code: tracking } }),
    onSuccess: () => { toast.success("Pedido enviado — TikTok atualizado"); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!order) return <div className="p-10 text-sm text-muted-foreground">Carregando pedido…</div>;
  const addr = order.shipping_address as Record<string, string>;
  const items = (order.items as Array<{ title?: string; sku?: string; qty?: number; price?: number }>) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-8 py-10">
      <Link to="/app/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para pedidos
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Pedido {order.order_number ?? order.tiktok_order_id}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Criado em {new Date(order.created_at).toLocaleString("pt-BR")}</p>
        </div>
        <Badge variant="secondary" className="text-sm">{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 p-5 lg:col-span-2">
          <h2 className="font-display text-lg">Itens</h2>
          <ul className="divide-y divide-border text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{it.title ?? it.sku}</p>
                  <p className="text-xs text-muted-foreground">SKU {it.sku} · Qtd {it.qty}</p>
                </div>
                <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(it.price ?? 0))}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 text-right text-sm">
            <p>Subtotal: <strong>{fmt(Number(order.subtotal))}</strong></p>
            <p>Frete: <strong>{fmt(Number(order.shipping_cost))}</strong></p>
            <p className="text-base">Total: <strong>{fmt(Number(order.total))}</strong></p>
          </div>
        </Card>

        <Card className="space-y-2 p-5">
          <h2 className="font-display text-lg">Cliente</h2>
          <p className="text-sm">{order.customer_name}</p>
          {order.customer_email && <p className="text-xs text-muted-foreground">{order.customer_email}</p>}
          {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
          <h3 className="mt-4 text-sm font-medium">Endereço</h3>
          <p className="text-xs text-muted-foreground">
            {addr?.street}, {addr?.number} {addr?.complement}<br />
            {addr?.district} — {addr?.city}/{addr?.state}<br />
            CEP {addr?.postal_code}
          </p>
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Envio</h2>
        {order.shipping_label_url ? (
          <a href={order.shipping_label_url} target="_blank" rel="noopener" className="inline-flex items-center text-sm underline">
            <FileText className="mr-2 h-4 w-4" /> Baixar etiqueta
          </a>
        ) : (
          <Button onClick={() => label.mutate()} disabled={label.isPending}>
            <FileText className="mr-2 h-4 w-4" /> {label.isPending ? "Gerando…" : "Gerar etiqueta"}
          </Button>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Transportadora</Label>
            <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Código de rastreio</Label>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="BR1234..." />
          </div>
        </div>
        <Button onClick={() => ship.mutate()} disabled={ship.isPending || tracking.length < 3} variant="default">
          <Truck className="mr-2 h-4 w-4" /> {ship.isPending ? "Confirmando…" : "Confirmar envio"}
        </Button>
        {order.tracking_code && (
          <p className="text-xs text-muted-foreground">Rastreio atual: <strong>{order.tracking_code}</strong> ({order.carrier})</p>
        )}
      </Card>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
