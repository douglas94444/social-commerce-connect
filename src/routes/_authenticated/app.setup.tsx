import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Store } from "lucide-react";
import { getIntegrationHealth, getMyBrand } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/setup")({
  head: () => ({ meta: [{ title: "Integrações — FulFillly" }] }),
  component: SetupPage,
});

function SetupPage() {
  const fetchBrand = useServerFn(getMyBrand);
  const fetchHealth = useServerFn(getIntegrationHealth);
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });
  const { data: health } = useQuery({ queryKey: ["integration-health"], queryFn: () => fetchHealth() });

  const tiktokConnected = !!brand?.tiktok_shop_id;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <header>
        <h1 className="font-display text-4xl">Integrações</h1>
        <p className="mt-2 text-muted-foreground">
          Conecte o TikTok Shop e monitore a saúde dos webhooks.
        </p>
      </header>

      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl">
              <Store className="h-5 w-5" /> TikTok Shop
              {tiktokConnected && (
                <span className="inline-flex items-center text-xs font-normal text-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Conectado
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              OAuth oficial do TikTok Shop Partner. Após conectar, use &quot;Importar catálogo&quot; no
              catálogo.
            </p>
          </div>
          <Button disabled>
            {tiktokConnected ? "Reconectar — em breve" : "Conectar TikTok Shop — em breve"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A integração está em aprovação como Solution Partner. Enquanto isso, use{" "}
          <Link to="/app/orders" className="underline">
            pedido de teste
          </Link>{" "}
          para validar o fluxo de fulfillment.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://partner.tiktokshop.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentação TikTok Partner <ExternalLink className="ml-1 h-3 w-3 inline" />
          </a>
        </Button>
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="font-display text-lg">Saúde da integração</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-border py-2">
            <dt className="text-muted-foreground">Último webhook de pedido</dt>
            <dd className="text-right">
              {health?.lastWebhook
                ? new Date(health.lastWebhook.created_at).toLocaleString("pt-BR")
                : "Nenhum ainda"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">Última atividade de sync</dt>
            <dd className="text-right">
              {health?.lastSync
                ? `${health.lastSync.type} — ${new Date(health.lastSync.created_at).toLocaleString("pt-BR")}`
                : "Nenhuma ainda"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg">Melhor Envio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Etiquetas e frete no Brasil. Configure <code className="text-xs">MELHOR_ENVIO_TOKEN</code> no
          ambiente para ativar cotação e impressão.
        </p>
      </Card>
    </div>
  );
}
