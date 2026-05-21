import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyBrand } from "@/lib/fulfillment.functions";

export const Route = createFileRoute("/_authenticated/app/settings/account")({
  head: () => ({ meta: [{ title: "Conta — FulFillly" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const fetchBrand = useServerFn(getMyBrand);
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-8 py-10">
      <Link
        to="/app/settings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-4xl">Conta e segurança</h1>

      <Card className="space-y-3 p-6">
        <h2 className="font-display text-lg">Perfil da marca</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between border-b border-border py-2">
            <dt className="text-muted-foreground">Nome</dt>
            <dd>{brand?.name || "—"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>{brand?.email || "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Alteração de senha e autenticação social serão disponibilizadas em breve.
        </p>
        <Button variant="destructive" className="mt-4" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sair da conta
        </Button>
      </Card>
    </div>
  );
}
