import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — FulFillly" }] }),
  component: SignupStub,
});

function SignupStub() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-4xl">Join the founding cohort</h1>
        <p className="mt-4 text-muted-foreground">
          We're onboarding founding brands and creators by hand. Drop us a line and we'll
          fast-track you when accounts open.
        </p>
        <Button asChild className="mt-8">
          <Link to="/contact">Get in touch</Link>
        </Button>
      </section>
    </SiteShell>
  );
}
