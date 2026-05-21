import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/products")({
  head: () => ({ meta: [{ title: "Produtos — FulFillly" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Produtos</h1>
      <Card className="grid place-items-center p-16 text-center">
        <p className="font-display text-xl">Nenhum produto ainda</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Conecte seu TikTok Shop e seu catálogo aparece aqui automaticamente. A sincronização de
          estoque entra na próxima fase.
        </p>
      </Card>
    </div>
  );
}
