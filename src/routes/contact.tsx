import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — FulFillly" },
      {
        name: "description",
        content: "Talk to FulFillly. Sales, partnerships, press, or just to say hi.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Contact</p>
          <h1 className="text-5xl md:text-6xl">
            Let's <span className="italic text-primary">talk.</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Whether you're a brand ready to scale, a creator chasing better deals, or a fulfillment
            partner — we want to hear from you.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-mono">hello@fulfillly.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>Response within 1 business day</span>
            </div>
          </div>
        </div>

        <form
          className="rounded-3xl border border-border bg-card p-8 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            // Phase 1 will wire this to a server function / Resend.
            alert("Thanks! We'll be in touch.");
          }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required placeholder="Jane Doe" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@brand.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="company">Company / Handle</Label>
              <Input id="company" placeholder="@yourbrand" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} required placeholder="Tell us what you're building…" className="mt-1.5" />
            </div>
            <Button type="submit" size="lg" className="w-full shadow-glow">
              Send message
            </Button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
