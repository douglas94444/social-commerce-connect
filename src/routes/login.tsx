import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — FulFillly" }] }),
  component: LoginStub,
});

function LoginStub() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-4xl">Log in</h1>
        <p className="mt-4 text-muted-foreground">
          Authentication ships in Phase 1. We'll wire email/password and Google sign-in via Lovable
          Cloud as soon as it's enabled on this project.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Back home</Link>
        </Button>
      </section>
    </SiteShell>
  );
}
