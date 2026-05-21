import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Preços — FulFillly" },
      {
        name: "description",
        content:
          "Preços transparentes para marcas e criadores. Grátis durante o beta privado. SaaS em planos + taxas de fulfillment e comissão.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    sub: "durante o beta privado",
    features: ["Até 50 SKUs", "1 TikTok Shop", "Analytics básico", "Suporte por e-mail"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Growth",
    price: "R$ 499",
    sub: "/ mês",
    features: [
      "SKUs ilimitados",
      "Todos os marketplaces",
      "Marketplace de criadores",
      "Fulfillment prioritário",
      "Repasses via Stripe Connect",
    ],
    cta: "Falar com vendas",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "para marcas escalando",
    features: [
      "CSM dedicado",
      "Multi-armazém",
      "Portal de criadores white-label",
      "Acesso à API e SLA",
      "Integrações sob medida",
    ],
    cta: "Fale com a gente",
    highlight: false,
  },
];

function Pricing() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl md:text-6xl">
            Preços que <span className="italic text-primary">escalam com você.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Planos para a camada SaaS. Fulfillment e comissões cobrados por transação.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border bg-card p-8 ${
                p.highlight
                  ? "border-primary shadow-glow"
                  : "border-border"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Mais popular
                </span>
              )}
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {p.name}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.sub}</span>
              </div>
              <Button
                className="mt-6 w-full"
                variant={p.highlight ? "default" : "outline"}
                asChild
              >
                <Link to={p.highlight ? "/contact" : "/signup"}>{p.cta}</Link>
              </Button>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
