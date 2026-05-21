import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Configurações — FulFillly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Configurações</h1>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl">TikTok Shop</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecte seu TikTok Shop para importar produtos e receber pedidos automaticamente.
          </p>
        </div>
        <Button disabled>Conectar TikTok Shop — em breve</Button>
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl">Endereço do armazém</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Usado como origem para cálculos de frete e geração de etiquetas.
          </p>
        </div>
        <Button variant="outline" disabled>
          Adicionar endereço — em breve
        </Button>
      </Card>
    </div>
  );
}
