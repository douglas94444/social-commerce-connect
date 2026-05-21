import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Building2, Sparkles, Truck, Users, Zap } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FulFillly — Social commerce, fulfilled" },
      {
        name: "description",
        content:
          "FulFillly is the operating system for social commerce. Brands, creators, fulfillment, and TikTok Shop in one tight loop.",
      },
      { property: "og:title", content: "FulFillly — Social commerce, fulfilled" },
      {
        property: "og:description",
        content:
          "One platform that connects brands, creators, fulfillment centers, and TikTok Shop. Built for the next wave of social commerce.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <FlowSection />
      <PersonaSection />
      <RevenueSection />
      <CtaSection />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-spotlight"
        aria-hidden
      />
      <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Now onboarding founding brands & creators for TikTok Shop
          </div>

          <h1 className="text-balance text-5xl font-normal leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            Social commerce, <span className="italic text-primary">fulfilled.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            FulFillly is the operating system that connects brands, creators, fulfillment centers,
            and TikTok Shop into one continuous loop. Ship products. Drive sales. Pay creators.
            Automatically.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="shadow-glow">
              <Link to="/signup">
                Start free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-brands">See it for brands</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <Stat label="Brands onboarding" value="120+" />
            <Stat label="Creators waiting" value="4.2K" />
            <Stat label="Markets" value="BR · LATAM · US" />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-card md:grid-cols-3">
        {[
          { tag: "BRAND", title: "Aurora Skin uploads 42 SKUs", color: "brand" },
          { tag: "CREATOR", title: "@livia drives 1,284 orders", color: "creator" },
          { tag: "FULFILLMENT", title: "Shipped in 4h 12m avg.", color: "fulfillment" },
        ].map((c) => (
          <div
            key={c.tag}
            className="group relative overflow-hidden rounded-2xl border border-border bg-background p-5"
          >
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: `var(--persona-${c.color})`,
                backgroundColor: `color-mix(in oklch, var(--persona-${c.color}) 12%, transparent)`,
              }}
            >
              {c.tag}
            </span>
            <p className="mt-3 font-display text-xl leading-tight">{c.title}</p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: "72%",
                  backgroundColor: `var(--persona-${c.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  const items = [
    "TikTok Shop",
    "Shopee",
    "Mercado Livre",
    "Stripe Connect",
    "Resend",
    "Supabase",
    "pg_cron",
    "Webhooks",
  ];
  return (
    <section className="border-y border-border bg-muted/30 py-6">
      <div className="mx-auto flex max-w-7xl items-center gap-12 overflow-hidden px-6 text-sm text-muted-foreground">
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest">
          Integrates with
        </span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {items.map((i) => (
            <span key={i} className="font-medium text-foreground/70">
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  const steps = [
    {
      n: "01",
      icon: Building2,
      color: "brand",
      title: "Brands list & ship inventory",
      body: "Catalog flows into FulFillly. Stock arrives at our fulfillment partners. One source of truth.",
    },
    {
      n: "02",
      icon: Users,
      color: "creator",
      title: "Creators pick what to promote",
      body: "Browse approved catalogs, claim affiliate codes, post on TikTok. Performance tracked live.",
    },
    {
      n: "03",
      icon: Zap,
      color: "admin",
      title: "Orders auto-flow from TikTok Shop",
      body: "Webhook hits in milliseconds. Inventory reserved. Fulfillment task created. No spreadsheets.",
    },
    {
      n: "04",
      icon: Truck,
      color: "fulfillment",
      title: "Picked, packed, shipped, tracked",
      body: "Operations dashboard turns chaos into a Kanban. Tracking pushed back to TikTok automatically.",
    },
    {
      n: "05",
      icon: Boxes,
      color: "creator",
      title: "Creators paid. Brands paid. Repeat.",
      body: "Commission engine clears after delivery. Stripe Connect handles payouts. Brands see net GMV.",
    },
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          How it works
        </p>
        <h2 className="text-4xl md:text-5xl">One loop. Five players. Zero spreadsheets.</h2>
        <p className="mt-4 text-muted-foreground">
          FulFillly stitches together the parts of social commerce that nobody else connects.
        </p>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <div
            key={s.n}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
              <span
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in oklch, var(--persona-${s.color}) 14%, transparent)`,
                  color: `var(--persona-${s.color})`,
                }}
              >
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <h3 className="mt-6 font-display text-2xl leading-tight">{s.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonaSection() {
  const personas = [
    {
      color: "brand",
      kicker: "For Brands",
      title: "Stop duct-taping marketplaces.",
      body: "Sync your catalog, manage inventory across warehouses, and approve creators — all without writing a single integration.",
      href: "/for-brands",
    },
    {
      color: "creator",
      kicker: "For Creators",
      title: "Promote products that actually ship.",
      body: "Browse brands, claim links, post on TikTok, get paid. Real-time earnings, weekly payouts via Pix or Stripe.",
      href: "/for-creators",
    },
  ] as const;

  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
        {personas.map((p) => (
          <Link
            key={p.kicker}
            to={p.href}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-10 transition-all hover:-translate-y-1 hover:shadow-card"
          >
            <div
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: `var(--persona-${p.color})` }}
              aria-hidden
            />
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: `var(--persona-${p.color})` }}
            >
              {p.kicker}
            </p>
            <h3 className="mt-3 text-4xl">{p.title}</h3>
            <p className="mt-4 max-w-md text-muted-foreground">{p.body}</p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RevenueSection() {
  const streams = [
    { title: "Fulfillment fees", body: "Per pick, pack, and ship." },
    { title: "Storage", body: "Per m³ per month." },
    { title: "Platform commission", body: "% of GMV." },
    { title: "SaaS subscription", body: "Tiered for brand size." },
    { title: "Premium add-ons", body: "AI matching, white-label." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent-foreground/70">
          Built as a business
        </p>
        <h2 className="text-4xl md:text-5xl">Five revenue streams. One platform.</h2>
      </div>

      <div className="mt-12 grid gap-3 md:grid-cols-5">
        {streams.map((s, i) => (
          <div
            key={s.title}
            className="rounded-2xl border border-border bg-card p-5"
            style={{
              borderTopColor: i === 0 ? "var(--primary)" : undefined,
              borderTopWidth: i === 0 ? 2 : undefined,
            }}
          >
            <p className="font-mono text-xs text-muted-foreground">0{i + 1}</p>
            <p className="mt-3 font-display text-xl">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-hero p-12 text-primary-foreground shadow-glow md:p-16">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl">Ready when social commerce is.</h2>
          <p className="mt-4 text-primary-foreground/90">
            Join the founding cohort. Free during private beta. White-glove onboarding for the first
            100 brands.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Claim your spot</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>
    </section>
  );
}
