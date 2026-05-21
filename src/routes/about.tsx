import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — FulFillly" },
      {
        name: "description",
        content:
          "A FulFillly é fulfillment para TikTok Shop — pedidos, etiquetas e rastreio num só painel.",
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
          Fulfillment feito para o <span className="italic">TikTok Shop.</span>
        </h1>
        <div className="mt-10 space-y-6 text-lg text-muted-foreground">
          <p>
            Marcas que vendem no TikTok Shop precisam enviar rápido — sem perder pedidos em
            planilhas ou atrasar o SLA da plataforma.
          </p>
          <p>
            A FulFillly conecta sua loja, recebe pedidos via webhook, guia a geração de etiquetas
            (Melhor Envio) e devolve o rastreio ao TikTok. Um painel, um fluxo, foco em operação.
          </p>
          <p>
            Estamos em beta privado no Brasil, construindo com marcas que escalam no social commerce.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
