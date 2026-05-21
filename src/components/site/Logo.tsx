import { Link } from "@tanstack/react-router";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
        <span className="font-display text-lg leading-none">F</span>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </span>
      <span className="font-display text-2xl tracking-tight">
        Ful<span className="italic text-primary">Fill</span>ly
      </span>
    </Link>
  );
}
