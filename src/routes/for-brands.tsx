import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/for-brands")({
  head: () => ({
    meta: [
      { title: "Para Marcas — FulFillly" },
      {
        name: "description",
        content:
          "Sincronize seu catálogo com o TikTok Shop, gerencie estoque, aprove criadores e deixe a FulFillly enviar cada pedido. Feito para marcas escalando no social.",
      },
      { property: "og:title", content: "Para Marcas — FulFillly" },
    ],
  }),
  component: ForBrands,
});

const features = [
  "Sincronização de catálogo e variantes entre marketplaces",
  "Estoque multi-armazém com alertas de baixo estoque",
  "Marketplace de criadores com comissões personalizadas",
  "Webhook de pedidos em tempo real do TikTok Shop",
  "Etiquetas e rastreio gerados automaticamente",
  "Dashboards de GMV, ticket médio e SLA",
];

function ForBrands() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brand">Para Marcas</p>
        <h1 className="max-w-3xl text-balance text-5xl md:text-7xl">
          Rode sua operação de social commerce <span className="italic text-primary">no piloto automático.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Suba seu catálogo uma única vez. A gente envia para o TikTok Shop, segura seu estoque,
          encaminha cada pedido para o fulfillment e paga seus criadores — enquanto você foca na
          marca.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Começar grátis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/pricing">Ver preços</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <p className="text-sm">{f}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
