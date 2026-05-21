import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — FulFillly" },
      {
        name: "description",
        content:
          "A FulFillly está construindo o sistema operacional do social commerce — conectando marcas, criadores, fulfillment e TikTok Shop.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Sobre</p>
        <h1 className="text-5xl md:text-6xl">
          Conectamos o que o social commerce <span className="italic">deixou desconectado.</span>
        </h1>
        <div className="mt-10 space-y-6 text-lg text-muted-foreground">
          <p>
            Marcas têm estoque. Criadores têm audiência. O TikTok tem os compradores. Mas a
            infraestrutura que une tudo isso — logística, atribuição, repasses — é uma bagunça de
            planilhas, DMs e integrações de uma vez só.
          </p>
          <p>
            A FulFillly é o sistema operacional desse fluxo. Damos às marcas um catálogo que pode
            ser enviado para qualquer lugar, aos criadores um marketplace transparente, aos
            parceiros de fulfillment uma fila limpa e ao TikTok Shop um parceiro que entrega no
            prazo.
          </p>
          <p>
            Estamos construindo os trilhos para uma nova geração de comércio. Fundadores vindos de
            logística, marketplaces e ferramentas para criadores. Sede no Brasil, pensado para o
            mundo.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
