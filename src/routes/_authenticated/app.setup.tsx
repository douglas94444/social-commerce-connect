import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Store } from "lucide-react";
import { toast } from "sonner";
import { getIntegrationHealth, getMyBrand } from "@/lib/fulfillment.functions";
import {
  disconnectTikTokShop,
  getTikTokConnectUrl,
  importTikTokProducts,
} from "@/lib/tiktok.functions";

export const Route = createFileRoute("/_authenticated/app/setup")({
  validateSearch: (s: Record<string, unknown>) => ({
    tiktok: typeof s.tiktok === "string" ? s.tiktok : undefined,
    message: typeof s.message === "string" ? s.message : undefined,
  }),
  head: () => ({ meta: [{ title: "Integrações — FulFillly" }] }),
  component: SetupPage,
});

function SetupPage() {
  const { tiktok, message } = useSearch({ from: "/_authenticated/app/setup" });
  const qc = useQueryClient();
  const fetchBrand = useServerFn(getMyBrand);
  const fetchHealth = useServerFn(getIntegrationHealth);
  const connectFn = useServerFn(getTikTokConnectUrl);
  const importFn = useServerFn(importTikTokProducts);
  const disconnectFn = useServerFn(disconnectTikTokShop);

  const { data: brand, refetch: refetchBrand } = useQuery({
    queryKey: ["my-brand"],
    queryFn: () => fetchBrand(),
  });
  const { data: health } = useQuery({
    queryKey: ["integration-health"],
    queryFn: () => fetchHealth(),
  });

  const tiktokConnected = !!brand?.tiktok_shop_id;

  useEffect(() => {
    if (tiktok === "connected") {
      toast.success("TikTok Shop conectado com sucesso.");
      void refetchBrand();
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    }
    if (tiktok === "error" && message) {
      toast.error(decodeURIComponent(message));
    }
  }, [tiktok, message, refetchBrand, qc]);

  async function onConnect() {
    try {
      const { url } = await connectFn();
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível iniciar OAuth");
    }
  }

  async function onImport() {
    try {
      const r = await importFn();
      toast.success(`${r.imported} produto(s) importados (${r.total} no TikTok).`);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na importação");
    }
  }

  async function onDisconnect() {
    if (!confirm("Desconectar TikTok Shop desta marca?")) return;
    try {
      await disconnectFn();
      toast.success("TikTok desconectado");
      void refetchBrand();
      qc.invalidateQueries({ queryKey: ["onboarding-status"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao desconectar");
    }
  }

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
              OAuth oficial do TikTok Shop Partner. Loja:{" "}
              <code className="text-xs">{brand?.tiktok_shop_id ?? "—"}</code>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onConnect} variant={tiktokConnected ? "outline" : "default"}>
              {tiktokConnected ? "Reconectar" : "Conectar TikTok Shop"}
            </Button>
            {tiktokConnected && (
              <>
                <Button variant="secondary" onClick={onImport}>
                  Importar catálogo
                </Button>
                <Button variant="ghost" onClick={onDisconnect}>
                  Desconectar
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure o webhook no Partner Center apontando para{" "}
          <code className="text-xs">/api/public/tiktok/webhook</code> do seu domínio.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="https://partner.tiktokshop.com/" target="_blank" rel="noopener noreferrer">
            Documentação TikTok Partner <ExternalLink className="ml-1 inline h-3 w-3" />
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
          Worker para cotação e impressão nos pedidos.
        </p>
      </Card>
    </div>
  );
}
