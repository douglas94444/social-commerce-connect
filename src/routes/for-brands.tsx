import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/for-brands")({
  head: () => ({
    meta: [
      { title: "For Brands — FulFillly" },
      {
        name: "description",
        content:
          "Sync your catalog to TikTok Shop, manage inventory, approve creators, and let FulFillly ship every order. Built for brands scaling on social.",
      },
      { property: "og:title", content: "For Brands — FulFillly" },
    ],
  }),
  component: ForBrands,
});

const features = [
  "Catalog & variant sync across marketplaces",
  "Multi-warehouse inventory with low-stock alerts",
  "Creator marketplace with custom commission rates",
  "Real-time order webhook from TikTok Shop",
  "Auto-generated shipping labels and tracking",
  "GMV, AOV, and SLA dashboards",
];

function ForBrands() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brand">For Brands</p>
        <h1 className="max-w-3xl text-balance text-5xl md:text-7xl">
          Run your social-commerce ops <span className="italic text-primary">on autopilot.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Upload your catalog once. We push it to TikTok Shop, hold your inventory, route every
          order to fulfillment, and pay your creators — while you focus on the brand.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Start for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/pricing">See pricing</Link>
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
