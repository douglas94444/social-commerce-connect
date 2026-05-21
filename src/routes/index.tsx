import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, Sparkles, Store, Truck, Zap } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FulFillly — Fulfillment para TikTok Shop" },
      {
        name: "description",
        content:
          "Conecte seu TikTok Shop, receba pedidos em tempo real, gere etiquetas e confirme envio com rastreio — tudo num só painel.",
      },
      { property: "og:title", content: "FulFillly — Fulfillment para TikTok Shop" },
      {
        property: "og:description",
        content:
          "A plataforma de fulfillment feita para marcas que vendem no TikTok Shop no Brasil.",
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
      <BenefitsSection />
      <CtaSection />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-spotlight" aria-hidden />
      <div
        className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            Fulfillment TikTok Shop para marcas no Brasil
          </div>

          <h1 className="text-balance text-5xl font-normal leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            Pedido chegou. <span className="italic text-primary">Etiqueta saiu.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Conecte sua loja TikTok Shop, receba pedidos via webhook, gere etiquetas com Melhor Envio
            e devolva o rastreio à plataforma — sem planilha, sem caos operacional.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="shadow-glow">
              <Link to="/signup">
                Começar fulfillment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-brands">Como funciona</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <Stat label="Tempo médio até etiqueta" value="menos de 5 min" />
            <Stat label="Integração" value="TikTok Shop" />
            <Stat label="Frete BR" value="Melhor Envio" />
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
          { tag: "PEDIDO", title: "Webhook em tempo real", color: "brand" },
          { tag: "ETIQUETA", title: "Melhor Envio integrado", color: "fulfillment" },
          { tag: "ENVIO", title: "Rastreio no TikTok", color: "admin" },
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
  const items = ["TikTok Shop", "Melhor Envio", "Supabase", "Webhooks", "Resend", "Cloudflare"];
  return (
    <section className="border-y border-border bg-muted/30 py-6">
      <div className="mx-auto flex max-w-7xl items-center gap-12 overflow-hidden px-6 text-sm text-muted-foreground">
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest">Integra com</span>
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
      icon: Store,
      color: "brand",
      title: "Conecte o TikTok Shop",
      body: "OAuth em minutos. Catálogo e pedidos sincronizados automaticamente.",
    },
    {
      n: "02",
      icon: Zap,
      color: "admin",
      title: "Pedidos na fila",
      body: "Webhook avisa na hora. Você vê o que precisa enviar hoje, em ordem FIFO.",
    },
    {
      n: "03",
      icon: Package,
      color: "fulfillment",
      title: "Gere a etiqueta",
      body: "Cotação e impressão via Melhor Envio com origem do seu armazém.",
    },
    {
      n: "04",
      icon: Truck,
      color: "fulfillment",
      title: "Confirme o envio",
      body: "Rastreio devolvido ao TikTok Shop. SLA protegido, cliente informado.",
    },
  ] as const;

  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Como funciona</p>
        <h2 className="text-4xl md:text-5xl">Do pedido ao rastreio em quatro passos.</h2>
        <p className="mt-4 text-muted-foreground">
          Feito para a operação de quem vende no TikTok Shop — não para marketplace de criadores.
        </p>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

function BenefitsSection() {
  const items = [
    { title: "Fila operacional", body: "Veja primeiro o que está aguardando envio." },
    { title: "Menos multa de SLA", body: "FIFO e alertas para não perder prazo TikTok." },
    { title: "Um painel só", body: "Pedidos, etiquetas e rastreio — sem alternar ferramentas." },
  ];
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
        {items.map((b) => (
          <div key={b.title} className="rounded-3xl border border-border bg-card p-8">
            <h3 className="font-display text-2xl">{b.title}</h3>
            <p className="mt-3 text-muted-foreground">{b.body}</p>
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
          <h2 className="text-4xl md:text-5xl">Envie mais rápido no TikTok Shop.</h2>
          <p className="mt-4 text-primary-foreground/90">
            Beta privado gratuito para as primeiras marcas. Onboarding guiado em menos de 10 minutos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Começar fulfillment</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/contact">Fale com a gente</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>
    </section>
  );
}
