import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { listProducts, upsertProduct, deleteProduct } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/products")({
  head: () => ({ meta: [{ title: "Produtos — FulFillly" }] }),
  component: ProductsPage,
});

type Product = Awaited<ReturnType<typeof listProducts>>[number];

function ProductsPage() {
  const fetchProducts = useServerFn(listProducts);
  const removeFn = useServerFn(deleteProduct);
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Produto removido"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Produtos</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="mr-2 h-4 w-4" /> Novo produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
            <ProductForm initial={editing} onDone={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["products"] }); }} />
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card className="grid place-items-center p-16 text-center">
          <p className="font-display text-xl">Nenhum produto ainda</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Crie produtos manualmente ou conecte seu TikTok Shop para importar o catálogo.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3 text-right">Preço</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(p.price))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock < 5 ? "text-destructive" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Remover este produto?")) del.mutate(p.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ProductForm({ initial, onDone }: { initial: Product | null; onDone: () => void }) {
  const save = useServerFn(upsertProduct);
  const [form, setForm] = useState({
    id: initial?.id,
    sku: initial?.sku ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    price: Number(initial?.price ?? 0),
    stock: initial?.stock ?? 0,
    weight_grams: initial?.weight_grams ?? 0,
    length_cm: Number(initial?.length_cm ?? 0),
    width_cm: Number(initial?.width_cm ?? 0),
    height_cm: Number(initial?.height_cm ?? 0),
    image_url: initial?.image_url ?? "",
    active: initial?.active ?? true,
  });
  const mut = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => { toast.success("Produto salvo"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></Field>
        <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
      </div>
      <Field label="Descrição"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (BRL)"><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
        <Field label="Estoque"><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></Field>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Peso (g)"><Input type="number" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: Number(e.target.value) })} /></Field>
        <Field label="Compr. (cm)"><Input type="number" step="0.1" value={form.length_cm} onChange={(e) => setForm({ ...form, length_cm: Number(e.target.value) })} /></Field>
        <Field label="Largura (cm)"><Input type="number" step="0.1" value={form.width_cm} onChange={(e) => setForm({ ...form, width_cm: Number(e.target.value) })} /></Field>
        <Field label="Altura (cm)"><Input type="number" step="0.1" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })} /></Field>
      </div>
      <Field label="URL da imagem (opcional)"><Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></Field>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Salvando…" : "Salvar"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
