import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import {
  getDashboardStats,
  getMyBrand,
  listUrgentOrders,
} from "@/lib/fulfillment.functions";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/app/")({
  component: InboxPage,
});

function InboxPage() {
  const fetchStats = useServerFn(getDashboardStats);
  const fetchBrand = useServerFn(getMyBrand);
  const fetchUrgent = useServerFn(listUrgentOrders);
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetchStats() });
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });
  const { data: urgent = [] } = useQuery({
    queryKey: ["urgent-orders"],
    queryFn: () => fetchUrgent(),
  });

  const kpis = [
    { label: "Pedidos hoje", value: String(stats?.ordersToday ?? 0), icon: ShoppingCart },
    { label: "Na fila", value: String(stats?.pending ?? 0), icon: Package },
    {
      label: "GMV da semana",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        stats?.gmvWeek ?? 0,
      ),
      icon: TrendingUp,
    },
    { label: "SKUs em baixo estoque", value: String(stats?.lowStock ?? 0), icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Fila de envio</h1>
          <p className="mt-2 text-muted-foreground">
            Processe primeiro o que está aguardando envio ou etiqueta.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/app/orders">Ver todos os pedidos</Link>
        </Button>
      </header>

      <section>
        <h2 className="mb-4 font-display text-lg">Ação necessária</h2>
        {urgent.length === 0 ? (
          <Card className="grid place-items-center p-12 text-center">
            <p className="font-display text-xl">Nada na fila agora</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Novos pedidos do TikTok Shop aparecem aqui automaticamente.
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
          <Card className="divide-y divide-border overflow-hidden">
            {urgent.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30"
              >
                <div>
                  <p className="font-mono text-sm">
                    {o.order_number ?? o.tiktok_order_id}
                  </p>
                  <p className="text-sm text-muted-foreground">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                  <Button size="sm" asChild>
                    <Link to="/app/orders/$id" params={{ id: o.id }}>
                      Processar <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg text-muted-foreground">Resumo</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{s.value}</p>
            </Card>
          ))}
        </div>
      </section>

      {brand && !brand.tiktok_shop_id && (
        <Card className="border-primary/30 bg-primary/5 p-6">
          <p className="text-sm">
            Conecte o TikTok Shop para importar pedidos automaticamente.{" "}
            <Link to="/app/setup" className="font-medium text-primary underline">
              Ir para integrações
            </Link>
          </p>
        </Card>
      )}
    </div>
  );
}
