import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Building2, Sparkles, Truck, Users, Zap } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FulFillly — Social commerce, entregue" },
      {
        name: "description",
        content:
          "FulFillly é o sistema operacional do social commerce. Marcas, criadores, fulfillment e TikTok Shop num único fluxo.",
      },
      { property: "og:title", content: "FulFillly — Social commerce, entregue" },
      {
        property: "og:description",
        content:
          "Uma plataforma que conecta marcas, criadores, centros de fulfillment e TikTok Shop. Feita para a nova onda do social commerce.",
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
            Onboarding aberto para marcas e criadores fundadores do TikTok Shop
          </div>

          <h1 className="text-balance text-5xl font-normal leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            Social commerce, <span className="italic text-primary">entregue.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            A FulFillly é o sistema operacional que conecta marcas, criadores, centros de fulfillment
            e TikTok Shop num fluxo contínuo. Envie produtos. Gere vendas. Pague criadores.
            Automaticamente.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="shadow-glow">
              <Link to="/signup">
                Começar grátis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/for-brands">Ver para marcas</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            <Stat label="Marcas em onboarding" value="120+" />
            <Stat label="Criadores na fila" value="4,2K" />
            <Stat label="Mercados" value="BR · LATAM · US" />
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
          { tag: "MARCA", title: "Aurora Skin sobe 42 SKUs", color: "brand" },
          { tag: "CRIADOR", title: "@livia gera 1.284 pedidos", color: "creator" },
          { tag: "FULFILLMENT", title: "Enviado em 4h 12m em média", color: "fulfillment" },
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
          Integra com
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
      title: "Marcas cadastram e enviam estoque",
      body: "Catálogo entra na FulFillly. Estoque chega aos nossos parceiros de fulfillment. Uma única fonte da verdade.",
    },
    {
      n: "02",
      icon: Users,
      color: "creator",
      title: "Criadores escolhem o que promover",
      body: "Navegam por catálogos aprovados, pegam links de afiliado e postam no TikTok. Performance acompanhada em tempo real.",
    },
    {
      n: "03",
      icon: Zap,
      color: "admin",
      title: "Pedidos fluem do TikTok Shop",
      body: "O webhook chega em milissegundos. Estoque reservado. Tarefa de fulfillment criada. Sem planilhas.",
    },
    {
      n: "04",
      icon: Truck,
      color: "fulfillment",
      title: "Separado, embalado, enviado, rastreado",
      body: "Dashboard de operações transforma o caos em Kanban. Rastreio devolvido ao TikTok automaticamente.",
    },
    {
      n: "05",
      icon: Boxes,
      color: "creator",
      title: "Criadores pagos. Marcas pagas. Repete.",
      body: "Motor de comissões libera após a entrega. Stripe Connect cuida dos repasses. Marcas veem o GMV líquido.",
    },
  ] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          Como funciona
        </p>
        <h2 className="text-4xl md:text-5xl">Um fluxo. Cinco atores. Zero planilhas.</h2>
        <p className="mt-4 text-muted-foreground">
          A FulFillly costura as partes do social commerce que ninguém conecta.
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
      kicker: "Para Marcas",
      title: "Pare de remendar marketplaces.",
      body: "Sincronize seu catálogo, gerencie estoque em múltiplos armazéns e aprove criadores — sem escrever nenhuma integração.",
      href: "/for-brands",
    },
    {
      color: "creator",
      kicker: "Para Criadores",
      title: "Promova produtos que realmente chegam.",
      body: "Explore marcas, pegue links, poste no TikTok, receba. Ganhos em tempo real e repasses semanais via Pix ou Stripe.",
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
              Saiba mais <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RevenueSection() {
  const streams = [
    { title: "Taxas de fulfillment", body: "Por separação, embalagem e envio." },
    { title: "Armazenagem", body: "Por m³ por mês." },
    { title: "Comissão da plataforma", body: "% do GMV." },
    { title: "Assinatura SaaS", body: "Planos por porte da marca." },
    { title: "Add-ons premium", body: "Match com IA, white-label." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent-foreground/70">
          Construído como negócio
        </p>
        <h2 className="text-4xl md:text-5xl">Cinco fontes de receita. Uma plataforma.</h2>
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
          <h2 className="text-4xl md:text-5xl">Pronto quando o social commerce estiver.</h2>
          <p className="mt-4 text-primary-foreground/90">
            Entre no grupo fundador. Grátis durante o beta privado. Onboarding white-glove para as
            100 primeiras marcas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Garantir minha vaga</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/contact">Fale com a gente</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>
    </section>
  );
}
