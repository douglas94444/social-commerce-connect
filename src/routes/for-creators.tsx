import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, LineChart, Sparkles, Wallet } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/for-creators")({
  head: () => ({
    meta: [
      { title: "Para Criadores — FulFillly" },
      {
        name: "description",
        content:
          "Escolha produtos que você ama, poste no TikTok, receba semanalmente. Ganhos em tempo real, comissões transparentes, sem DM com marcas.",
      },
      { property: "og:title", content: "Para Criadores — FulFillly" },
    ],
  }),
  component: ForCreators,
});

const perks = [
  { icon: Sparkles, title: "Catálogo curado", body: "Só marcas que entregam no prazo." },
  { icon: Coins, title: "Comissões transparentes", body: "Veja sua taxa antes de postar." },
  { icon: LineChart, title: "Analytics em tempo real", body: "Por vídeo, por produto." },
  { icon: Wallet, title: "Pagamentos semanais", body: "Pix no BR. Stripe no resto." },
];

function ForCreators() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-creator">
          Para Criadores
        </p>
        <h1 className="max-w-3xl text-balance text-5xl md:text-7xl">
          Poste o vídeo. <span className="italic text-creator">Receba.</span> Sem caos.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Navegue por marcas aprovadas, pegue um produto, poste seu TikTok. A gente cuida do link,
          do pedido, do envio e do seu pagamento. Sem DM. Sem planilha. Sem espera.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/signup">Entrar na lista de espera</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-creator/10 text-creator">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-xl">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
