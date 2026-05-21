import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contato — FulFillly" },
      {
        name: "description",
        content: "Fale com a FulFillly. Vendas, parcerias, imprensa ou só pra dar um oi.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Contato</p>
          <h1 className="text-5xl md:text-6xl">
            Bora <span className="italic text-primary">conversar.</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Seja você uma marca pronta para escalar, um criador atrás de melhores deals ou um
            parceiro de fulfillment — queremos ouvir você.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-mono">hello@fulfillly.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>Resposta em até 1 dia útil</span>
            </div>
          </div>
        </div>

        <form
          className="rounded-3xl border border-border bg-card p-8 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            // A fase 1 conectará isto a uma server function / Resend.
            alert("Valeu! Entraremos em contato.");
          }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" required placeholder="João da Silva" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required placeholder="voce@marca.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="company">Empresa / @</Label>
              <Input id="company" placeholder="@suamarca" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" rows={5} required placeholder="Conta o que você está construindo…" className="mt-1.5" />
            </div>
            <Button type="submit" size="lg" className="w-full shadow-glow">
              Enviar mensagem
            </Button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
