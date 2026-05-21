import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardPage,
});

const stats = [
  { label: "Pedidos hoje", value: "0", icon: ShoppingCart },
  { label: "Fulfillment pendente", value: "0", icon: Package },
  { label: "GMV da semana", value: "R$ 0", icon: TrendingUp },
  { label: "SKUs em baixo estoque", value: "0", icon: AlertTriangle },
];

function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl">Bem-vindo à FulFillly</h1>
          <p className="mt-2 text-muted-foreground">
            Seu cockpit de fulfillment para o TikTok Shop. Conecte sua loja para começar a receber pedidos.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/settings">
            Conectar TikTok Shop <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
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
          <li className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <div>
              <p className="font-medium">Conecte seu TikTok Shop</p>
              <p className="mt-1 text-muted-foreground">
                Autorize a FulFillly e importamos seu catálogo automaticamente.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
              2
            </span>
            <div>
              <p className="font-medium">Defina o endereço do seu armazém</p>
              <p className="mt-1 text-muted-foreground">
                Usado para calcular o frete e gerar as etiquetas.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
              3
            </span>
            <div>
              <p className="font-medium">Receba seu primeiro pedido</p>
              <p className="mt-1 text-muted-foreground">
                Os pedidos chegam via webhook — gere a etiqueta, marque como enviado, pronto.
              </p>
            </div>
          </li>
        </ol>
      </Card>
    </div>
  );
}
