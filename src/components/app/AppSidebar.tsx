import { Link, useNavigate } from "@tanstack/react-router";
import {
  Inbox,
  Package,
  Plug,
  Settings,
  ShoppingCart,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardStats, getMyBrand } from "@/lib/fulfillment.functions";

const nav = [
  { to: "/app", label: "Fila de envio", icon: Inbox, exact: true, badgeKey: "pending" as const },
  { to: "/app/orders", label: "Pedidos", icon: ShoppingCart, exact: false },
  { to: "/app/products", label: "Catálogo", icon: Package, exact: false },
  { to: "/app/setup", label: "Integrações", icon: Plug, exact: false },
  { to: "/app/settings", label: "Configurações", icon: Settings, exact: false },
] as const;

export function AppSidebar() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getDashboardStats);
  const fetchBrand = useServerFn(getMyBrand);
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetchStats() });
  const { data: brand } = useQuery({ queryKey: ["my-brand"], queryFn: () => fetchBrand() });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-6 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-muted text-foreground" }}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            {"badgeKey" in item && (stats?.pending ?? 0) > 0 && (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                {stats?.pending}
              </Badge>
            )}
          </Link>
        ))}
        <Link
          to="/app/onboarding"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          Guia de configuração
        </Link>
      </nav>
      <div className="border-t border-border p-3 space-y-2">
        {brand?.name && (
          <p className="truncate px-3 text-xs text-muted-foreground" title={brand.name}>
            {brand.name || brand.email}
          </p>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
