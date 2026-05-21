import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/for-brands")({
  head: () => ({
    meta: [
      { title: "Como funciona — FulFillly" },
      {
        name: "description",
        content:
          "Fulfillment TikTok Shop: conecte a loja, receba pedidos, gere etiquetas Melhor Envio e confirme envio com rastreio.",
      },
      { property: "og:title", content: "Como funciona — FulFillly" },
    ],
  }),
  component: ForBrands,
});

const features = [
  "Conexão OAuth com TikTok Shop Partner",
  "Webhook de pedidos em tempo real",
  "Fila operacional com prioridade FIFO",
  "Importação de catálogo e sync de estoque",
  "Etiquetas via Melhor Envio (Brasil)",
  "Confirmação de envio com rastreio no TikTok",
];

function ForBrands() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brand">Para marcas TikTok Shop</p>
        <h1 className="max-w-3xl text-balance text-5xl md:text-7xl">
          Fulfillment que <span className="italic text-primary">acompanha suas vendas.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A FulFillly recebe cada pedido do TikTok Shop, guia sua equipe na geração de etiquetas e
          devolve o rastreio à plataforma — para você focar em vender, não em planilhas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Começar fulfillment</Link>
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
