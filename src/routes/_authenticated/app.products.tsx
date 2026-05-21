import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Download } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProduct,
  listProducts,
  updateProductStock,
  upsertProduct,
} from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/products")({
  head: () => ({ meta: [{ title: "Catálogo — FulFillly" }] }),
  component: CatalogPage,
});

type Product = Awaited<ReturnType<typeof listProducts>>[number];

function CatalogPage() {
  const fetchProducts = useServerFn(listProducts);
  const removeFn = useServerFn(deleteProduct);
  const stockFn = useServerFn(updateProductStock);
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  const del = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveStock = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => stockFn({ data: { id, stock } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estoque atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Catálogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Importe do TikTok Shop ou cadastre SKUs manualmente para testes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/setup">
              <Download className="mr-2 h-4 w-4" /> Importar do TikTok
            </Link>
          </Button>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="mr-2 h-4 w-4" /> Novo SKU manual
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
              </DialogHeader>
              <ProductForm
                initial={editing}
                onDone={() => {
                  setOpen(false);
                  setEditing(null);
                  qc.invalidateQueries({ queryKey: ["products"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="grid place-items-center p-16 text-center">
          <p className="font-display text-xl">Catálogo vazio</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Conecte o TikTok Shop para importar produtos automaticamente ou adicione um SKU manual.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/app/setup">Importar do TikTok</Link>
            </Button>
            <Button variant="outline" onClick={() => setOpen(true)}>
              Novo SKU manual
            </Button>
          </div>
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
              {products.map((p) => {
                const stockVal = stockEdits[p.id] ?? String(p.stock);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3 text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(p.price))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          className="h-8 w-20 text-right"
                          value={stockVal}
                          onChange={(e) =>
                            setStockEdits((s) => ({ ...s, [p.id]: e.target.value }))
                          }
                          onBlur={() => {
                            const n = parseInt(stockVal, 10);
                            if (!Number.isNaN(n) && n !== p.stock) {
                              saveStock.mutate({ id: p.id, stock: n });
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover este produto?")) del.mutate(p.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function ProductForm({
  initial,
  onDone,
}: {
  initial: Product | null;
  onDone: () => void;
}) {
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
    onSuccess: () => {
      toast.success("Produto salvo");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU">
          <Input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />
        </Field>
        <Field label="Título">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>
      </div>
      <Field label="Descrição">
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (BRL)">
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </Field>
        <Field label="Estoque">
          <Input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mut.isPending}>
          {mut.isPending ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
