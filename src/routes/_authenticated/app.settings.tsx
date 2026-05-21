import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Store } from "lucide-react";
import { getMyBrand, updateWarehouse } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Configurações — FulFillly" }] }),
  component: SettingsPage,
});

const empty = { name: "", street: "", number: "", complement: "", district: "", city: "", state: "", postal_code: "", phone: "" };

function SettingsPage() {
  const fetchBrand = useServerFn(getMyBrand);
  const saveWh = useServerFn(updateWarehouse);
  const qc = useQueryClient();
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (brand?.warehouse_address) setForm({ ...empty, ...(brand.warehouse_address as typeof empty) });
  }, [brand]);

  const save = useMutation({
    mutationFn: () => saveWh({ data: form }),
    onSuccess: () => { toast.success("Endereço do armazém salvo"); qc.invalidateQueries({ queryKey: ["my-brand"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const tiktokConnected = !!brand?.tiktok_shop_id;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <h1 className="font-display text-4xl">Configurações</h1>

      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl flex items-center gap-2">
              <Store className="h-5 w-5" /> TikTok Shop
              {tiktokConnected && <span className="inline-flex items-center text-xs text-green-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Conectado</span>}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Conecte seu TikTok Shop para importar produtos e receber pedidos automaticamente.
            </p>
          </div>
          <Button disabled>
            {tiktokConnected ? "Reconectar — em breve" : "Conectar TikTok Shop — em breve"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A integração OAuth oficial do TikTok Shop Partner está em processo de aprovação. Enquanto isso, você pode cadastrar pedidos manualmente para testar o fluxo de fulfillment.
        </p>
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl">Endereço do armazém</h2>
          <p className="mt-1 text-sm text-muted-foreground">Usado como origem nos cálculos de frete e na geração de etiquetas.</p>
        </div>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <F label="Nome / Razão social"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></F>
          <div className="grid grid-cols-3 gap-3">
            <F label="CEP" className="col-span-1"><Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} required /></F>
            <F label="Cidade" className="col-span-1"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></F>
            <F label="UF" className="col-span-1"><Input maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} required /></F>
          </div>
          <F label="Bairro"><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required /></F>
          <div className="grid grid-cols-3 gap-3">
            <F label="Rua" className="col-span-2"><Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required /></F>
            <F label="Número"><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Complemento"><Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} /></F>
            <F label="Telefone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></F>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar endereço"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`grid gap-1.5 ${className ?? ""}`}><Label className="text-xs">{label}</Label>{children}</div>;
}
