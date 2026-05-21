import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/orders")({
  head: () => ({ meta: [{ title: "Pedidos — FulFillly" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Pedidos</h1>
      <Card className="grid place-items-center p-16 text-center">
        <p className="font-display text-xl">Nenhum pedido ainda</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Assim que seu TikTok Shop estiver conectado, novos pedidos chegam aqui em tempo real via webhook.
        </p>
      </Card>
    </div>
  );
}
