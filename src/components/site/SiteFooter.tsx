import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Produto",
    links: [
      { to: "/for-brands", label: "Para Marcas" },
      { to: "/for-creators", label: "Para Criadores" },
      { to: "/pricing", label: "Preços" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { to: "/about", label: "Sobre" },
      { to: "/contact", label: "Contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/", label: "Privacidade" },
      { to: "/", label: "Termos" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_3fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            O sistema operacional do social commerce. Conectamos marcas, criadores e fulfillment num
            só fluxo — feito para o TikTok Shop e além.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/70">
                {c.title}
              </p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FulFillly. Movendo o social commerce.</p>
          <p className="font-mono">v0.1 · MVP</p>
        </div>
      </div>
    </footer>
  );
}
