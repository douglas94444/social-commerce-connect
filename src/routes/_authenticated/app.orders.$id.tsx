import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Check, Circle, FileText, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  getMyBrand,
  getOrder,
  getOrderTimeline,
  markOrderShipped,
} from "@/lib/fulfillment.functions";
import { calculateShipping, generateLabel } from "@/lib/shipping.functions";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { isWarehouseComplete } from "@/lib/onboarding";

export const Route = createFileRoute("/_authenticated/app/orders/$id")({
  head: () => ({ meta: [{ title: "Pedido — FulFillly" }] }),
  component: OrderDetail,
});

const CARRIERS = ["Correios", "Jadlog", "Loggi", "Total Express", "Melhor Envio"];

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const fetchBrand = useServerFn(getMyBrand);
  const fetchTimeline = useServerFn(getOrderTimeline);
  const quoteFn = useServerFn(calculateShipping);
  const labelFn = useServerFn(generateLabel);
  const shipFn = useServerFn(markOrderShipped);
  const qc = useQueryClient();
  const [quotes, setQuotes] = useState<Array<{ id: number; name: string; price: string; deliveryDays: number }>>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { data: order } = useQuery({ queryKey: ["order", id], queryFn: () => fetchOrder({ data: { id } }) });
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });
  const { data: timeline = [] } = useQuery({
    queryKey: ["order-timeline", id],
    queryFn: () => fetchTimeline({ data: { orderId: id } }),
  });
  const [carrier, setCarrier] = useState("Correios");
  const [tracking, setTracking] = useState("");

  const quote = useMutation({
    mutationFn: () => quoteFn({ data: { orderId: id } }),
    onSuccess: (list) => {
      setQuotes(list);
      setQuoteOpen(true);
      if (!list.length) toast.error("Nenhuma cotação disponível para este pedido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const label = useMutation({
    mutationFn: (serviceId: number) => labelFn({ data: { orderId: id, serviceId } }),
    onSuccess: () => {
      setQuoteOpen(false);
      toast.success("Etiqueta gerada");
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["order-timeline", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const ship = useMutation({
    mutationFn: () => shipFn({ data: { id, carrier, tracking_code: tracking } }),
    onSuccess: (res) => {
      toast.success(
        res.tiktokSynced
          ? "Pedido enviado e sincronizado com o TikTok Shop."
          : "Pedido marcado como enviado. Verifique a sincronização com o TikTok.",
      );
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order-timeline", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!order) {
    return <div className="p-10 text-sm text-muted-foreground">Carregando pedido…</div>;
  }

  const addr = order.shipping_address as Record<string, string>;
  const items =
    (order.items as Array<{ title?: string; sku?: string; qty?: number; price?: number }>) ?? [];
  const hasLabel = !!order.shipping_label_url;
  const isShipped = order.status === "shipped" || order.status === "delivered";
  const warehouseOk = isWarehouseComplete(brand?.warehouse_address);
  const step1Done = hasLabel || order.status === "label_generated";
  const step2Done = isShipped;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-8 py-10">
      <Link
        to="/app/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">
            Pedido {order.order_number ?? order.tiktok_order_id}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Criado em {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {!warehouseOk && (
        <Card className="border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Configure o endereço do armazém antes de gerar etiquetas.{" "}
          <Link to="/app/settings" className="font-medium underline">
            Ir para configurações
          </Link>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg">Fluxo de envio</h2>
        <ol className="space-y-6">
          <li className="flex gap-4">
            {step1Done ? (
              <Check className="h-6 w-6 shrink-0 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 space-y-2">
              <p className="font-medium">1. Gerar etiqueta</p>
              {hasLabel ? (
                <a
                  href={order.shipping_label_url!}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center text-sm underline"
                >
                  <FileText className="mr-2 h-4 w-4" /> Baixar etiqueta
                </a>
              ) : (
                <>
                  <Button
                    onClick={() => quote.mutate()}
                    disabled={quote.isPending || label.isPending || !warehouseOk || isShipped}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {quote.isPending ? "Cotando…" : "Cotar e gerar etiqueta"}
                  </Button>
                  {quoteOpen && quotes.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-md border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">Escolha o frete</p>
                      {quotes.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted/50"
                          onClick={() => label.mutate(q.id)}
                          disabled={label.isPending}
                        >
                          <span>
                            {q.name} · {q.deliveryDays} dia(s)
                          </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(q.price))}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </li>

          <li className="flex gap-4">
            {step2Done ? (
              <Check className="h-6 w-6 shrink-0 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-muted-foreground" />
            )}
            <div className="flex-1 space-y-3">
              <p className="font-medium">2. Confirmar envio com rastreio</p>
              {!isShipped && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Transportadora</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                      >
                        {CARRIERS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Código de rastreio</Label>
                      <Input
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="BR123456789BR"
                      />
                    </div>
                  </div>
                  {hasLabel ? (
                    <Button
                      onClick={() => ship.mutate()}
                      disabled={ship.isPending || tracking.length < 3}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      {ship.isPending ? "Confirmando…" : "Confirmar envio"}
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={tracking.length < 3}>
                          <Truck className="mr-2 h-4 w-4" /> Confirmar sem etiqueta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Enviar sem etiqueta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O ideal é gerar a etiqueta antes. Você pode confirmar o envio mesmo assim
                            se já postou o pacote manualmente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => ship.mutate()}>
                            Confirmar envio
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
              {order.tracking_code && (
                <p className="text-xs text-muted-foreground">
                  Rastreio: <strong>{order.tracking_code}</strong> ({order.carrier})
                </p>
              )}
            </div>
          </li>
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 p-5 lg:col-span-2">
          <h2 className="font-display text-lg">Itens</h2>
          <ul className="divide-y divide-border text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{it.title ?? it.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU {it.sku} · Qtd {it.qty}
                  </p>
                </div>
                <span>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    Number(it.price ?? 0),
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 text-right text-sm">
            <p>
              Total: <strong>{fmt(Number(order.total))}</strong>
            </p>
          </div>
        </Card>

        <Card className="space-y-2 p-5">
          <h2 className="font-display text-lg">Cliente</h2>
          <p className="text-sm">{order.customer_name}</p>
          <h3 className="mt-4 text-sm font-medium">Endereço</h3>
          <p className="text-xs text-muted-foreground">
            {addr?.street}, {addr?.number}
            <br />
            {addr?.district} — {addr?.city}/{addr?.state}
            <br />
            CEP {addr?.postal_code}
          </p>
        </Card>
      </div>

      {timeline.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-lg">Histórico</h2>
          <ul className="space-y-3 border-l border-border pl-4">
            {timeline.map((ev) => (
              <li key={ev.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <p className="font-medium">{ev.label}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(ev.at).toLocaleString("pt-BR")}
                  {ev.detail ? ` · ${ev.detail}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
