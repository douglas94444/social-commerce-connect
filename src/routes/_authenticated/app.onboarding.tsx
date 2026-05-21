import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Store, MapPin, Radio } from "lucide-react";
import { toast } from "sonner";
import {
  getMyBrand,
  getOnboardingStatus,
  updateWarehouse,
} from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/onboarding")({
  head: () => ({ meta: [{ title: "Configuração — FulFillly" }] }),
  component: OnboardingPage,
});

const emptyWh = {
  name: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  postal_code: "",
  phone: "",
};

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getOnboardingStatus);
  const fetchBrand = useServerFn(getMyBrand);
  const saveWh = useServerFn(updateWarehouse);
  const { data: status } = useQuery({ queryKey: ["onboarding-status"], queryFn: () => fetchStatus() });
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });
  const [form, setForm] = useState(emptyWh);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand?.warehouse_address) {
      setForm({ ...emptyWh, ...(brand.warehouse_address as typeof emptyWh) });
    }
  }, [brand]);

  const step = !status?.tiktokConnected ? 1 : !status?.warehouseSet ? 2 : 3;
  const pct = status ? Math.round((status.stepsComplete / status.totalRequiredSteps) * 100) : 0;

  async function lookupCep() {
    const cep = form.postal_code.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      setForm((f) => ({
        ...f,
        street: data.logradouro || f.street,
        district: data.bairro || f.district,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
      toast.success("Endereço preenchido pelo CEP");
    } catch {
      toast.error("Não foi possível buscar o CEP");
    }
  }

  async function saveWarehouse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveWh({ data: form });
      toast.success("Armazém configurado");
      await qc.invalidateQueries({ queryKey: ["onboarding-status"] });
      await qc.invalidateQueries({ queryKey: ["my-brand"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function finish() {
    navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-8 py-10">
      <header>
        <h1 className="font-display text-4xl">Configure sua operação</h1>
        <p className="mt-2 text-muted-foreground">
          Três passos para começar a processar pedidos do TikTok Shop.
        </p>
        <Progress value={pct} className="mt-6 h-2" />
      </header>

      <Card className={`p-6 ${step === 1 ? "ring-2 ring-primary" : ""}`}>
        <div className="flex items-start gap-3">
          {status?.tiktokConnected ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <Store className="h-5 w-5" /> 1. Conectar TikTok Shop
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Autorize a FulFillly para importar produtos e receber pedidos via webhook.
            </p>
            <Button className="mt-4" asChild variant={status?.tiktokConnected ? "outline" : "default"}>
              <Link to="/app/setup">
                {status?.tiktokConnected ? "Ver integração" : "Conectar agora"}
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card className={`p-6 ${step === 2 ? "ring-2 ring-primary" : ""}`}>
        <div className="flex items-start gap-3">
          {status?.warehouseSet ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="flex-1">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <MapPin className="h-5 w-5" /> 2. Endereço do armazém
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Origem para cotação de frete e geração de etiquetas.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={saveWarehouse}>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 grid gap-1">
                  <Label className="text-xs">CEP</Label>
                  <Input
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    onBlur={lookupCep}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">UF</Label>
                  <Input
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Nome / Razão social</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 grid gap-1">
                  <Label className="text-xs">Rua</Label>
                  <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Número</Label>
                  <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Bairro</Label>
                <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Cidade</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando…" : "Salvar armazém"}
              </Button>
            </form>
          </div>
        </div>
      </Card>

      <Card className={`p-6 ${step === 3 ? "ring-2 ring-primary" : ""}`}>
        <div className="flex items-start gap-3">
          <Radio className="h-6 w-6 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="font-display text-xl">3. Aguardar primeiro pedido</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Com TikTok conectado, pedidos chegam automaticamente na fila. Você também pode criar um
              pedido de teste em Pedidos.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/app/orders">Ver pedidos</Link>
              </Button>
              {status?.requiredComplete && (
                <Button onClick={finish}>Ir para a fila</Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
