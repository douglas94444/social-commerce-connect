import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { getDashboardStats, getMyBrand } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchStats = useServerFn(getDashboardStats);
  const fetchBrand = useServerFn(getMyBrand);
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetchStats() });
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });

  const cards = [
    { label: "Pedidos hoje", value: String(stats?.ordersToday ?? 0), icon: ShoppingCart },
    { label: "Fulfillment pendente", value: String(stats?.pending ?? 0), icon: Package },
    {
      label: "GMV da semana",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats?.gmvWeek ?? 0),
      icon: TrendingUp,
    },
    { label: "SKUs em baixo estoque", value: String(stats?.lowStock ?? 0), icon: AlertTriangle },
  ];

  const tiktokConnected = !!brand?.tiktok_shop_id;
  const warehouseSet = !!brand?.warehouse_address;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl">Bem-vindo à FulFillly</h1>
          <p className="mt-2 text-muted-foreground">
            Seu cockpit de fulfillment para o TikTok Shop.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/settings">
            Configurações <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8">
        <h2 className="font-display text-2xl">Configure em 3 passos</h2>
        <ol className="mt-6 space-y-4 text-sm">
          <Step n={1} done={tiktokConnected} title="Conecte seu TikTok Shop" desc="Autorize a FulFillly e importamos seu catálogo automaticamente." />
          <Step n={2} done={warehouseSet} title="Defina o endereço do seu armazém" desc="Usado para calcular o frete e gerar as etiquetas." />
          <Step n={3} done={(stats?.ordersToday ?? 0) > 0} title="Receba seu primeiro pedido" desc="Os pedidos chegam via webhook — gere a etiqueta, marque como enviado, pronto." />
        </ol>
      </Card>
    </div>
  );
}

function Step({ n, done, title, desc }: { n: number; done: boolean; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${done ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        {done ? "✓" : n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}
