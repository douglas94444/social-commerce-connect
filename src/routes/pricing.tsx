import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — FulFillly" },
      {
        name: "description",
        content:
          "Transparent pricing for brands and creators. Free during private beta. Tiered SaaS plus fulfillment & commission fees.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Starter",
    price: "Free",
    sub: "during private beta",
    features: ["Up to 50 SKUs", "1 TikTok Shop", "Basic analytics", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "R$ 499",
    sub: "/ month",
    features: [
      "Unlimited SKUs",
      "All marketplaces",
      "Creator marketplace",
      "Priority fulfillment",
      "Stripe Connect payouts",
    ],
    cta: "Talk to sales",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "for scaling brands",
    features: [
      "Dedicated CSM",
      "Multi-warehouse",
      "White-label creator portal",
      "API access & SLA",
      "Custom integrations",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

function Pricing() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl md:text-6xl">
            Pricing that <span className="italic text-primary">scales with you.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Plans for the SaaS layer. Fulfillment and commissions billed per transaction.
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
                  Most popular
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
